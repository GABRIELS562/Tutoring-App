/**
 * Topbar renders the page's single <h1>. Several pages also rendered
 * their own duplicate/second <h1> in the main content area (page title
 * repeated as a heading, subject name repeated, etc.) - both a real
 * heading-order smell and confusing for screen-reader users who jump by
 * heading level expecting exactly one h1 per page. This asserts the fix:
 * exactly one h1 on each affected page.
 */
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render } from '@testing-library/react'
import { UserProvider } from '@/context/UserContext'
import type { UserData } from '@/context/UserContext'

vi.mock('next/headers', () => ({
  cookies: vi.fn(async () => ({ getAll: () => [], set: () => {} })),
}))
vi.mock('@supabase/ssr', () => ({
  createServerClient: () => ({ auth: { getUser: vi.fn(async () => ({ data: { user: null } })) } }),
  createBrowserClient: vi.fn(() => ({ auth: { signOut: vi.fn() } })),
}))
vi.mock('@/db/queries/progress', () => ({ getDashboardData: vi.fn() }))
vi.mock('@/lib/weaknessDetector', () => ({
  analyzeWeaknesses: vi.fn(),
  getMockWeaknesses: () => [],
}))
vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: vi.fn(), replace: vi.fn(), refresh: vi.fn() }),
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

function h1Count(container: HTMLElement): number {
  return container.querySelectorAll('h1').length
}

describe('exactly one h1 per page (Topbar owns it)', () => {
  it('Dashboard has exactly one h1 (Topbar\'s), not a second one for the greeting', async () => {
    const { default: DashboardPage } = await import('@/app/(app)/dashboard/page')
    const { container } = render(await DashboardPage())

    expect(h1Count(container)).toBe(1)
    expect(container.querySelector('h1')).toHaveTextContent('Dashboard')
  })

  it('the Subjects overview page has exactly one h1, not a second one for "Choose a Subject"', async () => {
    const { default: SubjectsPage } = await import('@/app/(app)/subjects/page')
    const { container } = render(
      <UserProvider user={demoUser}>
        <SubjectsPage />
      </UserProvider>
    )

    expect(h1Count(container)).toBe(1)
  })

  it('a single-subject page (SubjectPageClient) has exactly one h1, not a second one repeating the subject name', async () => {
    const { default: SubjectPageClient } = await import(
      '@/app/(app)/subjects/[subject]/SubjectPageClient'
    )
    const { container } = render(
      <UserProvider user={demoUser}>
        <SubjectPageClient subject="maths" topicsByGrade={{ 10: [], 11: [], 12: [] }} progressBySlug={{}} />
      </UserProvider>
    )

    expect(h1Count(container)).toBe(1)
  })

  it('PracticePageClient has exactly one h1, not a second one repeating the topic name', async () => {
    const { default: PracticePageClient } = await import(
      '@/app/(app)/topics/[slug]/practice/PracticePageClient'
    )
    const { container } = render(
      <UserProvider user={demoUser}>
        <PracticePageClient
          slug="trig-gr11"
          initialQuestions={[]}
          isDemo
          topicName="Trigonometry"
          topicPaper={2}
        />
      </UserProvider>
    )

    expect(h1Count(container)).toBe(1)
  })
})
