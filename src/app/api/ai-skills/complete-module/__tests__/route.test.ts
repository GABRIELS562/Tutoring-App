import { describe, it, expect, vi, beforeEach } from 'vitest'
import { NextRequest } from 'next/server'

const requireUserMock = vi.fn()

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
  getApiSupabase: vi.fn(() => null),
}))

const { AuthError } = await import('@/lib/auth/require-user')
const { POST } = await import('@/app/api/ai-skills/complete-module/route')

function makeRequest(body: Record<string, unknown>) {
  return new NextRequest('http://localhost/api/ai-skills/complete-module', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })
}

describe('POST /api/ai-skills/complete-module', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('returns 401 when there is no session', async () => {
    requireUserMock.mockRejectedValueOnce(
      new AuthError('Unauthorized', 401)
    )

    const res = await POST(makeRequest({ moduleId: 'ai-what-is' }))
    expect(res.status).toBe(401)
  })

  it('succeeds without a userId in the request body (derived from session instead)', async () => {
    requireUserMock.mockResolvedValueOnce({ id: 'session-user-1', email: 'a@b.com' })

    const res = await POST(makeRequest({ moduleId: 'ai-what-is' }))
    expect(res.status).toBe(200)
    const body = await res.json()
    expect(body.success).toBe(true)
  })
})
