import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'

const ORIGINAL_ENV = { ...process.env }

vi.mock('@supabase/supabase-js', () => ({
  createClient: vi.fn(() => ({ marker: 'client' })),
}))

const { withSupabase, isRealResult } = await import('@/lib/supabase/api')

/**
 * "There is no database" and "the database said no" are different facts.
 *
 * This helper used to return `{ data: fallback, isDemo: true }` for both, so
 * a caller could not tell an unconfigured environment from an RLS denial or
 * a dropped connection. Anything branching on that to show a "viewing a
 * demo" banner would have shown it to a real user whose write just failed.
 */
describe('withSupabase outcomes', () => {
  beforeEach(() => {
    process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://example.supabase.co'
    process.env.SUPABASE_SERVICE_ROLE_KEY = 'service-role-key'
  })

  afterEach(() => {
    process.env = { ...ORIGINAL_ENV }
  })

  it('reports ok with the real data when the operation succeeds', async () => {
    const outcome = await withSupabase(async () => 'real', 'fallback')

    expect(outcome).toEqual({ status: 'ok', data: 'real' })
    expect(isRealResult(outcome)).toBe(true)
  })

  it('reports not-configured, distinctly, when there is no client', async () => {
    delete process.env.NEXT_PUBLIC_SUPABASE_URL
    delete process.env.SUPABASE_SERVICE_ROLE_KEY

    const outcome = await withSupabase(async () => 'real', 'fallback')

    expect(outcome).toEqual({ status: 'not-configured', data: 'fallback' })
    expect(isRealResult(outcome)).toBe(false)
  })

  it('reports failed, with the error, when the operation throws', async () => {
    const boom = new Error('RLS denied')

    const outcome = await withSupabase(async () => {
      throw boom
    }, 'fallback')

    expect(outcome.status).toBe('failed')
    expect(outcome.data).toBe('fallback')
    expect(outcome.status === 'failed' && outcome.error).toBe(boom)
    expect(isRealResult(outcome)).toBe(false)
  })

  // The whole point: these two must never be the same value.
  it('never reports a real failure as not-configured', async () => {
    const failed = await withSupabase(async () => {
      throw new Error('connection lost')
    }, 'fallback')
    delete process.env.NEXT_PUBLIC_SUPABASE_URL
    delete process.env.SUPABASE_SERVICE_ROLE_KEY
    const absent = await withSupabase(async () => 'real', 'fallback')

    expect(failed.status).not.toBe(absent.status)
  })
})
