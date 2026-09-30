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

/**
 * In demo mode there is nothing to sign in to, so the auth pages are a
 * dead end: /login offers a form that cannot work and a "Continue as Demo
 * User" button as the only way out, and signing out lands you there. It
 * reads as the app demanding an account it never needed.
 *
 * Production is unaffected: assertProductionEnv() (imported by proxy.ts
 * for that side effect) refuses to boot without Supabase env, so this
 * branch is unreachable there and the real login flow is untouched.
 */
describe('demo mode does not ask for a login it cannot perform', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    delete process.env.NEXT_PUBLIC_SUPABASE_URL
    delete process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  })

  it.each(['/login', '/signup', '/forgot-password', '/reset-password'])(
    'sends %s to the dashboard',
    async (pathname) => {
      const res = await proxy(makeRequest(pathname))

      expect(res.status).toBe(307)
      expect(res.headers.get('location')).toContain('/dashboard')
    }
  )

  it('never calls Supabase when it is not configured', async () => {
    await proxy(makeRequest('/login'))

    expect(createServerClientMock).not.toHaveBeenCalled()
  })

  it('still lets every other route through untouched', async () => {
    for (const pathname of ['/dashboard', '/papers', '/topics/trig-gr11', '/exam']) {
      const res = await proxy(makeRequest(pathname))
      expect(res.status, pathname).toBe(200)
    }
  })

  /**
   * The bypass must not leak into a configured deployment - there, /login
   * is a real page and the only thing that redirects away from it is
   * already having a session.
   */
  it('leaves the auth pages alone once Supabase is configured', async () => {
    process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://example.supabase.co'
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = 'anon-key'
    getUserMock.mockResolvedValueOnce({ data: { user: null } })

    const res = await proxy(makeRequest('/login'))

    expect(res.status).toBe(200)
  })
})
