import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { NextRequest } from 'next/server'

const requireUserMock = vi.fn()
const getApiSupabaseMock = vi.fn()
const { recordMock } = vi.hoisted(() => ({ recordMock: vi.fn() }))
const createTutorMessageMock = vi.fn()

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

// Persistence moved to a Drizzle transaction (src/db/queries/ai-skills.ts),
// which has its own tests; this file is about what the ROUTE does with a
// model response it cannot trust.
vi.mock('@/db/queries/ai-skills', () => ({
  recordPromptChallengeAttempt: recordMock,
}))

vi.mock('@/db/queries/users', () => ({
  checkPremiumStatus: vi.fn(async () => false),
}))

vi.mock('@/db', () => ({
  isDemoMode: false,
}))

// The route calls the shared src/lib/claude.ts helper (SDK-backed) rather
// than raw fetch(ANTHROPIC_API_URL, ...) - mock at that boundary. See the
// identical comment in prompt-evaluation-idempotency.test.ts.
vi.mock('@/lib/claude', async () => {
  const actual = await vi.importActual<typeof import('@/lib/claude')>('@/lib/claude')
  return {
    ...actual,
    getClaudeClient: vi.fn(() => ({})),
    createTutorMessage: createTutorMessageMock,
  }
})

const { makePromptChallengeStore } = await import('./helpers/promptChallengeStore')
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
          // No existing attempt for this (user, challenge) pair in any of
          // these tests - every call is a first completion.
          select: () => ({
            eq: () => ({
              eq: () => ({
                maybeSingle: async () => ({ data: null, error: null }),
              }),
            }),
          }),
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
    // Stands in for the increment_hint_usage() RPC the route calls via
    // supabase.rpc() to atomically bump usage - these tests are about
    // model-output validation, not usage-count correctness, so a fixed
    // non-error response is enough to let the route proceed.
    rpc: async () => ({ data: { id: 'usage-1', hint_count: 1, camera_count: 0 }, error: null }),
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

function mockTutorMessage(evaluation: unknown) {
  return {
    text: JSON.stringify(evaluation),
    usage: { input_tokens: 10, output_tokens: 10 },
  }
}

describe('POST /api/ai-hint prompt_evaluation validates the model JSON', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    process.env.ANTHROPIC_API_KEY = 'test-anthropic-key'
    requireUserMock.mockResolvedValue({ id: 'user-1', email: 'a@b.com' })
  })

  afterEach(() => {
    delete process.env.ANTHROPIC_API_KEY
  })

  it('rejects an out-of-range score (99): no insert, no XP, canned fallback with parseError', async () => {
    const { client, insertedRows, updateCalls } = makeSupabaseMock()
    getApiSupabaseMock.mockReturnValue(client)
    createTutorMessageMock.mockResolvedValue(
      mockTutorMessage({
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
    const { client } = makeSupabaseMock()
    getApiSupabaseMock.mockReturnValue(client)
    createTutorMessageMock.mockResolvedValue(
      mockTutorMessage({
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
    // A model response that fails validation must not be written at all.
    expect(recordMock).not.toHaveBeenCalled()
  })

  it('accepts a valid in-range evaluation and persists it normally', async () => {
    const { client } = makeSupabaseMock()
    getApiSupabaseMock.mockReturnValue(client)
    const { recordPromptChallengeAttempt, attempts } = makePromptChallengeStore()
    recordMock.mockImplementation(recordPromptChallengeAttempt)
    createTutorMessageMock.mockResolvedValue(
      mockTutorMessage({
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
    expect(attempts).toHaveLength(1)
    expect(attempts[0].score).toBe(4)
  })
})
