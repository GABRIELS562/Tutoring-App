import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { NextRequest } from 'next/server'

const requireUserMock = vi.fn()
const getApiSupabaseMock = vi.fn()
const createTutorMessageMock = vi.fn()
const { recordMock } = vi.hoisted(() => ({ recordMock: vi.fn() }))

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

vi.mock('@/db/queries/ai-skills', () => ({
  recordPromptChallengeAttempt: recordMock,
}))

vi.mock('@/db', () => ({
  isDemoMode: false,
}))

// The route now calls the shared src/lib/claude.ts helper (SDK-backed)
// instead of raw fetch(ANTHROPIC_API_URL, ...) - mock it at that
// boundary instead of global.fetch. getClaudeClient() just needs to be
// truthy so the route takes the "real" branch instead of its demo-mode
// fallback; ClaudeError is re-exported from the real module so
// `error instanceof ClaudeError` checks in the route still work.
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

function makeRequest(body: Record<string, unknown>) {
  return new NextRequest('http://localhost/api/ai-hint', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })
}

function mockTutorMessage(score: number) {
  return {
    text: JSON.stringify({
      score,
      what_worked: 'worked',
      what_to_improve: 'improve',
      improved_prompt: 'improved',
      encouragement: 'encouragement',
    }),
    usage: { input_tokens: 10, output_tokens: 10 },
  }
}

describe('POST /api/ai-hint prompt_evaluation is idempotent per (user, challenge)', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    process.env.ANTHROPIC_API_KEY = 'test-anthropic-key'
    requireUserMock.mockResolvedValue({ id: 'user-1', email: 'a@b.com' })
  })

  afterEach(() => {
    delete process.env.ANTHROPIC_API_KEY
  })

  it('awards XP once; a repeat attempt with a higher score updates the row but earns no extra XP', async () => {
    const { recordPromptChallengeAttempt, attempts, userRow } = makePromptChallengeStore()
    recordMock.mockImplementation(recordPromptChallengeAttempt)
    createTutorMessageMock
      .mockResolvedValueOnce(mockTutorMessage(3))
      .mockResolvedValueOnce(mockTutorMessage(5))

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
    expect(attempts[0].score).toBe(3)
    expect(first.attempt.xpEarned).toBe(15) // 3 * PROMPT_CHALLENGE_XP_PER_STAR(5)
    expect(userRow.xp).toBe(15)
    expect(userRow.completed).toBe(1)

    const second = await (await POST(req())).json()

    // Still exactly one row - updated in place, not a second insert.
    expect(attempts).toHaveLength(1)
    expect(attempts[0].score).toBe(5)

    // No additional XP/completion count for the repeat.
    expect(second.attempt.xpEarned).toBe(0)
    expect(userRow.xp).toBe(15)
    expect(userRow.completed).toBe(1)
  })

  it('does not lower the stored score when a repeat attempt scores worse', async () => {
    const { recordPromptChallengeAttempt, attempts } = makePromptChallengeStore()
    recordMock.mockImplementation(recordPromptChallengeAttempt)
    createTutorMessageMock
      .mockResolvedValueOnce(mockTutorMessage(4))
      .mockResolvedValueOnce(mockTutorMessage(2))

    const req = () =>
      makeRequest({
        mode: 'prompt_evaluation',
        challengeId: 'scenario-1',
        scenarioContext: 'ctx',
        scenarioTask: 'task',
        studentPrompt: 'my prompt',
      })

    await POST(req())
    expect(attempts[0].score).toBe(4)

    await POST(req())
    expect(attempts).toHaveLength(1)
    expect(attempts[0].score).toBe(4) // unchanged - 2 is not an improvement
  })
})
