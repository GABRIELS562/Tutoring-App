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

/**
 * Same gap as the questions route: an untyped body, truthy-checked on
 * four fields, passed straight into a Drizzle insert. The old 400 said
 * "Missing required fields: name, subject, grade, slug" whatever was
 * actually wrong, so a bad grade read as a missing name.
 */
describe('/api/admin/topics validates the body', () => {
  const VALID = {
    name: 'Trigonometry',
    subject: 'maths',
    grade: 11,
    slug: 'trigonometry-gr11',
  }

  beforeEach(() => {
    requireAdminMock.mockResolvedValue({ id: 'admin-1', email: 'a@b.com' })
  })

  async function post(body: Record<string, unknown>) {
    const res = await POST(makeRequest('POST', body))
    return { status: res.status, body: await res.json() }
  }

  it('accepts a well-formed topic', async () => {
    const { status } = await post(VALID)

    expect(status).toBe(200)
  })

  it('accepts the nulls AddTopicModal sends for its optional number fields', async () => {
    const { status } = await post({
      ...VALID,
      paper: null,
      term: null,
      capsWeightPercent: null,
      sortOrder: null,
    })

    expect(status).toBe(200)
  })

  it('names the offending field rather than listing all the required ones', async () => {
    const { status, body } = await post({ ...VALID, grade: 99 })

    expect(status).toBe(400)
    expect(body.issues.map((i: { field: string }) => i.field)).toContain('grade')
  })

  it('rejects a subject that is not one of the two real ones', async () => {
    const { status } = await post({ ...VALID, subject: 'history' })

    expect(status).toBe(400)
  })

  /**
   * The slug is in every URL and is the key the content registry is
   * looked up by, so a slug with spaces or capitals produces a topic that
   * cannot be reached.
   */
  it('rejects a slug that is not url-shaped', async () => {
    const { status, body } = await post({ ...VALID, slug: 'Trig Grade 11' })

    expect(status).toBe(400)
    expect(JSON.stringify(body.issues)).toMatch(/slug/)
  })

  it('rejects a grade sent as a string', async () => {
    const { status } = await post({ ...VALID, grade: '11' })

    expect(status).toBe(400)
  })
})
