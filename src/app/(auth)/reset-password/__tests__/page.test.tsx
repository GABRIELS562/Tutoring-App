import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
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

vi.mock('@supabase/ssr', () => ({
  createBrowserClient: vi.fn(() => ({
    auth: { updateUser: updateUserMock, signOut: signOutMock },
  })),
}))

describe('ResetPasswordPage', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    searchParams = new URLSearchParams()
    process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://example.supabase.co'
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = 'anon-key'
  })

  it('rejects a password shorter than 8 characters without calling Supabase', async () => {
    const user = userEvent.setup()
    render(<ResetPasswordPage />)

    await user.type(screen.getByLabelText(en.auth.newPassword), 'short')
    await user.type(screen.getByLabelText(en.auth.confirmPassword), 'short')
    await user.click(screen.getByRole('button', { name: en.auth.updatePassword }))

    expect(screen.getByText(en.auth.passwordMinLength)).toBeInTheDocument()
    expect(updateUserMock).not.toHaveBeenCalled()
  })

  it('rejects mismatched password and confirmation', async () => {
    const user = userEvent.setup()
    render(<ResetPasswordPage />)

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

    await user.type(screen.getByLabelText(en.auth.newPassword), 'longenough1')
    await user.type(screen.getByLabelText(en.auth.confirmPassword), 'longenough1')
    await user.click(screen.getByRole('button', { name: en.auth.updatePassword }))

    await waitFor(() => {
      expect(updateUserMock).toHaveBeenCalledWith({ password: 'longenough1' })
      expect(signOutMock).toHaveBeenCalled()
      expect(pushMock).toHaveBeenCalledWith('/login?reset=success')
    })
  })

  it('shows the invalid/expired link state instead of a form when ?error=invalid_link', () => {
    searchParams = new URLSearchParams('error=invalid_link')
    render(<ResetPasswordPage />)

    expect(screen.getByText(en.auth.invalidResetLink)).toBeInTheDocument()
    expect(screen.queryByLabelText(en.auth.newPassword)).not.toBeInTheDocument()
  })

  it('shows a demo-mode explanation instead of the form when Supabase env is unset', () => {
    delete process.env.NEXT_PUBLIC_SUPABASE_URL
    delete process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

    render(<ResetPasswordPage />)

    expect(screen.getByText(en.auth.demoModeResetMessage)).toBeInTheDocument()
    expect(screen.queryByLabelText(en.auth.newPassword)).not.toBeInTheDocument()
  })
})
