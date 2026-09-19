// @vitest-environment node
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { NextRequest } from 'next/server'

const getUserMock = vi.fn()
const createServerClientMock = vi.fn(() => ({
  auth: { getUser: getUserMock },
}))

vi.mock('@supabase/ssr', () => ({
  createServerClient: createServerClientMock,
}))

const { proxy } = await import('@/proxy')

function makeRequest(pathname: string) {
  return new NextRequest(`http://localhost${pathname}`, { method: 'GET' })
}

describe('proxy', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://example.supabase.co'
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = 'anon-key'
  })

  it('returns a 401 JSON response (not a redirect) for /api/admin without a session', async () => {
    getUserMock.mockResolvedValueOnce({ data: { user: null } })

    const res = await proxy(makeRequest('/api/admin/topics'))

    expect(res.status).toBe(401)
    const body = await res.json()
    expect(body).toEqual({ error: 'Unauthorized' })
  })

  it('passes /api/admin through when a session exists', async () => {
    getUserMock.mockResolvedValueOnce({ data: { user: { id: 'u1' } } })

    const res = await proxy(makeRequest('/api/admin/topics'))

    expect(res.status).not.toBe(401)
  })

  it('still redirects (not JSON) for the /admin page route without a session', async () => {
    getUserMock.mockResolvedValueOnce({ data: { user: null } })

    const res = await proxy(makeRequest('/admin'))

    expect(res.status).toBe(307)
    expect(res.headers.get('location')).toContain('/login')
  })

  describe.each(['/forgot-password', '/reset-password', '/auth/callback'])(
    'password reset route %s',
    (route) => {
      it('is reachable without a session (not redirected to /login)', async () => {
        getUserMock.mockResolvedValueOnce({ data: { user: null } })

        const res = await proxy(makeRequest(route))

        expect(res.status).not.toBe(307)
        expect(res.status).not.toBe(401)
      })

      it('does not bounce a logged-in user away (unlike /login and /signup)', async () => {
        getUserMock.mockResolvedValueOnce({ data: { user: { id: 'u1' } } })

        const res = await proxy(makeRequest(route))

        expect(res.headers.get('location')).toBeNull()
      })
    }
  )
})
