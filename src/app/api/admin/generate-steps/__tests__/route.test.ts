import { describe, it, expect, vi, beforeEach } from 'vitest'
import { NextRequest } from 'next/server'

const requireAdminMock = vi.fn()

vi.mock('@/lib/auth/require-user', async () => {
  const actual = await vi.importActual<typeof import('@/lib/auth/require-user')>(
    '@/lib/auth/require-user'
  )
  return {
    ...actual,
    requireAdmin: requireAdminMock,
  }
})

const { AuthError } = await import('@/lib/auth/require-user')
const { POST } = await import('@/app/api/admin/generate-steps/route')

function makeRequest(body: Record<string, unknown>) {
  return new NextRequest('http://localhost/api/admin/generate-steps', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })
}

describe('POST /api/admin/generate-steps', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    delete process.env.ANTHROPIC_API_KEY
  })

  it('returns 401 when unauthenticated', async () => {
    requireAdminMock.mockRejectedValueOnce(
      new AuthError('Unauthorized', 401)
    )
    const res = await POST(makeRequest({ questionText: 'Solve x' }))
    expect(res.status).toBe(401)
  })

  it('returns 403 for a non-admin session', async () => {
    requireAdminMock.mockRejectedValueOnce(
      new AuthError('Forbidden', 403)
    )
    const res = await POST(makeRequest({ questionText: 'Solve x' }))
    expect(res.status).toBe(403)
  })

  it('succeeds for an admin session', async () => {
    requireAdminMock.mockResolvedValueOnce({ id: 'admin-1', email: 'a@b.com' })
    const res = await POST(makeRequest({ questionText: 'Solve x' }))
    expect(res.status).toBe(200)
  })
})
