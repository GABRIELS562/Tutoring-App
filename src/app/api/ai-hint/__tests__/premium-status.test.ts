import { describe, it, expect, vi, beforeEach } from 'vitest'
import { NextRequest } from 'next/server'

const requireUserMock = vi.fn()
const checkPremiumStatusMock = vi.fn()

vi.mock('@/lib/auth/require-user', async () => {
  const actual = await vi.importActual<typeof import('@/lib/auth/require-user')>(
    '@/lib/auth/require-user'
  )
  return {
    ...actual,
    requireUser: requireUserMock,
  }
})

vi.mock('@/db/queries/users', () => ({
  checkPremiumStatus: checkPremiumStatusMock,
}))

vi.mock('@/db', () => ({
  isDemoMode: false,
}))

function makeSupabaseMock(hintCount: number) {
  return {
    from(table: string) {
      if (table === 'ai_hint_usage') {
        return {
          select: () => ({
            eq: () => ({
              eq: () => ({
                single: async () => ({
                  data: { id: 'usage-1', hint_count: hintCount, camera_count: 0 },
                  error: null,
                }),
              }),
            }),
          }),
          update: () => ({ eq: async () => ({ error: null }) }),
          insert: async () => ({ error: null }),
        }
      }
      throw new Error(`Unexpected table in test mock: ${table}`)
    },
  }
}

vi.mock('@/lib/supabase/api', () => ({
  getApiSupabase: vi.fn(),
}))

const { getApiSupabase } = await import('@/lib/supabase/api')
const { POST } = await import('@/app/api/ai-hint/route')

function makeRequest(body: Record<string, unknown>) {
  return new NextRequest('http://localhost/api/ai-hint', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })
}

describe('POST /api/ai-hint premium status is server-derived', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    delete process.env.ANTHROPIC_API_KEY
    requireUserMock.mockResolvedValue({ id: 'free-user-1', email: 'a@b.com' })
  })

  it('ignores a client-supplied isPremium:true and still enforces the free-tier limit', async () => {
    checkPremiumStatusMock.mockResolvedValue(false)
    vi.mocked(getApiSupabase).mockReturnValue(
      makeSupabaseMock(5) as unknown as ReturnType<typeof getApiSupabase>
    )

    const res = await POST(
      makeRequest({ mode: 'step_hint', questionText: 'q', stepNumber: 1, isPremium: true })
    )

    expect(res.status).toBe(429)
    const body = await res.json()
    expect(body.error).toBe('Daily AI hint limit reached')
  })

  it('grants unlimited access when checkPremiumStatus(userId) actually returns true', async () => {
    checkPremiumStatusMock.mockResolvedValue(true)
    vi.mocked(getApiSupabase).mockReturnValue(
      makeSupabaseMock(5) as unknown as ReturnType<typeof getApiSupabase>
    )

    const res = await POST(makeRequest({ mode: 'step_hint', questionText: 'q', stepNumber: 1 }))

    expect(res.status).toBe(200)
  })
})
