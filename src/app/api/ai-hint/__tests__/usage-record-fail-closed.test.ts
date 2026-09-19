import { describe, it, expect, vi, beforeEach } from 'vitest'
import { NextRequest } from 'next/server'

const requireUserMock = vi.fn()
const getApiSupabaseMock = vi.fn()

vi.mock('@/lib/auth/require-user', async () => {
  const actual = await vi.importActual<typeof import('@/lib/auth/require-user')>(
    '@/lib/auth/require-user'
  )
  return {
    ...actual,
    requireUser: requireUserMock,
  }
})

vi.mock('@/lib/supabase/api', () => ({
  getApiSupabase: getApiSupabaseMock,
}))

vi.mock('@/db/queries/users', () => ({
  checkPremiumStatus: vi.fn(async () => false),
}))

vi.mock('@/db', () => ({
  isDemoMode: false,
}))

const { POST } = await import('@/app/api/ai-hint/route')

function makeRequest(body: Record<string, unknown>) {
  return new NextRequest('http://localhost/api/ai-hint', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })
}

describe('POST /api/ai-hint fails closed on an unexpected usage-lookup error', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    delete process.env.ANTHROPIC_API_KEY
    requireUserMock.mockResolvedValue({ id: 'free-user-1', email: 'a@b.com' })
  })

  it('returns 503 and does not proceed when the usage lookup fails for a reason other than "no rows"', async () => {
    const insertSpy = vi.fn()
    getApiSupabaseMock.mockReturnValue({
      from(table: string) {
        if (table === 'ai_hint_usage') {
          return {
            select: () => ({
              eq: () => ({
                eq: () => ({
                  single: async () => ({
                    data: null,
                    error: { code: 'PGRST301', message: 'connection error' },
                  }),
                }),
              }),
            }),
            insert: insertSpy,
            update: () => ({ eq: async () => ({ error: null }) }),
          }
        }
        throw new Error(`Unexpected table in test mock: ${table}`)
      },
      rpc: insertSpy,
    })

    const res = await POST(makeRequest({ mode: 'step_hint', questionText: 'q', stepNumber: 1 }))

    expect(res.status).toBe(503)
    const body = await res.json()
    expect(body.error).toBe('Usage check unavailable, try again')
    // Must not have proceeded to record usage or serve a hint.
    expect(insertSpy).not.toHaveBeenCalled()
  })

  it('treats "no rows found" (PGRST116) as zero usage, not a failure', async () => {
    getApiSupabaseMock.mockReturnValue({
      from(table: string) {
        if (table === 'ai_hint_usage') {
          return {
            select: () => ({
              eq: () => ({
                eq: () => ({
                  single: async () => ({ data: null, error: { code: 'PGRST116' } }),
                }),
              }),
            }),
            insert: async () => ({ error: null }),
            update: () => ({ eq: async () => ({ error: null }) }),
          }
        }
        throw new Error(`Unexpected table in test mock: ${table}`)
      },
      rpc: async () => ({
        data: { id: 'usage-1', hint_count: 1, camera_count: 0 },
        error: null,
      }),
    })

    const res = await POST(makeRequest({ mode: 'step_hint', questionText: 'q', stepNumber: 1 }))
    expect(res.status).toBe(200)
  })
})
