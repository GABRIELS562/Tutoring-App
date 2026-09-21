/**
 * Phase 5.3 axe pass. One test per required surface (Dashboard, Papers,
 * TopicPageClient, QuizEngine, Login) asserting zero axe-core violations.
 * External deps (auth, db, routing) are mocked the same way the existing
 * unit tests for each component mock them; child UI components are left
 * real (not mocked out as `<div>`) so the scan covers the whole tree.
 */
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render } from '@testing-library/react'
import { axe } from 'vitest-axe'
import { UserProvider } from '@/context/UserContext'
import type { UserData } from '@/context/UserContext'
import type { TopicContent } from '@/types'

// ---- next/headers + Supabase (Dashboard, demo mode) ----
vi.mock('next/headers', () => ({
  cookies: vi.fn(async () => ({ getAll: () => [], set: () => {} })),
}))
vi.mock('@supabase/ssr', () => ({
  createServerClient: () => ({ auth: { getUser: vi.fn(async () => ({ data: { user: null } })) } }),
  createBrowserClient: vi.fn(() => ({
    auth: { signInWithPassword: vi.fn(), signOut: vi.fn() },
  })),
}))
vi.mock('@/db/queries/progress', () => ({
  getDashboardData: vi.fn(),
}))
vi.mock('@/lib/weaknessDetector', () => ({
  analyzeWeaknesses: vi.fn(),
  getMockWeaknesses: () => [],
}))

// ---- next/navigation (Login) ----
const routerMock = { push: vi.fn(), refresh: vi.fn(), replace: vi.fn() }
vi.mock('next/navigation', () => ({
  useRouter: () => routerMock,
  useSearchParams: () => new URLSearchParams(),
}))

// ---- Server actions (QuizEngine, demo mode never calls these, but the
// module must still resolve on import) ----
vi.mock('@/app/(app)/topics/[slug]/practice/actions', () => ({
  recordAnswer: vi.fn(async () => ({ ok: true, xpEarned: 0 })),
  completeQuiz: vi.fn(async () => ({ ok: true })),
}))

// ---- VoicePlayer uses the Web Speech API, which jsdom doesn't implement;
// it already carries its own aria-label (out of Phase 5's scope) - stub it
// out so this suite tests TopicPageClient's own markup, not the Speech API.
vi.mock('@/components/ui/VoicePlayer', () => ({
  default: () => null,
}))

const demoUser: UserData = {
  id: 'demo-user',
  email: 'demo@example.com',
  name: 'Demo Student',
  grade: 11,
  school: 'Demo School',
  xp: 1250,
  streakCount: 7,
  hearts: 5,
  isPremium: false,
}

beforeEach(() => {
  vi.clearAllMocks()
  delete process.env.NEXT_PUBLIC_SUPABASE_URL
  delete process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
})

describe('accessibility (axe)', () => {
  it('Dashboard (demo data) has no axe violations', async () => {
    const { default: DashboardPage } = await import('@/app/(app)/dashboard/page')
    const { container } = render(await DashboardPage())

    expect(await axe(container)).toHaveNoViolations()
  })

  it('Papers has no axe violations', async () => {
    const { default: PapersPageClient } = await import('@/app/(app)/papers/PapersPageClient')
    const papers = [
      {
        id: 'p1',
        grade: 12 as const,
        subject: 'maths' as const,
        year: 2024,
        examType: 'NSC',
        paperNumber: 1,
        language: 'English',
        pdfUrl: 'https://example.com/p1.pdf',
        memoUrl: 'https://example.com/p1-memo.pdf',
        topicsCovered: ['Algebra', 'Trigonometry'],
      },
    ]

    const { container } = render(
      <UserProvider user={demoUser}>
        <PapersPageClient papers={papers} />
      </UserProvider>
    )

    expect(await axe(container)).toHaveNoViolations()
  })

  it('TopicPageClient has no axe violations', async () => {
    const { default: TopicPageClient } = await import('@/app/(app)/topics/[slug]/TopicPageClient')
    const content: TopicContent = {
      id: 't1',
      slug: 'trig-gr11',
      subject: 'maths',
      grade: 11,
      paper: 2,
      title: 'Trigonometry',
      capsWeight: 25,
      sections: [
        {
          id: 'intro',
          title: 'Introduction',
          blocks: [
            { type: 'theory', title: 'Reduction formulae', body: 'sin(180 - x) = sin x' },
          ],
        },
      ],
    }

    const { container } = render(
      <UserProvider user={demoUser}>
        <TopicPageClient slug="trig-gr11" content={content} />
      </UserProvider>
    )

    expect(await axe(container)).toHaveNoViolations()
  })

  it('QuizEngine (demo mode, mock questions) has no axe violations', async () => {
    const { default: QuizEngine } = await import('@/components/quiz/QuizEngine')

    const { container } = render(
      <QuizEngine
        topicSlug="trig-gr11"
        grade={11}
        userId="demo-user"
        initialQuestions={[]}
        isDemo
        hearts={5}
        isPremium={false}
      />
    )

    expect(await axe(container)).toHaveNoViolations()
  })

  it('BossBattleClient (demo mode, intro screen) has no axe violations', async () => {
    const { default: BossBattleClient } = await import('@/components/boss/BossBattleClient')
    const { demoQuestions } = await import('@/content/demo-questions')

    const { container } = render(
      <BossBattleClient
        topicSlug="trig-gr11"
        topicName="Trigonometry"
        questions={demoQuestions}
        isDemo
        userId="demo-user"
        video={null}
      />
    )

    expect(await axe(container)).toHaveNoViolations()
  })

  it('Login has no axe violations', async () => {
    const { default: LoginPage } = await import('@/app/(auth)/login/page')

    const { container } = render(<LoginPage />)

    expect(await axe(container)).toHaveNoViolations()
  })
})
