import { describe, it, expect, vi, beforeEach } from 'vitest'

const isDemoAuthMock = vi.fn()
const requireAdminMock = vi.fn()

vi.mock('@/lib/auth/require-user', async () => {
  const actual = await vi.importActual<typeof import('@/lib/auth/require-user')>(
    '@/lib/auth/require-user'
  )
  return {
    ...actual,
    isDemoAuth: isDemoAuthMock,
    requireAdmin: requireAdminMock,
  }
})

const { AuthError } = await import('@/lib/auth/require-user')

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

describe('AdminLayout (fail closed, delegates to src/lib/auth/require-user)', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('allows access in demo mode without calling requireAdmin', async () => {
    isDemoAuthMock.mockReturnValue(true)

    const result = await AdminLayout({ children: null })

    expect(result).toBeTruthy()
    expect(requireAdminMock).not.toHaveBeenCalled()
    expect(redirectMock).not.toHaveBeenCalled()
  })

  it('redirects to /login (fails closed) on an unexpected error from requireAdmin', async () => {
    isDemoAuthMock.mockReturnValue(false)
    requireAdminMock.mockRejectedValueOnce(new Error('db unreachable'))

    await expect(AdminLayout({ children: null })).rejects.toThrow('NEXT_REDIRECT:/login')
    expect(redirectMock).toHaveBeenCalledWith('/login')
  })

  it('redirects to /login when requireAdmin throws a 401 AuthError (no session)', async () => {
    isDemoAuthMock.mockReturnValue(false)
    requireAdminMock.mockRejectedValueOnce(new AuthError('Unauthorized', 401))

    await expect(AdminLayout({ children: null })).rejects.toThrow('NEXT_REDIRECT:/login')
    expect(redirectMock).toHaveBeenCalledWith('/login')
  })

  it('redirects to /dashboard when requireAdmin throws a 403 AuthError (authenticated non-admin)', async () => {
    isDemoAuthMock.mockReturnValue(false)
    requireAdminMock.mockRejectedValueOnce(new AuthError('Forbidden', 403))

    await expect(AdminLayout({ children: null })).rejects.toThrow('NEXT_REDIRECT:/dashboard')
    expect(redirectMock).toHaveBeenCalledWith('/dashboard')
  })

  it('renders for an admin session', async () => {
    isDemoAuthMock.mockReturnValue(false)
    requireAdminMock.mockResolvedValueOnce({ id: 'admin-1', email: 'admin@example.com' })

    const result = await AdminLayout({ children: null })
    expect(result).toBeTruthy()
    expect(redirectMock).not.toHaveBeenCalled()
  })
})
