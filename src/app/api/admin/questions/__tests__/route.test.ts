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
  getQuestionsForTopic: vi.fn(async () => []),
  saveQuestion: vi.fn(async () => 'q1'),
  deleteQuestion: vi.fn(async () => true),
}))

const { AuthError } = await import('@/lib/auth/require-user')
const { GET, POST, DELETE } = await import('@/app/api/admin/questions/route')

function makeGetRequest(topicId: string) {
  return new NextRequest(`http://localhost/api/admin/questions?topicId=${topicId}`, {
    method: 'GET',
  })
}

function makeRequest(method: string, body: Record<string, unknown>) {
  return new NextRequest('http://localhost/api/admin/questions', {
    method,
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })
}

describe('/api/admin/questions', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('GET returns 401 when unauthenticated', async () => {
    requireAdminMock.mockRejectedValueOnce(
      new AuthError('Unauthorized', 401)
    )
    const res = await GET(makeGetRequest('t1'))
    expect(res.status).toBe(401)
  })

  it('GET returns 403 for a non-admin session', async () => {
    requireAdminMock.mockRejectedValueOnce(
      new AuthError('Forbidden', 403)
    )
    const res = await GET(makeGetRequest('t1'))
    expect(res.status).toBe(403)
  })

  it('POST returns 403 for a non-admin session', async () => {
    requireAdminMock.mockRejectedValueOnce(
      new AuthError('Forbidden', 403)
    )
    const res = await POST(
      makeRequest('POST', { topicId: 't1', questionText: 'q', marks: 2, difficulty: 1 })
    )
    expect(res.status).toBe(403)
  })

  it('POST succeeds for an admin session', async () => {
    requireAdminMock.mockResolvedValueOnce({ id: 'admin-1', email: 'a@b.com' })
    const res = await POST(
      makeRequest('POST', { topicId: 't1', questionText: 'q', marks: 2, difficulty: 1 })
    )
    expect(res.status).toBe(200)
  })

  it('DELETE returns 403 for a non-admin session', async () => {
    requireAdminMock.mockRejectedValueOnce(
      new AuthError('Forbidden', 403)
    )
    const res = await DELETE(makeRequest('DELETE', { questionId: 'q1' }))
    expect(res.status).toBe(403)
  })
})
