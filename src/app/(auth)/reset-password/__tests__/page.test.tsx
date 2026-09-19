import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor, act } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import ResetPasswordPage from '../page'
import en from '@/messages/en.json'

vi.mock('next-intl', () => ({
  useTranslations: () => (key: string) => (en.auth as Record<string, string>)[key] ?? key,
}))

const pushMock = vi.fn()
let searchParams = new URLSearchParams()

vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: pushMock }),
  useSearchParams: () => searchParams,
}))

const updateUserMock = vi.fn()
const signOutMock = vi.fn()
const getClaimsMock = vi.fn()
const onAuthStateChangeMock = vi.fn()
const unsubscribeMock = vi.fn()

vi.mock('@supabase/ssr', () => ({
  createBrowserClient: vi.fn(() => ({
    auth: {
      updateUser: updateUserMock,
      signOut: signOutMock,
      getClaims: getClaimsMock,
      onAuthStateChange: onAuthStateChangeMock,
    },
  })),
}))

/** A JWT claims payload whose amr marks this as a password-recovery session. */
const recoveryClaims = {
  data: { claims: { amr: [{ method: 'recovery', timestamp: 0 }] } },
  error: null,
}

/** A normal, already-signed-in session (e.g. signed in with a password). */
const normalSessionClaims = {
  data: { claims: { amr: [{ method: 'password', timestamp: 0 }] } },
  error: null,
}

/** No session at all. */
const noSessionClaims = { data: null, error: { message: 'no session' } }

describe('ResetPasswordPage', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    searchParams = new URLSearchParams()
    process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://example.supabase.co'
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = 'anon-key'
    // Default every test to a genuine recovery session unless overridden -
    // most tests are about the form itself, not the gating.
    getClaimsMock.mockResolvedValue(recoveryClaims)
    onAuthStateChangeMock.mockReturnValue({ data: { subscription: { unsubscribe: unsubscribeMock } } })
  })

  it('only reveals the password form once the session is confirmed as a recovery session', async () => {
    render(<ResetPasswordPage />)

    // Nothing that could let you set a password is shown before the check resolves
    expect(screen.queryByLabelText(en.auth.newPassword)).not.toBeInTheDocument()

    await screen.findByLabelText(en.auth.newPassword)
  })

  it('rejects a password shorter than 8 characters without calling Supabase', async () => {
    const user = userEvent.setup()
    render(<ResetPasswordPage />)
    await screen.findByLabelText(en.auth.newPassword)

    await user.type(screen.getByLabelText(en.auth.newPassword), 'short')
    await user.type(screen.getByLabelText(en.auth.confirmPassword), 'short')
    await user.click(screen.getByRole('button', { name: en.auth.updatePassword }))

    expect(screen.getByText(en.auth.passwordMinLength)).toBeInTheDocument()
    expect(updateUserMock).not.toHaveBeenCalled()
  })

  it('rejects mismatched password and confirmation', async () => {
    const user = userEvent.setup()
    render(<ResetPasswordPage />)
    await screen.findByLabelText(en.auth.newPassword)

    await user.type(screen.getByLabelText(en.auth.newPassword), 'longenough1')
    await user.type(screen.getByLabelText(en.auth.confirmPassword), 'longenough2')
    await user.click(screen.getByRole('button', { name: en.auth.updatePassword }))

    expect(screen.getByText(en.auth.passwordsDoNotMatch)).toBeInTheDocument()
    expect(updateUserMock).not.toHaveBeenCalled()
  })

  it('updates the password, signs out, and redirects to /login with a success flash on valid input', async () => {
    updateUserMock.mockResolvedValueOnce({ data: {}, error: null })
    signOutMock.mockResolvedValueOnce({ error: null })
    const user = userEvent.setup()
    render(<ResetPasswordPage />)
    await screen.findByLabelText(en.auth.newPassword)

    await user.type(screen.getByLabelText(en.auth.newPassword), 'longenough1')
    await user.type(screen.getByLabelText(en.auth.confirmPassword), 'longenough1')
    await user.click(screen.getByRole('button', { name: en.auth.updatePassword }))

    await waitFor(() => {
      expect(updateUserMock).toHaveBeenCalledWith({ password: 'longenough1' })
      expect(signOutMock).toHaveBeenCalled()
      expect(pushMock).toHaveBeenCalledWith('/login?reset=success')
    })
  })

  it('also shows the form when onAuthStateChange fires PASSWORD_RECOVERY, even if getClaims has not resolved yet', async () => {
    // Arrange - getClaims never resolves in this test; only the auth event does
    getClaimsMock.mockReturnValue(new Promise(() => {}))
    let capturedCallback: ((event: string, session: unknown) => void) | undefined
    onAuthStateChangeMock.mockImplementation((cb: (event: string, session: unknown) => void) => {
      capturedCallback = cb
      return { data: { subscription: { unsubscribe: unsubscribeMock } } }
    })

    render(<ResetPasswordPage />)
    expect(screen.queryByLabelText(en.auth.newPassword)).not.toBeInTheDocument()

    // Act
    act(() => {
      capturedCallback?.('PASSWORD_RECOVERY', {})
    })

    // Assert
    await screen.findByLabelText(en.auth.newPassword)
  })

  it('shows the invalid/expired link state instead of a form when ?error=invalid_link', async () => {
    searchParams = new URLSearchParams('error=invalid_link')
    render(<ResetPasswordPage />)

    expect(screen.getByText(en.auth.invalidResetLink)).toBeInTheDocument()
    expect(screen.queryByLabelText(en.auth.newPassword)).not.toBeInTheDocument()

    // linkInvalid short-circuits the render regardless of the session
    // gate, but the gate's own getClaims() check still resolves in the
    // background - let it settle before the test tears down so React
    // doesn't warn about an unwrapped state update after the fact.
    await act(async () => {
      await Promise.resolve()
    })
  })

  it('shows the invalid/expired link state when there is no session at all', async () => {
    getClaimsMock.mockResolvedValue(noSessionClaims)

    render(<ResetPasswordPage />)

    expect(await screen.findByText(en.auth.invalidResetLink)).toBeInTheDocument()
    expect(screen.queryByLabelText(en.auth.newPassword)).not.toBeInTheDocument()
  })

  it('shows a demo-mode explanation instead of the form when Supabase env is unset', () => {
    delete process.env.NEXT_PUBLIC_SUPABASE_URL
    delete process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

    render(<ResetPasswordPage />)

    expect(screen.getByText(en.auth.demoModeResetMessage)).toBeInTheDocument()
    expect(screen.queryByLabelText(en.auth.newPassword)).not.toBeInTheDocument()
  })

  describe('a normal (non-recovery) logged-in session', () => {
    it('shows an "already signed in" message with a link to the dashboard instead of the password form', async () => {
      getClaimsMock.mockResolvedValue(normalSessionClaims)

      render(<ResetPasswordPage />)

      expect(await screen.findByText(en.auth.normalSessionMessage)).toBeInTheDocument()
      expect(screen.getByRole('link', { name: en.auth.goToDashboard })).toHaveAttribute('href', '/dashboard')
    })

    it('never renders the password form or lets updateUser be called', async () => {
      getClaimsMock.mockResolvedValue(normalSessionClaims)

      render(<ResetPasswordPage />)

      await screen.findByText(en.auth.normalSessionMessage)
      expect(screen.queryByLabelText(en.auth.newPassword)).not.toBeInTheDocument()
      expect(updateUserMock).not.toHaveBeenCalled()
    })
  })
})
