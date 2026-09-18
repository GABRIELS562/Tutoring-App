import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { NextRequest } from 'next/server'

const fromMock = vi.fn()
const createClientMock = vi.fn(() => ({ from: fromMock }))

vi.mock('@supabase/supabase-js', () => ({
  createClient: createClientMock,
}))

const { GET } = await import('@/app/api/verify/[certificateId]/route')

function makeRequest(certificateId: string) {
  return new NextRequest(`http://localhost/api/verify/${certificateId}`, {
    method: 'GET',
    headers: { 'x-forwarded-for': `172.16.0.${Math.floor(Math.random() * 255)}` },
  })
}

describe('GET /api/verify/[certificateId] reads the public_certificates view, not the base table', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://example.supabase.co'
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = 'anon-key'
  })

  afterEach(() => {
    delete process.env.NEXT_PUBLIC_SUPABASE_URL
    delete process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    delete process.env.SUPABASE_SERVICE_ROLE_KEY
  })

  it('queries the public_certificates view, never ai_certificates directly', async () => {
    fromMock.mockReturnValue({
      select: () => ({
        eq: () => ({
          single: async () => ({
            data: {
              certificate_id: 'AT-2026-ABCD1234',
              student_name: 'Thabo',
              issued_at: new Date().toISOString(),
              modules_completed: 5,
              avg_prompt_score: '4.2',
            },
            error: null,
          }),
        }),
      }),
    })

    const res = await GET(makeRequest('AT-2026-ABCD1234'), {
      params: Promise.resolve({ certificateId: 'AT-2026-ABCD1234' }),
    })

    expect(res.status).toBe(200)
    expect(fromMock).toHaveBeenCalledWith('public_certificates')
    expect(fromMock).not.toHaveBeenCalledWith('ai_certificates')
  })
})
