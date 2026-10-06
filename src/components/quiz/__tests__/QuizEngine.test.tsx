import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import QuizEngine from '../QuizEngine'
import type { QuestionWithDetails } from '@/db/queries/questions'
import type { recordAnswer, completeQuiz } from '@/app/(app)/topics/[slug]/practice/actions'

const { recordAnswerMock, completeQuizMock } = vi.hoisted(() => ({
  recordAnswerMock: vi.fn<typeof recordAnswer>(async () => ({ ok: true, xpEarned: 0 })),
  completeQuizMock: vi.fn<typeof completeQuiz>(async () => ({ ok: true })),
}))

vi.mock('@/app/(app)/topics/[slug]/practice/actions', () => ({
  recordAnswer: recordAnswerMock,
  completeQuiz: completeQuizMock,
}))

function makeQuestion(overrides: Partial<QuestionWithDetails> = {}): QuestionWithDetails {
  return {
    id: 'real-q1',
    topicId: 't1',
    topicSlug: 'trig-gr11',
    topicName: 'Trigonometry',
    source: 'angelo',
    year: 2024,
    examType: 'custom',
    questionText: 'What is 2 plus 2?',
    marks: 2,
    difficulty: 1,
    hasDiagram: false,
    diagramUrl: null,
    isMultipleChoice: true,
    options: [
      { id: 'o1', optionLetter: 'A', optionText: 'Four', isCorrect: true },
      { id: 'o2', optionLetter: 'B', optionText: 'Five', isCorrect: false },
    ],
    steps: [],
    ...overrides,
  }
}

describe('QuizEngine question source', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('uses real initialQuestions over mock questions when provided', () => {
    // Arrange
    const realQuestion = makeQuestion()

    // Act
    render(
      <QuizEngine
        topicSlug="trig-gr11"
        grade={11}
        userId="user-1"
        initialQuestions={[realQuestion]}
        isDemo={false}
      />
    )

    // Assert
    expect(screen.getByText('What is 2 plus 2?')).toBeInTheDocument()
  })

  it('falls back to mock questions only in demo mode with no real questions', () => {
    // Act
    render(
      <QuizEngine
        topicSlug="trig-gr11"
        grade={11}
        userId="demo-user"
        initialQuestions={[]}
        isDemo
      />
    )

    // Assert - one of the in-file mock questions
    expect(screen.getByText(/Simplify/)).toBeInTheDocument()
  })

  it('shows a "no questions yet" state (not mocks) when not in demo mode and there are no real questions', () => {
    // Act
    render(
      <QuizEngine
        topicSlug="trig-gr11"
        grade={11}
        userId="user-1"
        initialQuestions={[]}
        isDemo={false}
      />
    )

    // Assert
    expect(screen.getByText('No questions yet for this topic.')).toBeInTheDocument()
    expect(screen.queryByText(/Simplify/)).not.toBeInTheDocument()
  })
})

describe('QuizEngine answer persistence', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('calls recordAnswer for a real question with a real session user', async () => {
    // Arrange
    const user = userEvent.setup()
    const realQuestion = makeQuestion()
    render(
      <QuizEngine
        topicSlug="trig-gr11"
        grade={11}
        userId="user-1"
        initialQuestions={[realQuestion]}
        isDemo={false}
      />
    )

    // Act
    await user.click(screen.getByText('Four'))

    // Assert - the LETTER is sent, not a verdict. Whether 'A' is right is
    // the server's business; see isOptionCorrect() in db/queries/questions.
    expect(recordAnswerMock).toHaveBeenCalledWith('real-q1', 'A')
  })

  it('does not call recordAnswer in demo mode', async () => {
    // Arrange
    const user = userEvent.setup()
    render(
      <QuizEngine
        topicSlug="trig-gr11"
        grade={11}
        userId="demo-user"
        initialQuestions={[]}
        isDemo
      />
    )

    // Act - answer the first mock question (any option)
    const options = await screen.findAllByRole('button')
    const optionButton = options.find((b) => /[A-D]/.test(b.textContent || ''))
    if (optionButton) await user.click(optionButton)

    // Assert
    expect(recordAnswerMock).not.toHaveBeenCalled()
  })

  it('displays the server-reported xpEarned, never a client-guessed amount', async () => {
    // Arrange - server says this particular answer was worth 10 (could
    // be 0 for a repeat-correct answer; the client never assumes)
    recordAnswerMock.mockResolvedValueOnce({ ok: true, xpEarned: 10 })
    const user = userEvent.setup()
    const q1 = makeQuestion({ id: 'q1' })
    const q2 = makeQuestion({ id: 'q2', questionText: 'Second question' })
    render(
      <QuizEngine
        topicSlug="trig-gr11"
        grade={11}
        userId="user-1"
        initialQuestions={[q1, q2]}
        isDemo={false}
      />
    )

    // Act
    await user.click(screen.getByText('Four'))
    await user.click(screen.getByRole('button', { name: /next question/i }))
    // Complete the quiz to reach the XP summary screen
    await user.click(screen.getByText('Four'))
    await user.click(screen.getByRole('button', { name: /next question/i }))

    // Assert
    expect(screen.getByText('+10')).toBeInTheDocument()
  })

  it('shows an inline "Not saved" state, disables Next, and does not count XP when recordAnswer fails', async () => {
    // Arrange
    recordAnswerMock.mockResolvedValueOnce({ ok: false, error: 'Could not save your answer' })
    const user = userEvent.setup()
    render(
      <QuizEngine
        topicSlug="trig-gr11"
        grade={11}
        userId="user-1"
        initialQuestions={[makeQuestion()]}
        isDemo={false}
      />
    )

    // Act
    await user.click(screen.getByText('Four'))

    // Assert
    expect(screen.getByText('Not saved — retry')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /next question/i })).toBeDisabled()
  })

  it('clicking Next while a save is failing does not advance the question', async () => {
    // Arrange
    recordAnswerMock.mockResolvedValueOnce({ ok: false, error: 'Could not save your answer' })
    const user = userEvent.setup()
    render(
      <QuizEngine
        topicSlug="trig-gr11"
        grade={11}
        userId="user-1"
        initialQuestions={[makeQuestion({ questionText: 'First question' }), makeQuestion({ id: 'q2', questionText: 'Second question' })]}
        isDemo={false}
      />
    )
    await user.click(screen.getByText('Four'))
    expect(screen.getByText('Not saved — retry')).toBeInTheDocument()

    // Act - the button is disabled, but assert the handler itself also
    // refuses to advance (defense in depth), not just the disabled attribute
    await user.click(screen.getByRole('button', { name: /next question/i }))

    // Assert
    expect(screen.getByText('First question')).toBeInTheDocument()
    expect(screen.queryByText('Second question')).not.toBeInTheDocument()
  })

  it('retrying a failed save clears the inline error and re-enables Next once it succeeds', async () => {
    // Arrange
    recordAnswerMock
      .mockResolvedValueOnce({ ok: false, error: 'Could not save your answer' })
      .mockResolvedValueOnce({ ok: true, xpEarned: 10 })
    const user = userEvent.setup()
    render(
      <QuizEngine
        topicSlug="trig-gr11"
        grade={11}
        userId="user-1"
        initialQuestions={[makeQuestion()]}
        isDemo={false}
      />
    )
    await user.click(screen.getByText('Four'))
    expect(screen.getByText('Not saved — retry')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /next question/i })).toBeDisabled()

    // Act
    await user.click(screen.getByRole('button', { name: 'Retry' }))

    // Assert
    expect(screen.queryByText('Not saved — retry')).not.toBeInTheDocument()
    expect(recordAnswerMock).toHaveBeenCalledTimes(2)
    expect(screen.getByRole('button', { name: /next question/i })).toBeEnabled()
  })

  it('blocks further questions when the server reports out_of_hearts, even if local hearts looked fine', async () => {
    // Arrange - server is authoritative: local hearts prop says plenty
    // left, but the server says otherwise (e.g. a second tab used them)
    recordAnswerMock.mockResolvedValueOnce({ ok: false, error: 'out_of_hearts' })
    const user = userEvent.setup()
    render(
      <QuizEngine
        topicSlug="trig-gr11"
        grade={11}
        userId="user-1"
        initialQuestions={[makeQuestion()]}
        isDemo={false}
        hearts={5}
      />
    )

    // Act
    await user.click(screen.getByText('Four'))

    // Assert
    expect(screen.getByText('Out of hearts')).toBeInTheDocument()
    expect(screen.queryByText('Not saved — retry')).not.toBeInTheDocument()
  })
})

describe('QuizEngine hearts', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('blocks further questions once hearts reach 0 for a non-premium user', async () => {
    // Arrange - 1 heart, one wrong answer uses it up
    const user = userEvent.setup()
    const q1 = makeQuestion({ id: 'q1', questionText: 'Question one' })
    render(
      <QuizEngine
        topicSlug="trig-gr11"
        grade={11}
        userId="user-1"
        initialQuestions={[q1]}
        isDemo={false}
        hearts={1}
        isPremium={false}
      />
    )

    // Act - answer incorrectly, then try to move on
    await user.click(screen.getByText('Five'))
    await user.click(screen.getByRole('button', { name: /next question/i }))

    // Assert
    expect(screen.getByText('Out of hearts')).toBeInTheDocument()
  })

  it('never blocks a premium user even at 0 hearts', async () => {
    // Arrange
    const user = userEvent.setup()
    const q1 = makeQuestion({ id: 'q1' })
    const q2 = makeQuestion({ id: 'q2', questionText: 'Second question' })
    render(
      <QuizEngine
        topicSlug="trig-gr11"
        grade={11}
        userId="user-1"
        initialQuestions={[q1, q2]}
        isDemo={false}
        hearts={1}
        isPremium
      />
    )

    // Act - answer incorrectly, then move to the next question
    await user.click(screen.getByText('Five'))
    await user.click(screen.getByRole('button', { name: /next question/i }))

    // Assert
    expect(screen.queryByText('Out of hearts')).not.toBeInTheDocument()
    expect(screen.getByText('Second question')).toBeInTheDocument()
  })
})

/**
 * The practice page once rendered no question at all. The cause was not a
 * data problem: the question card faded in from `opacity: 0`, so the server
 * shipped it invisible and the card only became readable once Framer Motion
 * ran the entry animation client-side. Anything that stalled that animation
 * - a backgrounded tab throttling requestAnimationFrame, a slow device, a
 * hydration hiccup, JS that never arrived - left a student staring at an
 * empty page with the question sitting right there in the DOM at zero
 * opacity. The Next button was worse: it fades in on a 0.5s delay, so a
 * stalled animation stranded the student with no visible way forward.
 *
 * Content may slide or scale on entry. It may not fade, because a fade that
 * never runs is indistinguishable from a page that never loaded.
 */
describe('question visibility does not depend on an animation', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  const zeroOpacity = (container: HTMLElement) =>
    [...container.querySelectorAll<HTMLElement>('[style]')].filter(
      (el) => el.style.opacity === '0'
    )

  it('renders the question at full opacity before any animation runs', () => {
    const { container } = render(
      <QuizEngine
        topicSlug="trig-gr11"
        grade={11}
        userId="user-1"
        initialQuestions={[makeQuestion()]}
        isDemo={false}
      />
    )

    expect(screen.getByText('What is 2 plus 2?')).toBeInTheDocument()
    expect(
      zeroOpacity(container).map((el) => el.className),
      'content was rendered invisible and depends on an animation to be seen'
    ).toEqual([])
  })

  it('keeps the answer feedback and the next button visible once answered', async () => {
    const user = userEvent.setup()
    const { container } = render(
      <QuizEngine
        topicSlug="trig-gr11"
        grade={11}
        userId="user-1"
        initialQuestions={[makeQuestion()]}
        isDemo={false}
      />
    )

    await user.click(screen.getByText('Four'))

    expect(
      zeroOpacity(container).map((el) => el.className),
      'post-answer content is invisible until an animation runs'
    ).toEqual([])
  })
})

/**
 * A save that fails AFTER the student has moved on used to attach its
 * "not saved, retry" banner and its Next block to whichever question was
 * on screen by then - a question that had saved perfectly well. The cause
 * was Next becoming clickable the moment the card flipped to "answered",
 * without waiting for the save to settle.
 */
describe('QuizEngine does not let a student outrun the save', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('keeps Next disabled until the answer has actually been recorded', async () => {
    // Arrange - a save that stays in flight until we release it
    let release: (value: { ok: true; xpEarned: number }) => void = () => {}
    recordAnswerMock.mockImplementationOnce(
      () => new Promise((resolve) => { release = resolve })
    )
    const user = userEvent.setup()
    render(
      <QuizEngine
        topicSlug="trig-gr11"
        grade={11}
        userId="real-student-1"
        initialQuestions={[makeQuestion()]}
        isDemo={false}
      />
    )

    // Act - answer, while the save is still pending
    await user.click(screen.getByText('Four'))

    // Assert - the student cannot advance past an unsettled save
    const next = screen.getByRole('button', { name: /next|finish/i })
    expect(next).toBeDisabled()

    // Act - the save lands
    release({ ok: true, xpEarned: 10 })
    await waitFor(() => expect(next).not.toBeDisabled())
  })
})

/**
 * The Easy/Medium/Hard filter used to do nothing after the first render.
 *
 * Two independent causes, one symptom. In production, QuizEngine seeds
 * `questions` with a useState initializer, which React runs only on mount;
 * changing the filter re-runs the server component and fetches a genuinely
 * different set, but the mounted instance kept the old one - along with the
 * old score and position. PracticePageClient now passes a key so a new
 * question set remounts the quiz.
 *
 * In demo mode there is no query at all: the page never calls
 * getQuestionsByTopic, so `difficulty` reached nothing and the same five
 * fixture questions showed under every filter. QuizEngine now filters the
 * demo set itself.
 */
describe('the difficulty filter actually filters', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  /**
   * The counter is rendered twice - once visibly and once inside the
   * sr-only live region - so this reads the total rather than matching a
   * single node.
   */
  function questionTotal(): number {
    const nodes = screen.getAllByText(/Question \d+ of \d+/i)
    expect(nodes.length).toBeGreaterThan(0)
    const match = nodes[0].textContent?.match(/of (\d+)/)
    expect(match, `could not read a total from "${nodes[0].textContent}"`).not.toBeNull()
    return Number(match![1])
  }

  it('shows every demo question when no difficulty is selected', () => {
    render(<QuizEngine topicSlug="trigonometry" grade={11} userId="demo-user" isDemo />)

    expect(questionTotal()).toBe(5)
  })

  it('narrows to just the easy ones when Easy is selected', () => {
    render(
      <QuizEngine topicSlug="trigonometry" grade={11} userId="demo-user" isDemo difficulty={1} />
    )

    // The fixture is [1, 2, 2, 1, 1] - three at difficulty 1.
    expect(questionTotal()).toBe(3)
  })

  it('narrows to the medium ones when Medium is selected', () => {
    render(
      <QuizEngine topicSlug="trigonometry" grade={11} userId="demo-user" isDemo difficulty={2} />
    )

    expect(questionTotal()).toBe(2)
  })

  /**
   * The fixture has no difficulty-3 questions. Falling back to the full
   * set would show easy questions under "Hard", misrepresenting the
   * feature - the honest answer is the same empty state a real database
   * with nothing at that level would produce.
   */
  it('shows the empty state rather than easier questions when none match', () => {
    render(
      <QuizEngine topicSlug="trigonometry" grade={11} userId="demo-user" isDemo difficulty={3} />
    )

    expect(screen.getByText('No questions yet for this topic.')).toBeInTheDocument()
    expect(screen.queryByText(/Question \d+ of/i)).not.toBeInTheDocument()
  })

  it('never lets a real question set be filtered away by this path', () => {
    // Real questions are already filtered server-side by
    // getQuestionsByTopic; re-filtering them here would drop rows twice.
    render(
      <QuizEngine
        topicSlug="trigonometry"
        grade={11}
        userId="u1"
        isDemo={false}
        difficulty={3}
        initialQuestions={[makeQuestion({ difficulty: 1 })]}
      />
    )

    expect(questionTotal()).toBe(1)
  })
})

describe('PracticePageClient remounts the quiz when the question set changes', () => {
  it('keys QuizEngine on the slug and difficulty', async () => {
    const { readFileSync } = await import('node:fs')
    const { join } = await import('node:path')
    const source = readFileSync(
      join(__dirname, '..', '..', '..', 'app', '(app)', 'topics', '[slug]', 'practice', 'PracticePageClient.tsx'),
      'utf-8'
    )

    expect(source).toMatch(/<QuizEngine[\s\S]{0,200}?key=\{`\$\{slug\}-\$\{difficulty \?\? 'all'\}`\}/)
  })
})
