import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import BattleScreen from '../BattleScreen'
import VideoModal from '../VideoModal'
import StepsSheet from '../StepsSheet'
import { getBossForTopic } from '@/content/bosses'
import type { BattleQuestion } from '@/lib/boss/battle'

// Every button asserted on below must clear the WCAG 2.5.8 (Target Size,
// Minimum) 44x44px tap target - min-h-11/min-w-11 is Tailwind's 2.75rem
// (44px) utility, matching the project's spacing scale. These are the
// four spots called out in the review: the Retreat button, VideoModal's
// close button, the Ask-Angelo button, and every confirm-dialog button.
const TAP_TARGET_CLASSES = ['min-h-11', 'min-w-11']

function expectMeetsTapTarget(element: HTMLElement) {
  for (const cls of TAP_TARGET_CLASSES) {
    expect(element.className.split(/\s+/)).toContain(cls)
  }
}

const boss = getBossForTopic('trig-gr11')

const question: BattleQuestion = {
  id: 'q1',
  questionText: 'Simplify $\\sin 210°$',
  marks: 2,
  options: [
    { id: 'a1', optionLetter: 'A', optionText: 'wrong', isCorrect: false },
    { id: 'a2', optionLetter: 'B', optionText: 'right', isCorrect: true },
  ],
  steps: [
    { id: 's1', stepNumber: 1, instruction: 'step 1', hint: null, correctAnswer: 'x', explanation: null },
  ],
}

describe('BattleScreen tap targets', () => {
  it('the Retreat button meets the 44px minimum', () => {
    render(
      <BattleScreen
        boss={boss}
        bossName={boss.name}
        bossVisualState="idle"
        hp={10}
        maxHp={14}
        shields={3}
        combo={0}
        question={question}
        questionNumber={1}
        totalQuestions={5}
        isFeedbackPhase={false}
        mcqSelectedLetter={null}
        mcqCorrect={null}
        lastDamage={null}
        damageKey={0}
        onSelectOption={() => {}}
        onNextRound={() => {}}
        onRetreat={() => {}}
      />
    )

    expectMeetsTapTarget(screen.getByText('Retreat', { selector: 'button' }))
  })

  it('both confirm-retreat dialog buttons meet the 44px minimum', async () => {
    const user = userEvent.setup()
    render(
      <BattleScreen
        boss={boss}
        bossName={boss.name}
        bossVisualState="idle"
        hp={10}
        maxHp={14}
        shields={3}
        combo={0}
        question={question}
        questionNumber={1}
        totalQuestions={5}
        isFeedbackPhase={false}
        mcqSelectedLetter={null}
        mcqCorrect={null}
        lastDamage={null}
        damageKey={0}
        onSelectOption={() => {}}
        onNextRound={() => {}}
        onRetreat={() => {}}
      />
    )

    await user.click(screen.getByText('Retreat', { selector: 'button' }))

    const dialog = screen.getByRole('alertdialog')
    expectMeetsTapTarget(screen.getByText('Cancel', { selector: 'button' }))
    expect(dialog.querySelectorAll('button')).toHaveLength(2)
    for (const button of dialog.querySelectorAll('button')) {
      expectMeetsTapTarget(button as HTMLElement)
    }
  })
})

describe('VideoModal tap targets', () => {
  it('the close button meets the 44px minimum', () => {
    render(
      <VideoModal
        open
        onClose={() => {}}
        videoId="dQw4w9WgXcQ"
        shieldAlreadyEarned={false}
        onShieldEarned={() => {}}
      />
    )

    const closeButtons = screen.getAllByLabelText('Close video')
    const iconCloseButton = closeButtons.find((el) => el.tagName === 'BUTTON' && el.querySelector('svg'))
    expect(iconCloseButton).toBeDefined()
    expectMeetsTapTarget(iconCloseButton as HTMLElement)
  })
})

describe('StepsSheet tap targets', () => {
  it('the Ask Angelo button meets the 44px minimum', () => {
    render(
      <StepsSheet
        question={question}
        stepIndex={0}
        stepResults={['pending']}
        revealMode="full"
        isReviewOnly={false}
        shields={3}
        onSelfMark={() => {}}
        onShowSteps={() => {}}
        onSpendShieldForHint={() => {}}
        onContinue={() => {}}
      />
    )

    expectMeetsTapTarget(screen.getByText('Ask Angelo (costs 1 shield)', { selector: 'button' }))
  })

  it('both confirm-ask-Angelo dialog buttons meet the 44px minimum', async () => {
    const user = userEvent.setup()
    render(
      <StepsSheet
        question={question}
        stepIndex={0}
        stepResults={['pending']}
        revealMode="full"
        isReviewOnly={false}
        shields={3}
        onSelfMark={() => {}}
        onShowSteps={() => {}}
        onSpendShieldForHint={() => {}}
        onContinue={() => {}}
      />
    )

    await user.click(screen.getByText('Ask Angelo (costs 1 shield)', { selector: 'button' }))

    const dialog = screen.getByRole('alertdialog')
    expect(dialog.querySelectorAll('button')).toHaveLength(2)
    for (const button of dialog.querySelectorAll('button')) {
      expectMeetsTapTarget(button as HTMLElement)
    }
  })
})
