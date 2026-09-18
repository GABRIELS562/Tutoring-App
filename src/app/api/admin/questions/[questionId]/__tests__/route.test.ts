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

vi.mock('@/db/queries/admin', () => ({
  getQuestionById: vi.fn(async () => ({ id: 'q1' })),
}))

const { AuthError } = await import('@/lib/auth/require-user')
const { GET } = await import('@/app/api/admin/questions/[questionId]/route')

function makeRequest() {
  return new NextRequest('http://localhost/api/admin/questions/q1', { method: 'GET' })
}

describe('GET /api/admin/questions/[questionId]', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('returns 401 when unauthenticated', async () => {
    requireAdminMock.mockRejectedValueOnce(
      new AuthError('Unauthorized', 401)
    )
    const res = await GET(makeRequest(), { params: Promise.resolve({ questionId: 'q1' }) })
    expect(res.status).toBe(401)
  })

  it('returns 403 for a non-admin session', async () => {
    requireAdminMock.mockRejectedValueOnce(
      new AuthError('Forbidden', 403)
    )
    const res = await GET(makeRequest(), { params: Promise.resolve({ questionId: 'q1' }) })
    expect(res.status).toBe(403)
  })

  it('succeeds for an admin session', async () => {
    requireAdminMock.mockResolvedValueOnce({ id: 'admin-1', email: 'a@b.com' })
    const res = await GET(makeRequest(), { params: Promise.resolve({ questionId: 'q1' }) })
    expect(res.status).toBe(200)
  })
})
