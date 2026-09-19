import { describe, it, expect, vi, beforeEach } from 'vitest'
import { NextRequest } from 'next/server'

const requireUserMock = vi.fn()
const getApiSupabaseMock = vi.fn(() => null)

vi.mock('@/lib/auth/require-user', async () => {
  const actual = await vi.importActual<typeof import('@/lib/auth/require-user')>(
    '@/lib/auth/require-user'
  )
  return {
    ...actual,
    requireUser: requireUserMock,
  }
})

vi.mock('@/lib/supabase/api', () => ({
  getApiSupabase: getApiSupabaseMock,
}))

const { POST } = await import('@/app/api/ai-hint/route')

function makeRequest(body: Record<string, unknown>) {
  return new NextRequest('http://localhost/api/ai-hint', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })
}

describe('POST /api/ai-hint rejects an oversized imageBase64', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    getApiSupabaseMock.mockReturnValue(null)
    delete process.env.ANTHROPIC_API_KEY
    requireUserMock.mockResolvedValue({ id: 'user-1', email: 'a@b.com' })
  })

  it('returns 413 with a friendly message when imageBase64 exceeds 4,000,000 chars', async () => {
    const oversizedImage = 'a'.repeat(4_000_001)

    const res = await POST(
      makeRequest({ mode: 'camera_scan', imageBase64: oversizedImage })
    )

    expect(res.status).toBe(413)
    const body = await res.json()
    expect(body.error).toBe('Image too large')
    expect(body.message).toBeTruthy()
  })

  it('allows imageBase64 exactly at the limit', async () => {
    const exactSizeImage = 'a'.repeat(4_000_000)

    const res = await POST(
      makeRequest({ mode: 'camera_scan', imageBase64: exactSizeImage })
    )

    expect(res.status).not.toBe(413)
  })

  it('does not reject a request with no imageBase64 at all', async () => {
    const res = await POST(
      makeRequest({ mode: 'step_hint', questionText: 'q', stepNumber: 1 })
    )

    expect(res.status).not.toBe(413)
  })
})
