import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'

const lookupCertificateMock = vi.fn()

vi.mock('@/lib/certificates/verify-certificate', () => ({
  lookupCertificate: lookupCertificateMock,
}))

const { default: VerifyCertificatePage } = await import('@/app/verify/[certificateId]/page')

describe('VerifyCertificatePage (public, unauthenticated)', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders a "valid certificate" card with the student and course details', async () => {
    lookupCertificateMock.mockResolvedValueOnce({
      studentName: 'Thabo Nkosi',
      certificateId: 'AT-2026-ABCD1234',
      issuedAt: '2026-03-01T00:00:00.000Z',
      modulesCompleted: 5,
      avgPromptScore: 4.2,
      issuer: 'Angelo Tutoring',
      course: 'AI Literacy Curriculum',
    })

    const element = await VerifyCertificatePage({
      params: Promise.resolve({ certificateId: 'AT-2026-ABCD1234' }),
    })
    render(element)

    expect(screen.getByText('Valid certificate')).toBeInTheDocument()
    expect(screen.getByText('Thabo Nkosi')).toBeInTheDocument()
    expect(screen.getByText(/AI Literacy Curriculum/)).toBeInTheDocument()
    expect(screen.getByText('4.2 / 5')).toBeInTheDocument()
    expect(screen.getByText('5 / 5')).toBeInTheDocument()
    expect(screen.getByText('AT-2026-ABCD1234')).toBeInTheDocument()
    expect(lookupCertificateMock).toHaveBeenCalledWith('AT-2026-ABCD1234')
  })

  it('renders a "not found" card with a link home when no certificate matches', async () => {
    lookupCertificateMock.mockResolvedValueOnce(null)

    const element = await VerifyCertificatePage({
      params: Promise.resolve({ certificateId: 'AT-2026-NOPE0000' }),
    })
    render(element)

    expect(screen.getByText('Certificate not found')).toBeInTheDocument()
    expect(screen.getByText('AT-2026-NOPE0000')).toBeInTheDocument()
    expect(screen.getByRole('link', { name: /Angelo Tutoring/ })).toHaveAttribute('href', '/')
  })
})
