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
  createTopic: vi.fn(async () => 'topic-1'),
  deleteTopic: vi.fn(async () => true),
}))

const { AuthError } = await import('@/lib/auth/require-user')
const { POST, DELETE } = await import('@/app/api/admin/topics/route')

function makeRequest(method: string, body: Record<string, unknown>) {
  return new NextRequest('http://localhost/api/admin/topics', {
    method,
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })
}

describe('/api/admin/topics', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('POST returns 401 when unauthenticated', async () => {
    requireAdminMock.mockRejectedValueOnce(
      new AuthError('Unauthorized', 401)
    )
    const res = await POST(
      makeRequest('POST', { name: 'x', subject: 'maths', grade: 11, slug: 'x' })
    )
    expect(res.status).toBe(401)
  })

  it('POST returns 403 for a non-admin session', async () => {
    requireAdminMock.mockRejectedValueOnce(
      new AuthError('Forbidden', 403)
    )
    const res = await POST(
      makeRequest('POST', { name: 'x', subject: 'maths', grade: 11, slug: 'x' })
    )
    expect(res.status).toBe(403)
  })

  it('POST succeeds for an admin session', async () => {
    requireAdminMock.mockResolvedValueOnce({ id: 'admin-1', email: 'a@b.com' })
    const res = await POST(
      makeRequest('POST', { name: 'x', subject: 'maths', grade: 11, slug: 'x' })
    )
    expect(res.status).toBe(200)
  })

  it('DELETE returns 403 for a non-admin session', async () => {
    requireAdminMock.mockRejectedValueOnce(
      new AuthError('Forbidden', 403)
    )
    const res = await DELETE(makeRequest('DELETE', { topicId: 't1' }))
    expect(res.status).toBe(403)
  })
})
