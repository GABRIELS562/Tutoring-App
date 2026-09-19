import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'

vi.mock('next/headers', () => ({
  cookies: vi.fn(async () => ({ getAll: () => [], set: () => {} })),
}))

const getUserMock = vi.fn()
vi.mock('@supabase/ssr', () => ({
  createServerClient: () => ({
    auth: { getUser: getUserMock },
  }),
}))

const getDashboardDataMock = vi.fn()
vi.mock('@/db/queries/progress', () => ({
  getDashboardData: getDashboardDataMock,
}))

const analyzeWeaknessesMock = vi.fn()
const mockWeakness = {
  topicSlug: 'trig-gr11',
  topicName: 'Trigonometry',
  accuracy: 0.35,
  totalAttempts: 14,
  specificIssue: 'Sign errors in reduction formulae',
  recommendation: 'Practice the CAST diagram questions in Section 2',
}
vi.mock('@/lib/weaknessDetector', () => ({
  analyzeWeaknesses: analyzeWeaknessesMock,
  getMockWeaknesses: () => [mockWeakness],
}))

vi.mock('@/components/layout/Topbar', () => ({ default: () => <div>topbar</div> }))
vi.mock('../GradeSelector', () => ({ default: () => <div>grade selector</div> }))
vi.mock('@/components/dashboard/ExamCountdown', () => ({ default: () => <div>exam countdown</div> }))
vi.mock('@/components/dashboard/StudyPlanBanner', () => ({ default: () => <div>study plan</div> }))

const realUser = {
  id: 'real-user-1',
  name: 'Real Student',
  email: 'real@example.com',
  grade: 11,
  xp: 200,
  streakCount: 3,
  hearts: 5,
  isPremium: false,
}

function realDashboardData(overrides: Record<string, unknown> = {}) {
  return {
    user: realUser,
    totalQuestionsAnswered: 12,
    correctAnswers: 6,
    topicsStarted: 2,
    recentActivity: [],
    weeklyXP: [],
    topicsWithProgress: [],
    ...overrides,
  }
}

describe('DashboardPage weakness section', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://example.supabase.co'
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = 'anon-key'
  })

  it('does not fall back to mock weaknesses for a real user when analysis is empty', async () => {
    // Arrange
    getUserMock.mockResolvedValueOnce({ data: { user: { id: 'real-user-1' } } })
    getDashboardDataMock.mockResolvedValueOnce(realDashboardData())
    analyzeWeaknessesMock.mockResolvedValueOnce([])

    // Act
    const { default: DashboardPage } = await import('../page')
    render(await DashboardPage())

    // Assert - no card for the demo mock weakness, and the nudge shows instead
    expect(screen.queryByText(/Sign errors in reduction formulae/)).not.toBeInTheDocument()
    expect(screen.getByText('Answer 10 questions to see your weak spots')).toBeInTheDocument()
  })

  it('shows the real weakness card for a real user when analysis finds one', async () => {
    // Arrange
    getUserMock.mockResolvedValueOnce({ data: { user: { id: 'real-user-1' } } })
    getDashboardDataMock.mockResolvedValueOnce(realDashboardData())
    analyzeWeaknessesMock.mockResolvedValueOnce([mockWeakness])

    // Act
    const { default: DashboardPage } = await import('../page')
    render(await DashboardPage())

    // Assert
    expect(screen.getByText(/Sign errors in reduction formulae/)).toBeInTheDocument()
    expect(screen.queryByText('Answer 10 questions to see your weak spots')).not.toBeInTheDocument()
  })

  it('does not show the nudge before 10 questions are answered', async () => {
    // Arrange
    getUserMock.mockResolvedValueOnce({ data: { user: { id: 'real-user-1' } } })
    getDashboardDataMock.mockResolvedValueOnce(realDashboardData({ totalQuestionsAnswered: 3 }))

    // Act
    const { default: DashboardPage } = await import('../page')
    render(await DashboardPage())

    // Assert
    expect(analyzeWeaknessesMock).not.toHaveBeenCalled()
    expect(screen.queryByText('Answer 10 questions to see your weak spots')).not.toBeInTheDocument()
  })
})
