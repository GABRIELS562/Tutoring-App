// @vitest-environment node
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { NextRequest } from 'next/server'

const exchangeCodeForSessionMock = vi.fn()

vi.mock('@/lib/supabase/server', () => ({
  createClient: vi.fn(async () => ({
    auth: { exchangeCodeForSession: exchangeCodeForSessionMock },
  })),
}))

const { GET } = await import('@/app/auth/callback/route')

function makeRequest(pathAndQuery: string) {
  return new NextRequest(`http://localhost${pathAndQuery}`, { method: 'GET' })
}

describe('GET /auth/callback', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('exchanges a valid code and redirects to the default next path', async () => {
    // Arrange
    exchangeCodeForSessionMock.mockResolvedValueOnce({ error: null })

    // Act
    const res = await GET(makeRequest('/auth/callback?code=abc123'))

    // Assert
    expect(exchangeCodeForSessionMock).toHaveBeenCalledWith('abc123')
    expect(res.status).toBe(307)
    expect(res.headers.get('location')).toBe('http://localhost/reset-password')
  })

  it('honours an explicit next param', async () => {
    exchangeCodeForSessionMock.mockResolvedValueOnce({ error: null })

    const res = await GET(makeRequest('/auth/callback?code=abc123&next=/dashboard'))

    expect(res.headers.get('location')).toBe('http://localhost/dashboard')
  })

  it('redirects to reset-password with an error flag when the exchange fails', async () => {
    exchangeCodeForSessionMock.mockResolvedValueOnce({ error: new Error('expired') })

    const res = await GET(makeRequest('/auth/callback?code=bad-code'))

    expect(res.headers.get('location')).toBe('http://localhost/reset-password?error=invalid_link')
  })

  it('redirects to reset-password with an error flag when no code is present', async () => {
    const res = await GET(makeRequest('/auth/callback'))

    expect(exchangeCodeForSessionMock).not.toHaveBeenCalled()
    expect(res.headers.get('location')).toBe('http://localhost/reset-password?error=invalid_link')
  })
})
