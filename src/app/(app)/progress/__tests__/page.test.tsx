import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'

vi.mock('next/headers', () => ({
  cookies: vi.fn(async () => ({ getAll: () => [], set: () => {} })),
}))

const getUserMock = vi.fn()
vi.mock('@supabase/ssr', () => ({
  createServerClient: () => ({ auth: { getUser: getUserMock } }),
}))

const getDashboardDataMock = vi.fn()
const getProgressDataMock = vi.fn()
const getLeaderboardMock = vi.fn()
const getExamSummaryMock = vi.fn()

vi.mock('@/db/queries/progress', () => ({
  getDashboardData: getDashboardDataMock,
  getProgressData: getProgressDataMock,
  getLeaderboard: getLeaderboardMock,
}))
vi.mock('@/db/queries/exam', () => ({ getExamSummary: getExamSummaryMock }))

vi.mock('@/components/layout/Topbar', () => ({ default: () => <div>topbar</div> }))
vi.mock('../LazyCharts', () => ({
  XPLineChart: () => <div>xp chart</div>,
  AccuracyBarChart: () => <div>accuracy chart</div>,
  ActivityCalendar: () => <div>activity calendar</div>,
}))

const ProgressPage = (await import('../page')).default

const EMPTY_PROGRESS = { weeklyXP: [], topicAccuracy: [], activityCalendar: [] }

const REAL_USER = {
  id: 'student-1',
  name: 'Real Student',
  email: 'real@example.com',
  grade: 11,
  xp: 900,
  streakCount: 4,
  hearts: 5,
  isPremium: false,
}

beforeEach(() => {
  vi.clearAllMocks()
  process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://example.supabase.co'
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = 'anon'
  getProgressDataMock.mockResolvedValue(EMPTY_PROGRESS)
  getLeaderboardMock.mockResolvedValue([])
  getExamSummaryMock.mockResolvedValue([])
})

/**
 * getProgressData, getLeaderboard and getExamSummary each catch every
 * error and return the same empty shape a brand-new student gets. So a
 * student with weeks of history who hits a transient database error used
 * to see a flat zero chart, no topics and an empty leaderboard, with
 * nothing on screen suggesting anything had gone wrong. It reads as
 * "I have lost all my progress".
 *
 * getDashboardData returning no user is the canary - for a signed-in
 * student that is never a normal state. The dashboard already uses it;
 * this page did not.
 */
describe('the progress page tells a signed-in student when its data did not load', () => {
  it('shows the load-failure notice instead of an empty chart', async () => {
    getUserMock.mockResolvedValue({ data: { user: { id: 'student-1' } } })
    getDashboardDataMock.mockResolvedValue({ user: null })

    render(await ProgressPage())

    expect(screen.getByText('We could not load your progress')).toBeInTheDocument()
    expect(screen.getByText(/Your work is safe/)).toBeInTheDocument()
    expect(screen.queryByText('xp chart')).not.toBeInTheDocument()
  })

  it('announces that notice rather than leaving it silent', async () => {
    getUserMock.mockResolvedValue({ data: { user: { id: 'student-1' } } })
    getDashboardDataMock.mockResolvedValue({ user: null })

    const { container } = render(await ProgressPage())

    expect(container.querySelector('[role="status"]')).not.toBeNull()
  })

  /**
   * The opposite error would be just as bad: a real student who genuinely
   * has no activity yet must still get their page, not an error.
   */
  it('still renders the page for a signed-in student with no activity yet', async () => {
    getUserMock.mockResolvedValue({ data: { user: { id: 'student-1' } } })
    getDashboardDataMock.mockResolvedValue({ user: REAL_USER })

    render(await ProgressPage())

    expect(screen.queryByText('We could not load your progress')).not.toBeInTheDocument()
    expect(screen.getByText('xp chart')).toBeInTheDocument()
  })

  it('leaves the signed-out preview alone', async () => {
    getUserMock.mockResolvedValue({ data: { user: null } })

    render(await ProgressPage())

    expect(screen.queryByText('We could not load your progress')).not.toBeInTheDocument()
    expect(screen.getByText('xp chart')).toBeInTheDocument()
  })
})
