import { describe, it, expect, vi, beforeEach } from 'vitest'

const { redirectMock, isDemoAuthMock } = vi.hoisted(() => ({
  redirectMock: vi.fn(),
  isDemoAuthMock: vi.fn<() => boolean>(),
}))

vi.mock('next/navigation', () => ({ redirect: redirectMock }))
vi.mock('@/lib/auth/require-user', () => ({ isDemoAuth: isDemoAuthMock }))

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
})
