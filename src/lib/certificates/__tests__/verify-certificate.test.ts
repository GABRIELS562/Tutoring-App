import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'

const fromMock = vi.fn()
const createClientMock = vi.fn(() => ({ from: fromMock }))

vi.mock('@supabase/supabase-js', () => ({
  createClient: createClientMock,
}))

const { lookupCertificate } = await import('@/lib/certificates/verify-certificate')

describe('lookupCertificate', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    delete process.env.NEXT_PUBLIC_SUPABASE_URL
    delete process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    delete process.env.SUPABASE_SERVICE_ROLE_KEY
  })

  afterEach(() => {
    delete process.env.NEXT_PUBLIC_SUPABASE_URL
    delete process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    delete process.env.SUPABASE_SERVICE_ROLE_KEY
  })

  it('returns the demo certificate for AT-2026-DEMO when Supabase is unconfigured', async () => {
    const result = await lookupCertificate('AT-2026-DEMO')
    expect(result).not.toBeNull()
    expect(result?.studentName).toBe('Demo Student')
    expect(result?.certificateId).toBe('AT-2026-DEMO')
  })

  it('returns null for any other id when Supabase is unconfigured', async () => {
    const result = await lookupCertificate('AT-2026-REAL1234')
    expect(result).toBeNull()
  })

  it('queries the public_certificates view, never ai_certificates directly', async () => {
    process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://example.supabase.co'
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = 'anon-key'

    fromMock.mockReturnValue({
      select: () => ({
        eq: () => ({
          single: async () => ({
            data: {
              certificate_id: 'AT-2026-ABCD1234',
              student_name: 'Thabo',
              issued_at: '2026-03-01T00:00:00.000Z',
              modules_completed: 5,
              avg_prompt_score: '4.2',
            },
            error: null,
          }),
        }),
      }),
    })

    const result = await lookupCertificate('AT-2026-ABCD1234')

    expect(fromMock).toHaveBeenCalledWith('public_certificates')
    expect(fromMock).not.toHaveBeenCalledWith('ai_certificates')
    expect(result).toEqual({
      studentName: 'Thabo',
      certificateId: 'AT-2026-ABCD1234',
      issuedAt: '2026-03-01T00:00:00.000Z',
      modulesCompleted: 5,
      avgPromptScore: 4.2,
      issuer: 'Angelo Tutoring',
      course: 'AI Literacy Curriculum',
    })
  })

  it('returns null when no matching row is found', async () => {
    process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://example.supabase.co'
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = 'anon-key'

    fromMock.mockReturnValue({
      select: () => ({
        eq: () => ({
          single: async () => ({ data: null, error: { message: 'not found' } }),
        }),
      }),
    })

    const result = await lookupCertificate('AT-2026-NOPE0000')
    expect(result).toBeNull()
  })

  it('fails closed (returns null) when the lookup throws', async () => {
    process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://example.supabase.co'
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = 'anon-key'

    fromMock.mockImplementation(() => {
      throw new Error('connection reset')
    })

    const result = await lookupCertificate('AT-2026-ABCD1234')
    expect(result).toBeNull()
  })
})
