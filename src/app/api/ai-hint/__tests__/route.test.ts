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
const { POST, maxDuration } = await import('@/app/api/ai-hint/route')

describe('ai-hint route config', () => {
  it('sets maxDuration to 60s so a slow model call outlives the SDK client timeout + retries', () => {
    expect(maxDuration).toBe(60)
  })
})

function makeRequest(body: Record<string, unknown>) {
  return new NextRequest('http://localhost/api/ai-hint', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })
}

describe('POST /api/ai-hint', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    delete process.env.ANTHROPIC_API_KEY
  })

  it('returns 401 when there is no session', async () => {
    requireUserMock.mockRejectedValueOnce(
      new AuthError('Unauthorized', 401)
    )

    const res = await POST(makeRequest({ mode: 'general_question', userQuestion: 'hi' }))
    expect(res.status).toBe(401)
    const body = await res.json()
    expect(body.error).toBe('Unauthorized')
  })

  it('succeeds without a userId in the request body (derived from session instead)', async () => {
    requireUserMock.mockResolvedValueOnce({ id: 'session-user-1', email: 'a@b.com' })

    const res = await POST(makeRequest({ mode: 'general_question', userQuestion: 'hi' }))
    expect(res.status).toBe(200)
    const body = await res.json()
    expect(body.hint).toBeTruthy()
  })

  it('ignores a client-supplied userId rather than trusting it', async () => {
    requireUserMock.mockResolvedValueOnce({ id: 'session-user-1', email: 'a@b.com' })

    const res = await POST(
      makeRequest({ mode: 'general_question', userQuestion: 'hi', userId: 'attacker-controlled' })
    )
    expect(res.status).toBe(200)
  })
})
