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

interface AttemptRow {
  id: string
  user_id: string
  challenge_id: string
  ai_score: number
  xp_earned: number
}

function makeStatefulSupabaseMock() {
  const attempts: AttemptRow[] = []
  const userRow = { badges: [] as string[], xp: 0, prompt_challenges_completed: 0 }
  const usersUpdateCalls: Record<string, unknown>[] = []
  let nextId = 1

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
          select: () => ({
            eq: (_col1: string, userId: string) => ({
              eq: (_col2: string, challengeId: string) => ({
                maybeSingle: async () => {
                  const found = attempts.find(
                    (a) => a.user_id === userId && a.challenge_id === challengeId
                  )
                  return { data: found ?? null, error: null }
                },
              }),
            }),
          }),
          insert: (row: Omit<AttemptRow, 'id'>) => {
            const newRow: AttemptRow = { id: `attempt-${nextId++}`, ...row }
            attempts.push(newRow)
            return {
              select: () => ({
                single: async () => ({ data: { id: newRow.id }, error: null }),
              }),
            }
          },
          update: (fields: Partial<AttemptRow>) => ({
            eq: async (_col: string, id: string) => {
              const idx = attempts.findIndex((a) => a.id === id)
              if (idx >= 0) {
                attempts[idx] = { ...attempts[idx], ...fields }
              }
              return { error: null }
            },
          }),
        }
      }

      if (table === 'users') {
        return {
          select: () => ({
            eq: () => ({
              single: async () => ({ data: { ...userRow }, error: null }),
            }),
          }),
          update: (fields: Record<string, unknown>) => {
            usersUpdateCalls.push(fields)
            Object.assign(userRow, fields)
            return { eq: async () => ({ error: null }) }
          },
        }
      }

      throw new Error(`Unexpected table in test mock: ${table}`)
    },
  }

  return { client, attempts, userRow, usersUpdateCalls }
}

function makeRequest(body: Record<string, unknown>) {
  return new NextRequest('http://localhost/api/ai-hint', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })
}

function mockAnthropicResponse(score: number) {
  return {
    ok: true,
    text: async () => '',
    json: async () => ({
      content: [
        {
          text: JSON.stringify({
            score,
            what_worked: 'worked',
            what_to_improve: 'improve',
            improved_prompt: 'improved',
            encouragement: 'encouragement',
          }),
        },
      ],
    }),
  } as Response
}

const ORIGINAL_FETCH = global.fetch

describe('POST /api/ai-hint prompt_evaluation is idempotent per (user, challenge)', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    process.env.ANTHROPIC_API_KEY = 'test-anthropic-key'
    requireUserMock.mockResolvedValue({ id: 'user-1', email: 'a@b.com' })
  })

  afterEach(() => {
    delete process.env.ANTHROPIC_API_KEY
    global.fetch = ORIGINAL_FETCH
  })

  it('awards XP once; a repeat attempt with a higher score updates the row but earns no extra XP', async () => {
    const { client, attempts, userRow } = makeStatefulSupabaseMock()
    getApiSupabaseMock.mockReturnValue(client)
    global.fetch = vi
      .fn()
      .mockResolvedValueOnce(mockAnthropicResponse(3))
      .mockResolvedValueOnce(mockAnthropicResponse(5))

    const req = () =>
      makeRequest({
        mode: 'prompt_evaluation',
        challengeId: 'scenario-1',
        scenarioContext: 'ctx',
        scenarioTask: 'task',
        studentPrompt: 'my prompt',
      })

    const first = await (await POST(req())).json()
    expect(attempts).toHaveLength(1)
    expect(attempts[0].ai_score).toBe(3)
    expect(first.attempt.xpEarned).toBe(15) // 3 * PROMPT_CHALLENGE_XP_PER_STAR(5)
    expect(userRow.xp).toBe(15)
    expect(userRow.prompt_challenges_completed).toBe(1)

    const second = await (await POST(req())).json()

    // Still exactly one row - updated in place, not a second insert.
    expect(attempts).toHaveLength(1)
    expect(attempts[0].ai_score).toBe(5)

    // No additional XP/completion count for the repeat.
    expect(second.attempt.xpEarned).toBe(0)
    expect(userRow.xp).toBe(15)
    expect(userRow.prompt_challenges_completed).toBe(1)
  })

  it('does not lower the stored score when a repeat attempt scores worse', async () => {
    const { client, attempts } = makeStatefulSupabaseMock()
    getApiSupabaseMock.mockReturnValue(client)
    global.fetch = vi
      .fn()
      .mockResolvedValueOnce(mockAnthropicResponse(4))
      .mockResolvedValueOnce(mockAnthropicResponse(2))

    const req = () =>
      makeRequest({
        mode: 'prompt_evaluation',
        challengeId: 'scenario-1',
        scenarioContext: 'ctx',
        scenarioTask: 'task',
        studentPrompt: 'my prompt',
      })

    await POST(req())
    expect(attempts[0].ai_score).toBe(4)

    await POST(req())
    expect(attempts).toHaveLength(1)
    expect(attempts[0].ai_score).toBe(4) // unchanged - 2 is not an improvement
  })
})
