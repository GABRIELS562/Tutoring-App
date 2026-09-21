import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import StepsSheet from '../StepsSheet'
import type { BattleQuestion } from '@/lib/boss/battle'

const question: BattleQuestion = {
  id: 'q1',
  questionText: 'Simplify $\\sin 210°$',
  marks: 3,
  options: [
    { id: 'a1', optionLetter: 'A', optionText: 'wrong', isCorrect: false },
    { id: 'a2', optionLetter: 'B', optionText: 'right', isCorrect: true },
  ],
  steps: [
    { id: 's1', stepNumber: 1, instruction: 'step 1', hint: null, correctAnswer: 'x', explanation: null },
    { id: 's2', stepNumber: 2, instruction: 'step 2', hint: null, correctAnswer: 'y', explanation: null },
    { id: 's3', stepNumber: 3, instruction: 'step 3', hint: null, correctAnswer: 'z', explanation: null },
  ],
}

function renderSheet(overrides: Partial<React.ComponentProps<typeof StepsSheet>> = {}) {
  return render(
    <StepsSheet
      question={question}
      stepIndex={1}
      stepResults={['knew_it', 'didnt_know', 'pending']}
      revealMode="full"
      isReviewOnly={false}
      shields={3}
      onSelfMark={vi.fn()}
      onShowSteps={vi.fn()}
      onSpendShieldForHint={vi.fn()}
      onContinue={vi.fn()}
      {...overrides}
    />
  )
}

describe('StepsSheet step progress dots', () => {
  it('renders one dot per step, titled by its result', () => {
    renderSheet()

    const list = screen.getByRole('list', { name: 'Step progress' })
    const dots = screen.getAllByRole('listitem')
    expect(dots).toHaveLength(3)
    expect(dots[0]).toHaveAttribute('title', 'Knew it')
    expect(dots[1]).toHaveAttribute('title', "Didn't know")
    expect(dots[2]).toHaveAttribute('title', 'Not answered yet')
    expect(list).toBeInTheDocument()
  })

  it('renders no dots before any step has been attempted', () => {
    renderSheet({ stepResults: [] })
    expect(screen.queryByRole('list', { name: 'Step progress' })).not.toBeInTheDocument()
  })
})

describe('StepsSheet peek/collapse toggle', () => {
  it('defaults to expanded, showing the step content', () => {
    renderSheet()
    expect(screen.getByText('step 2')).toBeInTheDocument()
    expect(screen.getByText('Show question', { selector: 'button' })).toBeInTheDocument()
  })

  it('hides the step content and flips the toggle label when collapsed to peek at the question', async () => {
    const user = userEvent.setup()
    renderSheet()

    await user.click(screen.getByText('Show question', { selector: 'button' }))

    expect(screen.queryByText('step 2')).not.toBeInTheDocument()
    expect(screen.getByText('Hide question', { selector: 'button' })).toBeInTheDocument()
    // The header (title + step dots + toggle) stays visible while collapsed.
    expect(screen.getByText('Step by step')).toBeInTheDocument()
    expect(screen.getAllByRole('listitem')).toHaveLength(3)
  })

  it('re-expands and shows the step content again on a second click', async () => {
    const user = userEvent.setup()
    renderSheet()

    const toggle = screen.getByRole('button', { name: /question/i, expanded: true })
    await user.click(toggle)
    await user.click(screen.getByText('Hide question', { selector: 'button' }))

    expect(screen.getByText('step 2')).toBeInTheDocument()
    expect(screen.getByText('Show question', { selector: 'button' })).toBeInTheDocument()
  })
})
