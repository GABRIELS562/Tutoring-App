import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { aiModules } from '@/content/ai-skills'
import { PREVIEW_PROGRESS, getAiSkillsProgress } from '../progress'

vi.mock('next/headers', () => ({
  cookies: vi.fn(async () => ({ getAll: () => [], set: () => {} })),
}))
vi.mock('@supabase/ssr', () => ({
  createServerClient: () => ({
    auth: { getUser: vi.fn(async () => ({ data: { user: null } })) },
  }),
}))

const SUPABASE_ENV = ['NEXT_PUBLIC_SUPABASE_URL', 'NEXT_PUBLIC_SUPABASE_ANON_KEY'] as const
const saved: Record<string, string | undefined> = {}

beforeEach(() => {
  for (const key of SUPABASE_ENV) {
    saved[key] = process.env[key]
    delete process.env[key]
  }
})

afterEach(() => {
  for (const key of SUPABASE_ENV) {
    if (saved[key] === undefined) delete process.env[key]
    else process.env[key] = saved[key]
  }
})

/**
 * The AI Skills index advertises which modules are done; the module page
 * gates on the same list and redirects to the index when the one before is
 * missing. They used to answer that question separately - the index fell
 * back to PREVIEW_PROGRESS with no database, the module page fell back to
 * an empty list.
 *
 * The result was invisible to every existing test and to the type checker:
 * the index showed modules 1 and 2 complete and 3 unlocked, and clicking
 * any of modules 2-5 bounced silently back to the list. Only module 1 ever
 * opened, which is exactly what a client would hit in a demo.
 */
describe('AI Skills progress has one source of truth', () => {
  it('falls back to the preview profile when Supabase is unconfigured', async () => {
    expect(await getAiSkillsProgress()).toEqual(PREVIEW_PROGRESS)
  })

  /**
   * The gate the module page applies, run against the list the index page
   * shows. Every module whose unlockCondition is unmet redirects, so this
   * is the test that would have caught the bounce.
   */
  it('the preview profile actually unlocks the modules the index shows as open', () => {
    const { completedModules } = PREVIEW_PROGRESS
    const reachable = Object.values(aiModules).filter(
      (m) => !m.unlockCondition || completedModules.includes(m.unlockCondition)
    )

    // modules 1 and 2 are complete, so 1, 2 and 3 must all open
    expect(reachable.length).toBeGreaterThanOrEqual(3)
    expect(reachable.map((m) => m.id)).toEqual(
      expect.arrayContaining(['ai-what-is', 'ai-prompts', 'ai-study'])
    )
  })

  it('every completed module in the preview profile is a real module id', () => {
    for (const id of PREVIEW_PROGRESS.completedModules) {
      expect(Object.keys(aiModules), `unknown module id "${id}"`).toContain(id)
    }
  })

  /**
   * Neither page may grow its own copy again - that drift is the bug.
   */
  it('neither AI Skills page defines its own progress fallback', () => {
    const pages = [
      'app/(app)/ai-skills/page.tsx',
      'app/(app)/ai-skills/[moduleId]/page.tsx',
    ]
    for (const page of pages) {
      const source = readFileSync(join(__dirname, '..', '..', '..', page), 'utf-8')
      expect(source, `${page} should import the shared helper`).toContain('getAiSkillsProgress')
      expect(source, `${page} re-declares a fallback`).not.toMatch(
        /const PREVIEW_PROGRESS|async function getUserProgress|async function getUserData/
      )
    }
  })
})
