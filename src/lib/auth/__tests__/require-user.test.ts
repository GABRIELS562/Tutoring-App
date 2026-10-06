import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'

const getUserMock = vi.fn()
const createServerClientMock = vi.fn(() => ({
  auth: { getUser: getUserMock },
}))
const isUserAdminMock = vi.fn()

vi.mock('@supabase/ssr', () => ({
  createServerClient: createServerClientMock,
}))

vi.mock('next/headers', () => ({
  cookies: vi.fn(async () => ({
    getAll: () => [],
    set: () => {},
  })),
}))

vi.mock('@/db/queries/admin', () => ({
  isUserAdmin: isUserAdminMock,
}))

// Import after mocks are registered
const {
  getSessionUser,
  requireUser,
  requireAdmin,
  authErrorResponse,
  isDemoAuth,
  AuthError,
} = await import('@/lib/auth/require-user')

const ORIGINAL_ENV = { ...process.env }

function setEnv(overrides: Record<string, string | undefined>) {
  for (const [key, value] of Object.entries(overrides)) {
    if (value === undefined) {
      delete process.env[key]
    } else {
      process.env[key] = value
    }
  }
}

describe('require-user auth helpers', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    setEnv({
      NEXT_PUBLIC_SUPABASE_URL: undefined,
      NEXT_PUBLIC_SUPABASE_ANON_KEY: undefined,
      ADMIN_EMAIL: undefined,
      NODE_ENV: 'test',
    })
  })

  afterEach(() => {
    process.env = { ...ORIGINAL_ENV }
  })

  describe('isDemoAuth', () => {
    it('is true when Supabase env is unset and NODE_ENV is not production', () => {
      expect(isDemoAuth()).toBe(true)
    })

    it('is false when Supabase env is unset but NODE_ENV is production', () => {
      setEnv({ NODE_ENV: 'production' })
      expect(isDemoAuth()).toBe(false)
    })

    it('is false when Supabase env is configured', () => {
      setEnv({
        NEXT_PUBLIC_SUPABASE_URL: 'https://example.supabase.co',
        NEXT_PUBLIC_SUPABASE_ANON_KEY: 'anon-key',
      })
      expect(isDemoAuth()).toBe(false)
    })
  })

  describe('getSessionUser', () => {
    it('returns the demo user in demo mode without calling Supabase', async () => {
      const user = await getSessionUser()
      expect(user).toEqual({ id: 'demo-user', email: 'demo@example.com' })
      expect(createServerClientMock).not.toHaveBeenCalled()
    })

    it('returns null when Supabase env is missing in production (no demo fallback)', async () => {
      setEnv({ NODE_ENV: 'production' })
      const user = await getSessionUser()
      expect(user).toBeNull()
    })

    it('returns null when there is no authenticated session', async () => {
      setEnv({
        NEXT_PUBLIC_SUPABASE_URL: 'https://example.supabase.co',
        NEXT_PUBLIC_SUPABASE_ANON_KEY: 'anon-key',
      })
      getUserMock.mockResolvedValueOnce({ data: { user: null } })

      const user = await getSessionUser()
      expect(user).toBeNull()
    })

    it('returns the mapped user when a session exists', async () => {
      setEnv({
        NEXT_PUBLIC_SUPABASE_URL: 'https://example.supabase.co',
        NEXT_PUBLIC_SUPABASE_ANON_KEY: 'anon-key',
      })
      getUserMock.mockResolvedValueOnce({
        data: { user: { id: 'real-user-1', email: 'student@example.com' } },
      })

      const user = await getSessionUser()
      expect(user).toEqual({ id: 'real-user-1', email: 'student@example.com' })
    })
  })

  describe('requireUser', () => {
    it('throws a 401 AuthError when there is no session', async () => {
      setEnv({
        NEXT_PUBLIC_SUPABASE_URL: 'https://example.supabase.co',
        NEXT_PUBLIC_SUPABASE_ANON_KEY: 'anon-key',
      })
      getUserMock.mockResolvedValueOnce({ data: { user: null } })

      await expect(requireUser()).rejects.toMatchObject({ status: 401 })
    })

    it('returns the session user when authenticated', async () => {
      const user = await requireUser()
      expect(user.id).toBe('demo-user')
    })
  })

  describe('requireAdmin', () => {
    it('allows admin access in demo mode (dev only)', async () => {
      const user = await requireAdmin()
      expect(user.id).toBe('demo-user')
    })

    it('throws 401 when unauthenticated', async () => {
      setEnv({
        NEXT_PUBLIC_SUPABASE_URL: 'https://example.supabase.co',
        NEXT_PUBLIC_SUPABASE_ANON_KEY: 'anon-key',
      })
      getUserMock.mockResolvedValueOnce({ data: { user: null } })

      await expect(requireAdmin()).rejects.toMatchObject({ status: 401 })
    })

    it('throws 403 for an authenticated non-admin user', async () => {
      setEnv({
        NEXT_PUBLIC_SUPABASE_URL: 'https://example.supabase.co',
        NEXT_PUBLIC_SUPABASE_ANON_KEY: 'anon-key',
      })
      getUserMock.mockResolvedValueOnce({
        data: { user: { id: 'student-1', email: 'student@example.com' } },
      })
      isUserAdminMock.mockResolvedValueOnce(false)

      await expect(requireAdmin()).rejects.toMatchObject({ status: 403 })
    })

    it('allows access when isUserAdmin returns true', async () => {
      setEnv({
        NEXT_PUBLIC_SUPABASE_URL: 'https://example.supabase.co',
        NEXT_PUBLIC_SUPABASE_ANON_KEY: 'anon-key',
      })
      getUserMock.mockResolvedValueOnce({
        data: { user: { id: 'admin-1', email: 'admin@example.com' } },
      })
      isUserAdminMock.mockResolvedValueOnce(true)

      const user = await requireAdmin()
      expect(user.id).toBe('admin-1')
    })

    it('allows access when ADMIN_EMAIL matches the session email', async () => {
      setEnv({
        NEXT_PUBLIC_SUPABASE_URL: 'https://example.supabase.co',
        NEXT_PUBLIC_SUPABASE_ANON_KEY: 'anon-key',
        ADMIN_EMAIL: 'owner@example.com',
      })
      getUserMock.mockResolvedValueOnce({
        data: { user: { id: 'owner-1', email: 'owner@example.com' } },
      })
      isUserAdminMock.mockResolvedValueOnce(false)

      const user = await requireAdmin()
      expect(user.id).toBe('owner-1')
    })

    it('matches ADMIN_EMAIL case-insensitively', async () => {
      setEnv({
        NEXT_PUBLIC_SUPABASE_URL: 'https://example.supabase.co',
        NEXT_PUBLIC_SUPABASE_ANON_KEY: 'anon-key',
        ADMIN_EMAIL: 'Owner@Example.com',
      })
      getUserMock.mockResolvedValueOnce({
        data: { user: { id: 'owner-1', email: 'owner@example.com' } },
      })
      isUserAdminMock.mockResolvedValueOnce(false)

      const user = await requireAdmin()
      expect(user.id).toBe('owner-1')
    })
  })

  describe('authErrorResponse', () => {
    it('maps a 401 AuthError to an Unauthorized JSON response', async () => {
      const res = authErrorResponse(new AuthError('nope', 401))
      expect(res.status).toBe(401)
      const body = await res.json()
      expect(body).toEqual({ error: 'Unauthorized' })
    })

    it('maps a 403 AuthError to a Forbidden JSON response', async () => {
      const res = authErrorResponse(new AuthError('nope', 403))
      expect(res.status).toBe(403)
      const body = await res.json()
      expect(body).toEqual({ error: 'Forbidden' })
    })

    it('defaults unknown errors to 401 Unauthorized', async () => {
      const res = authErrorResponse(new Error('boom'))
      expect(res.status).toBe(401)
      const body = await res.json()
      expect(body).toEqual({ error: 'Unauthorized' })
    })
  })
})

/**
 * A demo deployment is a production build with no database, opted into by
 * name, meant to be explored in full - admin panel included - by whoever
 * the access gate in front of it has already let in.
 *
 * The thing these pin down is that it stays a CHOICE. A real deployment
 * that loses its Supabase env must not land here; it fails to boot
 * instead, because assertProductionEnv() only tolerates the demo flag when
 * every Supabase value is absent.
 */
describe('isDemoAuth on a demo deployment', () => {
  const ORIGINAL = { ...process.env }

  const set = (env: Record<string, string | undefined>) => {
    for (const [k, v] of Object.entries(env)) {
      if (v === undefined) delete process.env[k]
      else process.env[k] = v
    }
  }

  beforeEach(() => {
    set({
      NODE_ENV: 'production',
      NEXT_PUBLIC_SUPABASE_URL: undefined,
      NEXT_PUBLIC_SUPABASE_ANON_KEY: undefined,
      NEXT_PUBLIC_DEMO_DEPLOYMENT: undefined,
    })
  })

  afterEach(() => {
    process.env = { ...ORIGINAL }
  })

  it('is true in a production build when the demo flag is set', () => {
    set({ NEXT_PUBLIC_DEMO_DEPLOYMENT: 'true' })

    expect(isDemoAuth()).toBe(true)
  })

  it('is false in a production build without the flag - a misconfigured deploy gets no admin', () => {
    expect(isDemoAuth()).toBe(false)
  })

  /**
   * The flag must never override configured Supabase. If someone sets it on
   * a real deployment, the live auth has to keep winning - otherwise one
   * stray environment variable turns a real site into an open admin panel.
   */
  it('is false when Supabase IS configured, even with the flag set', () => {
    set({
      NEXT_PUBLIC_DEMO_DEPLOYMENT: 'true',
      NEXT_PUBLIC_SUPABASE_URL: 'https://example.supabase.co',
      NEXT_PUBLIC_SUPABASE_ANON_KEY: 'anon-key',
    })

    expect(isDemoAuth()).toBe(false)
  })

  it('still works the old way in development, flag or no flag', () => {
    set({ NODE_ENV: 'development' })
    expect(isDemoAuth()).toBe(true)

    set({ NEXT_PUBLIC_DEMO_DEPLOYMENT: 'true' })
    expect(isDemoAuth()).toBe(true)
  })
})
