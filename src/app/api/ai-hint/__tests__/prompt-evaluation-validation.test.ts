import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { NextRequest } from 'next/server'

const requireUserMock = vi.fn()
const getApiSupabaseMock = vi.fn()

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

vi.mock('@/db/queries/users', () => ({
  checkPremiumStatus: vi.fn(async () => false),
}))

vi.mock('@/db', () => ({
  isDemoMode: false,
}))

const { POST } = await import('@/app/api/ai-hint/route')

function makeSupabaseMock() {
  const insertedRows: Record<string, unknown>[] = []
  const updateCalls: Record<string, unknown>[] = []

  const client = {
    from(table: string) {
      if (table === 'ai_hint_usage') {
        return {
          select: () => ({
            eq: () => ({
              eq: () => ({
                single: async () => ({ data: null, error: { code: 'PGRST116' } }),
              }),
            }),
          }),
          insert: async () => ({ error: null }),
        }
      }

      if (table === 'prompt_challenge_attempts') {
        return {
          insert: (row: Record<string, unknown>) => {
            insertedRows.push(row)
            return {
              select: () => ({
                single: async () => ({ data: { id: 'attempt-1' }, error: null }),
              }),
            }
          },
        }
      }

      if (table === 'users') {
        return {
          select: () => ({
            eq: () => ({
              single: async () => ({
                data: { badges: [], xp: 0, prompt_challenges_completed: 0 },
                error: null,
              }),
            }),
          }),
          update: (fields: Record<string, unknown>) => {
            updateCalls.push(fields)
            return { eq: async () => ({ error: null }) }
          },
        }
      }

      throw new Error(`Unexpected table in test mock: ${table}`)
    },
  }

  return { client, insertedRows, updateCalls }
}

function makeRequest(body: Record<string, unknown>) {
  return new NextRequest('http://localhost/api/ai-hint', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })
}

function mockAnthropicResponse(evaluation: unknown) {
  return {
    ok: true,
    text: async () => '',
    json: async () => ({
      content: [{ text: JSON.stringify(evaluation) }],
    }),
  } as Response
}

const ORIGINAL_FETCH = global.fetch

describe('POST /api/ai-hint prompt_evaluation validates the model JSON', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    process.env.ANTHROPIC_API_KEY = 'test-anthropic-key'
    requireUserMock.mockResolvedValue({ id: 'user-1', email: 'a@b.com' })
  })

  afterEach(() => {
    delete process.env.ANTHROPIC_API_KEY
    global.fetch = ORIGINAL_FETCH
  })

  it('rejects an out-of-range score (99): no insert, no XP, canned fallback with parseError', async () => {
    const { client, insertedRows, updateCalls } = makeSupabaseMock()
    getApiSupabaseMock.mockReturnValue(client)
    global.fetch = vi.fn().mockResolvedValue(
      mockAnthropicResponse({
        score: 99,
        what_worked: 'x',
        what_to_improve: 'y',
        improved_prompt: 'z',
        encouragement: 'w',
      })
    )

    const res = await POST(
      makeRequest({
        mode: 'prompt_evaluation',
        challengeId: 'scenario-1',
        scenarioContext: 'ctx',
        scenarioTask: 'task',
        studentPrompt: 'my prompt',
      })
    )

    expect(res.status).toBe(200)
    const body = await res.json()
    expect(body.parseError).toBe(true)
    expect(body.attempt).toBeUndefined()
    expect(insertedRows).toHaveLength(0)
    expect(updateCalls).toHaveLength(0)
  })

  it('rejects an oversized field from the model: no insert, canned fallback with parseError', async () => {
    const { client, insertedRows } = makeSupabaseMock()
    getApiSupabaseMock.mockReturnValue(client)
    global.fetch = vi.fn().mockResolvedValue(
      mockAnthropicResponse({
        score: 4,
        what_worked: 'x'.repeat(601),
        what_to_improve: 'y',
        improved_prompt: 'z',
        encouragement: 'w',
      })
    )

    const res = await POST(
      makeRequest({
        mode: 'prompt_evaluation',
        challengeId: 'scenario-1',
        scenarioContext: 'ctx',
        scenarioTask: 'task',
        studentPrompt: 'my prompt',
      })
    )

    const body = await res.json()
    expect(body.parseError).toBe(true)
    expect(insertedRows).toHaveLength(0)
  })

  it('accepts a valid in-range evaluation and persists it normally', async () => {
    const { client, insertedRows } = makeSupabaseMock()
    getApiSupabaseMock.mockReturnValue(client)
    global.fetch = vi.fn().mockResolvedValue(
      mockAnthropicResponse({
        score: 4,
        what_worked: 'Clear context',
        what_to_improve: 'Add a format constraint',
        improved_prompt: 'Improved version',
        encouragement: 'Nice work',
      })
    )

    const res = await POST(
      makeRequest({
        mode: 'prompt_evaluation',
        challengeId: 'scenario-1',
        scenarioContext: 'ctx',
        scenarioTask: 'task',
        studentPrompt: 'my prompt',
      })
    )

    const body = await res.json()
    expect(body.parseError).toBeUndefined()
    expect(body.attempt).toBeTruthy()
    expect(insertedRows).toHaveLength(1)
    expect(insertedRows[0]).toMatchObject({ ai_score: 4 })
  })
})
