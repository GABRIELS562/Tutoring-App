import { describe, it, expect, vi, beforeEach } from 'vitest'

const { redirectMock, isDemoAuthMock, isDemoDeploymentMock } = vi.hoisted(() => ({
  redirectMock: vi.fn(),
  isDemoAuthMock: vi.fn<() => boolean>(),
  isDemoDeploymentMock: vi.fn<() => boolean>(),
}))

vi.mock('next/navigation', () => ({ redirect: redirectMock }))
vi.mock('@/lib/auth/require-user', () => ({ isDemoAuth: isDemoAuthMock }))
vi.mock('@/lib/env', () => ({ isDemoDeployment: isDemoDeploymentMock }))

const { default: Home } = await import('@/app/page')

/**
 * "/" used to redirect to /login unconditionally.
 *
 * With no Supabase configured - the demo setup, where the app deliberately
 * runs as a demo student and every route is open - that put a sign-in wall
 * in front of an account that cannot exist. Opening the app at its own root
 * was the one route that did not work, and the only ways past it were
 * knowing the /dashboard URL or spotting "Continue as Demo User".
 *
 * It went unnoticed because the route sweeps used `curl -L`, which follows
 * the redirect and reports the 200 from /login.
 */
describe('the root route', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    isDemoAuthMock.mockReturnValue(false)
    isDemoDeploymentMock.mockReturnValue(false)
  })

  it('goes to the dashboard when the app is running in demo auth', () => {
    isDemoAuthMock.mockReturnValue(true)

    Home()

    expect(redirectMock).toHaveBeenCalledWith('/dashboard')
  })

  it('still goes to login when Supabase is configured', () => {
    isDemoAuthMock.mockReturnValue(false)

    Home()

    expect(redirectMock).toHaveBeenCalledWith('/login')
  })

  /**
   * On the production demo deployment isDemoAuth() is false by design - it
   * gates demo-admin, which has to stay shut - but the proxy is still open
   * and the app still serves a demo student. "/" therefore went to /login
   * and was bounced on to /dashboard: two redirects through a sign-in page,
   * for the single URL the client is given.
   */
  it('goes straight to the dashboard on a demo deployment, without passing through login', () => {
    isDemoAuthMock.mockReturnValue(false)
    isDemoDeploymentMock.mockReturnValue(true)

    Home()

    expect(redirectMock).toHaveBeenCalledWith('/dashboard')
    expect(redirectMock).not.toHaveBeenCalledWith('/login')
  })
})
