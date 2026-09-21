import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'

// notFound() throws internally in real Next.js (a special NEXT_NOT_FOUND
// error caught by the framework's error boundary) - mimic that so a test
// can assert on it without needing a real Next.js router tree.
vi.mock('next/navigation', () => ({
  notFound: vi.fn(() => {
    throw new Error('NEXT_NOT_FOUND')
  }),
}))

const getQuestionsByTopicMock = vi.fn()
vi.mock('@/db/queries/questions', () => ({
  getQuestionsByTopic: getQuestionsByTopicMock,
}))

let isDemoMode = false
vi.mock('@/db', () => ({
  get isDemoMode() {
    return isDemoMode
  },
}))

const getSessionUserMock = vi.fn()
vi.mock('@/lib/auth/require-user', () => ({
  getSessionUser: getSessionUserMock,
}))

vi.mock('@/components/boss/BossBattleClient', () => ({
  default: (props: { topicSlug: string; topicName: string; questions: unknown[]; isDemo: boolean; userId: string }) => (
    <div data-testid="boss-battle-client">
      {props.topicSlug} / {props.topicName} / {props.questions.length} questions / isDemo={String(props.isDemo)} /
      userId={props.userId}
    </div>
  ),
}))

describe('Boss battle route', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    isDemoMode = false
    getSessionUserMock.mockResolvedValue({ id: 'user-1', email: 'a@b.com' })
    getQuestionsByTopicMock.mockResolvedValue([])
  })

  it('calls notFound() for a topic slug that is not in the registry', async () => {
    const { default: BossPage } = await import('../page')

    await expect(
      BossPage({ params: Promise.resolve({ slug: 'not-a-real-topic' }) })
    ).rejects.toThrow('NEXT_NOT_FOUND')
  })

  it('renders BossBattleClient with real questions for a known topic in non-demo mode', async () => {
    isDemoMode = false
    getQuestionsByTopicMock.mockResolvedValue([{ id: 'q1' }, { id: 'q2' }])
    const { default: BossPage } = await import('../page')

    const result = await BossPage({ params: Promise.resolve({ slug: 'trig-gr11' }) })
    render(result)

    expect(getQuestionsByTopicMock).toHaveBeenCalledWith('trig-gr11')
    expect(screen.getByTestId('boss-battle-client')).toHaveTextContent('trig-gr11')
    expect(screen.getByTestId('boss-battle-client')).toHaveTextContent('2 questions')
    expect(screen.getByTestId('boss-battle-client')).toHaveTextContent('isDemo=false')
    expect(screen.getByTestId('boss-battle-client')).toHaveTextContent('userId=user-1')
  })

  it('falls back to demoQuestions scoped to the topic slug in demo mode', async () => {
    isDemoMode = true
    const { default: BossPage } = await import('../page')

    const result = await BossPage({ params: Promise.resolve({ slug: 'trig-gr11' }) })
    render(result)

    // All 5 demoQuestions carry topicSlug 'trig-gr11', so all 5 apply.
    expect(getQuestionsByTopicMock).not.toHaveBeenCalled()
    expect(screen.getByTestId('boss-battle-client')).toHaveTextContent('5 questions')
    expect(screen.getByTestId('boss-battle-client')).toHaveTextContent('isDemo=true')
  })

  it('falls back to the full demo set when no demo question matches the slug', async () => {
    isDemoMode = true
    const { default: BossPage } = await import('../page')

    // A registered topic with no matching demoQuestions (none carry this
    // topicSlug) - every topic must still be playable in demo mode.
    const result = await BossPage({ params: Promise.resolve({ slug: 'calculus-gr12' }) })
    render(result)

    expect(screen.getByTestId('boss-battle-client')).toHaveTextContent('5 questions')
  })
})
