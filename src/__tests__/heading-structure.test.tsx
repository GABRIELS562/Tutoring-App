/**
 * Topbar renders the page's single <h1>. Several pages also rendered
 * their own duplicate/second <h1> in the main content area (page title
 * repeated as a heading, subject name repeated, etc.) - both a real
 * heading-order smell and confusing for screen-reader users who jump by
 * heading level expecting exactly one h1 per page. This asserts the fix:
 * exactly one h1 on each affected page.
 */
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { readFileSync, readdirSync, statSync } from 'node:fs'
import { join } from 'node:path'
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

/**
 * The render tests above cover four pages by name. These cover every page
 * at once, from source - which is the only reason the AI Skills pages, the
 * topic not-found page and the three boss screens were caught: none of
 * them had a test of their own.
 */
const SRC = join(__dirname, '..')

function componentFiles(): string[] {
  const found: string[] = []
  const walk = (dir: string) => {
    for (const entry of readdirSync(dir)) {
      if (entry === 'node_modules' || entry === '__tests__') continue
      const full = join(dir, entry)
      if (statSync(full).isDirectory()) {
        walk(full)
        continue
      }
      if (full.endsWith('.tsx')) found.push(full)
    }
  }
  walk(SRC)
  return found
}

describe('heading structure', () => {
  it('nothing that renders a Topbar declares its own h1', () => {
    const offenders = componentFiles()
      .filter((file) => {
        const source = readFileSync(file, 'utf-8')
        return /<Topbar\b/.test(source) && /<h1[\s>]/.test(source)
      })
      .map((file) => file.replace(SRC, ''))

    expect(offenders).toEqual([])
  })

  /**
   * The flip side: Topbar is where the h1 lives, so if that ever changes
   * to an h2 the rule above becomes vacuous and every page loses its h1
   * silently.
   */
  it('Topbar is the thing that provides the h1', () => {
    const topbar = readFileSync(join(SRC, 'components', 'layout', 'Topbar.tsx'), 'utf-8')
    expect(topbar).toMatch(/<h1[\s>]/)
  })

})

/*
 * Deliberately NOT tested here: "no file contains more than one <h1>".
 * It reads like the obvious companion rule and it is unsound - counting
 * occurrences in source cannot see that only one of them renders.
 * forgot-password has three in `isDemoMode ? … : sent ? … : …`, and the
 * verify page has two because the file holds two components. Both are
 * correct. A rule that needs an allowlist of correct code to stay green
 * is worse than no rule, so the Topbar check above is the one kept: it is
 * decidable from the source, and it is what actually found the five.
 */
