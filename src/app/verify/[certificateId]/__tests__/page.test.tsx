import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'

const lookupCertificateMock = vi.fn()
const checkRateLimitMock = vi.fn()
const headersMock = vi.fn()

vi.mock('@/lib/certificates/verify-certificate', () => ({
  lookupCertificate: lookupCertificateMock,
}))

vi.mock('@/lib/rate-limit', async () => {
  const actual = await vi.importActual<typeof import('@/lib/rate-limit')>('@/lib/rate-limit')
  return {
    ...actual,
    checkRateLimit: checkRateLimitMock,
  }
})

vi.mock('next/headers', () => ({
  headers: headersMock,
}))

const { default: VerifyCertificatePage } = await import('@/app/verify/[certificateId]/page')

function makeHeaders(forwardedFor: string | null) {
  return {
    get: (name: string) => (name === 'x-forwarded-for' ? forwardedFor : null),
  }
}

describe('VerifyCertificatePage (public, unauthenticated)', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    checkRateLimitMock.mockReturnValue({ allowed: true, remaining: 29, resetAt: Date.now() + 1000 })
    headersMock.mockResolvedValue(makeHeaders('203.0.113.5'))
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

  describe('id format validation', () => {
    it.each([
      'not-a-certificate-id',
      'AT-26-ABCD1234', // year not 4 digits
      'AT-2026-abcd1234', // lowercase not allowed
      'AT-2026-ABCD123', // only 7 chars
      'AT-2026-ABCD12345', // 9 chars
      "AT-2026-ABCD1234' OR '1'='1", // injection-shaped garbage
    ])('rejects %s before ever querying (fail fast, "not found" card)', async (badId) => {
      const element = await VerifyCertificatePage({
        params: Promise.resolve({ certificateId: badId }),
      })
      render(element)

      expect(screen.getByText('Certificate not found')).toBeInTheDocument()
      expect(lookupCertificateMock).not.toHaveBeenCalled()
      expect(checkRateLimitMock).not.toHaveBeenCalled()
    })

    it('accepts a well-formed id and proceeds to the rate limit check + lookup', async () => {
      lookupCertificateMock.mockResolvedValueOnce(null)

      await VerifyCertificatePage({
        params: Promise.resolve({ certificateId: 'AT-2026-ABCD1234' }),
      })

      expect(checkRateLimitMock).toHaveBeenCalled()
      expect(lookupCertificateMock).toHaveBeenCalledWith('AT-2026-ABCD1234')
    })
  })

  describe('rate limiting', () => {
    it('uses the same "verify:<ip>" key as the API route, with the IP from next/headers', async () => {
      headersMock.mockResolvedValueOnce(makeHeaders('198.51.100.7, 10.0.0.1'))
      lookupCertificateMock.mockResolvedValueOnce(null)

      await VerifyCertificatePage({
        params: Promise.resolve({ certificateId: 'AT-2026-ABCD1234' }),
      })

      expect(checkRateLimitMock).toHaveBeenCalledWith('verify:198.51.100.7')
    })

    it('shows the same "not found" card (no distinct message) when rate limited, and never queries', async () => {
      checkRateLimitMock.mockReturnValue({ allowed: false, remaining: 0, resetAt: Date.now() + 1000 })

      const element = await VerifyCertificatePage({
        params: Promise.resolve({ certificateId: 'AT-2026-ABCD1234' }),
      })
      render(element)

      expect(screen.getByText('Certificate not found')).toBeInTheDocument()
      expect(lookupCertificateMock).not.toHaveBeenCalled()
    })
  })
})
