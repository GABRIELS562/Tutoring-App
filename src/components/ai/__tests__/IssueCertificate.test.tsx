import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import IssueCertificate from '../IssueCertificate'

vi.mock('@/components/ai/CertificateGenerator', () => ({
  default: ({ certificateId }: { certificateId: string }) => (
    <div data-testid="certificate-generator">{certificateId}</div>
  ),
}))

const ORIGINAL_FETCH = global.fetch

describe('IssueCertificate', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  afterEach(() => {
    global.fetch = ORIGINAL_FETCH
  })

  it('calls POST /api/ai-skills/issue-certificate on mount and renders the result', async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        certificate: {
          studentName: 'Thabo',
          certificateId: 'AT-2026-ABCD1234',
          avgPromptScore: 4.2,
          modulesCompleted: 5,
          issuedAt: new Date().toISOString(),
        },
      }),
    })

    render(<IssueCertificate />)

    await waitFor(() => {
      expect(screen.getByTestId('certificate-generator')).toBeInTheDocument()
    })

    expect(global.fetch).toHaveBeenCalledWith(
      '/api/ai-skills/issue-certificate',
      expect.objectContaining({ method: 'POST' })
    )
    expect(screen.getByText('AT-2026-ABCD1234')).toBeInTheDocument()
  })

  it('shows an error state with a retry button when issuance fails', async () => {
    const user = userEvent.setup()
    global.fetch = vi
      .fn()
      .mockResolvedValueOnce({
        ok: false,
        json: async () => ({ error: 'Complete all 5 AI Literacy modules to unlock your certificate.' }),
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          certificate: {
            studentName: 'Thabo',
            certificateId: 'AT-2026-RETRY0001',
            avgPromptScore: 4.0,
            modulesCompleted: 5,
            issuedAt: new Date().toISOString(),
          },
        }),
      })

    render(<IssueCertificate />)

    await waitFor(() => {
      expect(screen.getByText(/couldn.t create your certificate/i)).toBeInTheDocument()
    })
    expect(
      screen.getByText(/complete all 5 ai literacy modules/i)
    ).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: /try again/i }))

    await waitFor(() => {
      expect(screen.getByTestId('certificate-generator')).toBeInTheDocument()
    })
    expect(global.fetch).toHaveBeenCalledTimes(2)
  })
})
