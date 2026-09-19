import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import QuizEngine from '../QuizEngine'
import type { QuestionWithDetails } from '@/db/queries/questions'

const { recordAnswerMock, completeQuizMock } = vi.hoisted(() => ({
  recordAnswerMock: vi.fn(async () => ({ ok: true as const })),
  completeQuizMock: vi.fn(async () => ({ ok: true as const })),
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

    // Assert
    expect(recordAnswerMock).toHaveBeenCalledWith('real-q1', true)
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
