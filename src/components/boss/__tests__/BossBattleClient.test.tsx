import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import type { UserEvent } from '@testing-library/user-event'
import BossBattleClient from '../BossBattleClient'
import { demoQuestions } from '@/content/demo-questions'
import type { recordAnswer } from '@/app/(app)/topics/[slug]/practice/actions'

const { recordAnswerMock } = vi.hoisted(() => ({
  recordAnswerMock: vi.fn<typeof recordAnswer>(async () => ({ ok: true, xpEarned: 0 })),
}))

vi.mock('@/app/(app)/topics/[slug]/practice/actions', () => ({
  recordAnswer: recordAnswerMock,
}))

// Topbar (rendered by BossBattleClient) uses next/navigation's useRouter
// for its sign-out menu item - not under test here, so stub it the same
// way PracticePageClient's/the a11y suite's tests do.
vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: vi.fn(), refresh: vi.fn(), replace: vi.fn() }),
}))

// demoQuestions' correct MCQ option is always letter B and the wrong one
// is always letter A (see src/content/demo-questions.ts) - every helper
// below relies on that.
const CORRECT_LETTER = 'B'
const WRONG_LETTER = 'A'

function renderBattle(overrides: Partial<React.ComponentProps<typeof BossBattleClient>> = {}) {
  return render(
    <BossBattleClient
      topicSlug="trig-gr11"
      topicName="Trigonometry"
      questions={demoQuestions}
      isDemo
      userId="demo-user"
      video={null}
      {...overrides}
    />
  )
}

// NOTE: every button lookup below matches on a button's own exact text
// via getByText(..., { selector: 'button' }) rather than
// getByRole('button', { name }). The battle screens render questions and
// steps through MathRenderer (KaTeX), and computing an element's
// accessible *name* (what getByRole's `name` matcher needs) walks every
// KaTeX-generated node in the tree - jsdom has a known crash
// ("Array.prototype.forEach called on null or undefined" deep inside
// getComputedStyle) when dom-accessibility-api does that over KaTeX
// output. Plain text matching sidesteps it entirely.

async function startBattle(user: UserEvent, readinessText = 'Kind of know it') {
  await user.click(screen.getByText(readinessText, { selector: 'button' }))
  await user.click(screen.getByText('Start battle', { selector: 'button' }))
}

/** Answers the current question's MCQ with the given letter. Matches on
 * the option button's own text starting with the bare letter badge
 * (rendered before the KaTeX-rendered option content) rather than an
 * exact-text lookup - KaTeX can render a bare "A"/"B" as its own span for
 * a variable name inside the option's math, which would make
 * getByText(letter) ambiguous. */
async function answerMcq(user: UserEvent, letter: string) {
  const button = screen
    .getAllByRole('button')
    .find((el) => el.textContent?.trim().startsWith(letter))
  if (!button) {
    throw new Error(`No option button starting with letter "${letter}" found`)
  }
  await user.click(button)
}

/** Clears every step of the current question's step review with full
 * credit ("I know this" -> "Yes, I had this"), then leaves the steps
 * sheet via its final "Continue" button - the flow BattleScreen puts the
 * student through after a wrong MCQ answer that doesn't exhaust shields. */
async function clearStepsWithFullCredit(user: UserEvent, totalSteps: number) {
  for (let i = 0; i < totalSteps; i++) {
    await user.click(screen.getByText('I know this', { selector: 'button' }))
    await user.click(screen.getByText('Yes, I had this', { selector: 'button' }))
  }
  await user.click(screen.getByText('Continue', { selector: 'button' }))
}

beforeEach(() => {
  vi.clearAllMocks()
  window.localStorage.clear()
})

describe('BossBattleClient happy path (victory)', () => {
  it('walks intro -> readiness -> correct MCQs -> HP drops -> victory screen', async () => {
    // Arrange
    const user = userEvent.setup()
    renderBattle()

    // Act - intro screen
    expect(screen.getByText('How ready do you feel for this topic?')).toBeInTheDocument()
    await startBattle(user)

    // Assert - first correct answer deals damage (question 1 is worth 2
    // marks; boss max HP is the sum of every demo question's marks = 14)
    await answerMcq(user, CORRECT_LETTER)
    expect(screen.getByText('Direct hit! 2 damage dealt.')).toBeInTheDocument()
    expect(screen.getByText('12/14 HP')).toBeInTheDocument()

    // Act - answer every remaining question correctly too
    for (let i = 1; i < demoQuestions.length; i++) {
      await user.click(screen.getByText('Next round', { selector: 'button' }))
      await answerMcq(user, CORRECT_LETTER)
    }

    // Assert - defeating the boss on the last correct answer goes
    // straight to the victory screen (no intermediate feedback screen)
    expect(screen.getByText('You defeated The Tangent Titan!', { selector: 'h1' })).toBeInTheDocument()
  })
})

describe('BossBattleClient retreat path', () => {
  it('retreats after losing all 3 shields and keeps the XP earned so far', async () => {
    // Arrange
    const user = userEvent.setup()
    renderBattle()
    await startBattle(user)

    // Act - question 1: wrong MCQ (shields 3 -> 2), recover its 2 marks
    // via full-credit step review
    await answerMcq(user, WRONG_LETTER)
    expect(screen.queryByText('No shields left')).not.toBeInTheDocument()
    await clearStepsWithFullCredit(user, demoQuestions[0].steps.length)

    // Question 2: wrong MCQ (shields 2 -> 1), recover its 3 marks
    await answerMcq(user, WRONG_LETTER)
    await clearStepsWithFullCredit(user, demoQuestions[1].steps.length)

    // Question 3: wrong MCQ - this was the last shield, so it goes
    // straight to the retreat screen (no step review for this one)
    await answerMcq(user, WRONG_LETTER)

    // Assert - retreat screen, with the XP from the two recovered
    // questions (2 + 3 = 5 marks, no combo multiplier since every MCQ
    // this battle was wrong) kept, not reset to 0
    expect(screen.getByText('Retreated')).toBeInTheDocument()
    expect(screen.getByText('+50')).toBeInTheDocument()
    expect(screen.getByText('5/14')).toBeInTheDocument()
  })

  it('does not persist to the server in demo mode', async () => {
    // Arrange
    const user = userEvent.setup()
    renderBattle()
    await startBattle(user)

    // Act
    await answerMcq(user, CORRECT_LETTER)

    // Assert
    expect(recordAnswerMock).not.toHaveBeenCalled()
  })
})

describe('BossBattleClient real-mode persistence', () => {
  it('calls recordAnswer exactly once per question for the MCQ result - not again for its step review, not again on a later re-render', async () => {
    // Arrange
    const user = userEvent.setup()
    renderBattle({ isDemo: false, userId: 'real-student-1' })
    await startBattle(user)

    // Act/Assert - question 1 ('1', 2 marks): wrong MCQ persists the MCQ
    // result immediately...
    await answerMcq(user, WRONG_LETTER)
    expect(recordAnswerMock).toHaveBeenCalledTimes(1)
    expect(recordAnswerMock).toHaveBeenNthCalledWith(1, '1', false)

    // ...and self-marking every step of its recovery review ("I know
    // this" -> "Yes, I had this") must not add further calls - the boss
    // battle's own step-level scoring is client-side only; recordAnswer
    // only ever tracks the one real MCQ result per question.
    await clearStepsWithFullCredit(user, demoQuestions[0].steps.length)
    expect(recordAnswerMock).toHaveBeenCalledTimes(1)

    // Question 2 ('2'): correct MCQ persists its own, second call.
    await answerMcq(user, CORRECT_LETTER)
    expect(recordAnswerMock).toHaveBeenCalledTimes(2)
    expect(recordAnswerMock).toHaveBeenNthCalledWith(2, '2', true)

    // Clicking through to the next round is a re-render of the same
    // component tree, not a new answer - must not re-persist question 2.
    await user.click(screen.getByText('Next round', { selector: 'button' }))
    expect(recordAnswerMock).toHaveBeenCalledTimes(2)

    // Question 3 ('3'): correct MCQ persists its own, third call - one
    // recordAnswer call per question answered, no more, no fewer.
    await answerMcq(user, CORRECT_LETTER)
    expect(recordAnswerMock).toHaveBeenCalledTimes(3)
    expect(recordAnswerMock).toHaveBeenNthCalledWith(3, '3', true)
  })

  it('still never persists to the server in demo mode, even when a non-demo userId is passed through', async () => {
    // Arrange - isDemo is the source of truth; a stray real-looking userId
    // must not be enough to turn persistence on by itself.
    const user = userEvent.setup()
    renderBattle({ isDemo: true, userId: 'real-student-1' })
    await startBattle(user)

    // Act
    await answerMcq(user, CORRECT_LETTER)

    // Assert
    expect(recordAnswerMock).not.toHaveBeenCalled()
  })
})
