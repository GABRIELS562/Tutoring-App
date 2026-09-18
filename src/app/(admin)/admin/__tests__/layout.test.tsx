import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'

const isDemoAuthMock = vi.fn()
const getSessionUserMock = vi.fn()
const isUserAdminMock = vi.fn()

vi.mock('@/lib/auth/require-user', () => ({
  isDemoAuth: isDemoAuthMock,
  getSessionUser: getSessionUserMock,
}))

vi.mock('@/db/queries/admin', () => ({
  isUserAdmin: isUserAdminMock,
}))

class RedirectSignal extends Error {
  path: string
  constructor(path: string) {
    super(`NEXT_REDIRECT:${path}`)
    this.path = path
  }
}

const redirectMock = vi.fn((path: string) => {
  throw new RedirectSignal(path)
})

vi.mock('next/navigation', () => ({
  redirect: redirectMock,
}))

vi.mock('@/app/(admin)/admin/AdminNav', () => ({
  default: () => null,
}))

const { default: AdminLayout } = await import('@/app/(admin)/admin/layout')

const ORIGINAL_ENV = { ...process.env }

describe('AdminLayout (fail closed)', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    delete process.env.ADMIN_EMAIL
  })

  afterEach(() => {
    process.env = { ...ORIGINAL_ENV }
  })

  it('allows access in demo mode without calling Supabase', async () => {
    isDemoAuthMock.mockReturnValue(true)

    const result = await AdminLayout({ children: null })

    expect(result).toBeTruthy()
    expect(getSessionUserMock).not.toHaveBeenCalled()
    expect(redirectMock).not.toHaveBeenCalled()
  })

  it('redirects to /login (fails closed) when getSessionUser throws', async () => {
    isDemoAuthMock.mockReturnValue(false)
    getSessionUserMock.mockRejectedValueOnce(new Error('db unreachable'))

    await expect(AdminLayout({ children: null })).rejects.toThrow('NEXT_REDIRECT:/login')
    expect(redirectMock).toHaveBeenCalledWith('/login')
  })

  it('redirects to /login when there is no session', async () => {
    isDemoAuthMock.mockReturnValue(false)
    getSessionUserMock.mockResolvedValueOnce(null)

    await expect(AdminLayout({ children: null })).rejects.toThrow('NEXT_REDIRECT:/login')
    expect(redirectMock).toHaveBeenCalledWith('/login')
  })

  it('redirects to /dashboard for an authenticated non-admin', async () => {
    isDemoAuthMock.mockReturnValue(false)
    getSessionUserMock.mockResolvedValueOnce({ id: 'u1', email: 'student@example.com' })
    isUserAdminMock.mockResolvedValueOnce(false)

    await expect(AdminLayout({ children: null })).rejects.toThrow('NEXT_REDIRECT:/dashboard')
    expect(redirectMock).toHaveBeenCalledWith('/dashboard')
  })

  it('renders for an admin session (isUserAdmin true)', async () => {
    isDemoAuthMock.mockReturnValue(false)
    getSessionUserMock.mockResolvedValueOnce({ id: 'admin-1', email: 'admin@example.com' })
    isUserAdminMock.mockResolvedValueOnce(true)

    const result = await AdminLayout({ children: null })
    expect(result).toBeTruthy()
    expect(redirectMock).not.toHaveBeenCalled()
  })

  it('renders when ADMIN_EMAIL matches even if isUserAdmin is false', async () => {
    process.env.ADMIN_EMAIL = 'owner@example.com'
    isDemoAuthMock.mockReturnValue(false)
    getSessionUserMock.mockResolvedValueOnce({ id: 'owner-1', email: 'owner@example.com' })
    isUserAdminMock.mockResolvedValueOnce(false)

    const result = await AdminLayout({ children: null })
    expect(result).toBeTruthy()
    expect(redirectMock).not.toHaveBeenCalled()
  })
})
