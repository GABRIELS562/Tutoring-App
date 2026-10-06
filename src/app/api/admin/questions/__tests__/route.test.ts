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
      makeRequest('POST', {
        topicId: '11111111-1111-4111-8111-111111111111',
        questionText: 'What is 2 plus 2?',
        marks: 2,
        difficulty: 1,
        options: [
          { optionLetter: 'A', optionText: 'Four', isCorrect: true },
          { optionLetter: 'B', optionText: 'Five', isCorrect: false },
        ],
      })
    )
    expect(res.status).toBe(403)
  })

  it('POST succeeds for an admin session', async () => {
    requireAdminMock.mockResolvedValueOnce({ id: 'admin-1', email: 'a@b.com' })
    const res = await POST(
      makeRequest('POST', {
        topicId: '11111111-1111-4111-8111-111111111111',
        questionText: 'What is 2 plus 2?',
        marks: 2,
        difficulty: 1,
        options: [
          { optionLetter: 'A', optionText: 'Four', isCorrect: true },
          { optionLetter: 'B', optionText: 'Five', isCorrect: false },
        ],
      })
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

/**
 * This route used to destructure an untyped body, truthy-check four
 * fields and hand the rest to a Drizzle insert inside a transaction with
 * its options and steps. TypeScript could not help - the values are
 * `any`, so the assignment to SaveQuestionInput type-checked while
 * nothing was verified at runtime. A wrong type reached Postgres as a
 * generic 500; a malformed option landed as NULLs, producing a question
 * that renders with a blank answer rather than failing loudly.
 */
describe('/api/admin/questions validates the body', () => {
  const VALID = {
    topicId: '11111111-1111-4111-8111-111111111111',
    questionText: 'What is 2 plus 2?',
    marks: 2,
    difficulty: 1,
    options: [
      { optionLetter: 'A', optionText: 'Four', isCorrect: true },
      { optionLetter: 'B', optionText: 'Five', isCorrect: false },
    ],
  }

  beforeEach(() => {
    requireAdminMock.mockResolvedValue({ id: 'admin-1', email: 'a@b.com' })
  })

  async function post(body: Record<string, unknown>) {
    const res = await POST(makeRequest('POST', body))
    return { status: res.status, body: await res.json() }
  }

  it('names the offending field instead of a blanket "missing required fields"', async () => {
    const { status, body } = await post({ ...VALID, difficulty: 9 })

    expect(status).toBe(400)
    expect(body.issues.map((i: { field: string }) => i.field)).toContain('difficulty')
  })

  it('rejects a marks value sent as a string', async () => {
    const { status } = await post({ ...VALID, marks: '2' })

    expect(status).toBe(400)
  })

  it('rejects an option letter outside A-D', async () => {
    const { status, body } = await post({
      ...VALID,
      options: [{ optionLetter: 'Z', optionText: 'Nope', isCorrect: true }],
    })

    expect(status).toBe(400)
    expect(JSON.stringify(body.issues)).toMatch(/optionLetter/)
  })

  /**
   * The failure that would reach students: a multiple-choice question
   * with nothing marked correct is unanswerable, and every answer scores
   * as wrong. The editor already blocks it client-side; the server should
   * not depend on that.
   */
  it('refuses a multiple-choice question with no correct option', async () => {
    const { status, body } = await post({
      ...VALID,
      options: [
        { optionLetter: 'A', optionText: 'Four', isCorrect: false },
        { optionLetter: 'B', optionText: 'Five', isCorrect: false },
      ],
    })

    expect(status).toBe(400)
    expect(JSON.stringify(body.issues)).toMatch(/correct option/)
  })

  it('refuses two correct options', async () => {
    const { status } = await post({
      ...VALID,
      options: [
        { optionLetter: 'A', optionText: 'Four', isCorrect: true },
        { optionLetter: 'B', optionText: 'Five', isCorrect: true },
      ],
    })

    expect(status).toBe(400)
  })

  it('allows a non-multiple-choice question to have no options', async () => {
    const { status } = await post({
      topicId: VALID.topicId,
      questionText: 'Prove the identity.',
      marks: 4,
      difficulty: 2,
      isMultipleChoice: false,
    })

    expect(status).toBe(200)
  })

  /**
   * QuestionEditor's questionId prop is `string | null`, so creating a
   * new question posts `id: null`. An `.optional()` id would have
   * rejected that and broken every create.
   */
  it('accepts id: null, which is what creating a new question sends', async () => {
    const { status } = await post({ ...VALID, id: null })

    expect(status).toBe(200)
  })

  it('still rejects an id that is not a uuid', async () => {
    const { status } = await post({ ...VALID, id: 'not-a-uuid' })

    expect(status).toBe(400)
  })

  it('rejects a step missing its answer', async () => {
    const { status } = await post({
      ...VALID,
      steps: [{ stepNumber: 1, instruction: 'Do the thing' }],
    })

    expect(status).toBe(400)
  })
})
