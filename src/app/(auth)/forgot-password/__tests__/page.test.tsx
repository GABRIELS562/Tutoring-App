import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import ForgotPasswordPage from '../page'
import en from '@/messages/en.json'

vi.mock('next-intl', () => ({
  useTranslations: () => (key: string) => (en.auth as Record<string, string>)[key] ?? key,
}))

const resetPasswordForEmailMock = vi.fn()

vi.mock('@supabase/ssr', () => ({
  createBrowserClient: vi.fn(() => ({
    auth: { resetPasswordForEmail: resetPasswordForEmailMock },
  })),
}))

describe('ForgotPasswordPage', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://example.supabase.co'
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = 'anon-key'
  })

  it('shows the generic "check your email" message after submit when the account exists', async () => {
    // Arrange
    resetPasswordForEmailMock.mockResolvedValueOnce({ data: {}, error: null })
    const user = userEvent.setup()
    render(<ForgotPasswordPage />)

    // Act
    await user.type(screen.getByLabelText(en.auth.email), 'real@example.com')
    await user.click(screen.getByRole('button', { name: en.auth.sendResetLink }))

    // Assert
    await waitFor(() => {
      expect(screen.getByText(en.auth.resetLinkSentMessage)).toBeInTheDocument()
    })
  })

  it('shows the exact same "check your email" message when the account does not exist', async () => {
    // Arrange: Supabase reports an error (e.g. no user with that email) -
    // the UI must not leak that distinction.
    resetPasswordForEmailMock.mockResolvedValueOnce({
      data: {},
      error: { message: 'User not found' },
    })
    const user = userEvent.setup()
    render(<ForgotPasswordPage />)

    // Act
    await user.type(screen.getByLabelText(en.auth.email), 'nobody@example.com')
    await user.click(screen.getByRole('button', { name: en.auth.sendResetLink }))

    // Assert
    await waitFor(() => {
      expect(screen.getByText(en.auth.resetLinkSentMessage)).toBeInTheDocument()
    })
  })

  it('never reveals a distinguishable state between existing and non-existing emails', async () => {
    const outcomes: string[] = []

    for (const error of [null, { message: 'User not found' }]) {
      resetPasswordForEmailMock.mockResolvedValueOnce({ data: {}, error })
      const user = userEvent.setup()
      const { unmount } = render(<ForgotPasswordPage />)

      await user.type(screen.getByLabelText(en.auth.email), 'someone@example.com')
      await user.click(screen.getByRole('button', { name: en.auth.sendResetLink }))

      await waitFor(() => {
        outcomes.push(screen.getByRole('status').textContent ?? '')
      })
      unmount()
    }

    expect(outcomes[0]).toBe(outcomes[1])
  })

  it('calls resetPasswordForEmail with a redirectTo pointing at the auth callback', async () => {
    resetPasswordForEmailMock.mockResolvedValueOnce({ data: {}, error: null })
    const user = userEvent.setup()
    render(<ForgotPasswordPage />)

    await user.type(screen.getByLabelText(en.auth.email), 'real@example.com')
    await user.click(screen.getByRole('button', { name: en.auth.sendResetLink }))

    await waitFor(() => {
      expect(resetPasswordForEmailMock).toHaveBeenCalledWith(
        'real@example.com',
        expect.objectContaining({
          redirectTo: expect.stringContaining('/auth/callback?next=/reset-password'),
        })
      )
    })
  })
})
