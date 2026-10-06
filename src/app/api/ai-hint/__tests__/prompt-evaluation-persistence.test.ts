import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { NextRequest } from 'next/server'

const requireUserMock = vi.fn()
const createTutorMessageMock = vi.fn()
const { recordMock, isDemoModeRef } = vi.hoisted(() => ({
  recordMock: vi.fn(),
  isDemoModeRef: { value: false },
}))

vi.mock('@/lib/auth/require-user', async () => {
  const actual = await vi.importActual<typeof import('@/lib/auth/require-user')>(
    '@/lib/auth/require-user'
  )
  return { ...actual, requireUser: requireUserMock }
})

// null = Supabase not configured, so the daily-quota path is skipped.
// Persistence no longer depends on this - it goes through Drizzle and is
// gated on isDemoMode instead.
vi.mock('@/lib/supabase/api', () => ({ getApiSupabase: vi.fn(() => null) }))
vi.mock('@/db/queries/users', () => ({ checkPremiumStatus: vi.fn(async () => false) }))
vi.mock('@/db/queries/ai-skills', () => ({ recordPromptChallengeAttempt: recordMock }))

vi.mock('@/db', () => ({
  get isDemoMode() {
    return isDemoModeRef.value
  },
}))

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

function evaluationScoring(score: number) {
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

const REQUEST = {
  mode: 'prompt_evaluation',
  challengeId: 'scenario-1',
  scenarioContext: 'ctx',
  scenarioTask: 'task',
  studentPrompt: 'my prompt',
}

describe('POST /api/ai-hint (prompt_evaluation persistence)', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    isDemoModeRef.value = false
    process.env.ANTHROPIC_API_KEY = 'test-anthropic-key'
    requireUserMock.mockResolvedValue({ id: 'session-user-1', email: 'a@b.com' })
  })

  afterEach(() => {
    delete process.env.ANTHROPIC_API_KEY
  })

  it('persists the attempt using the server-computed score, never a client-supplied one', async () => {
    const { recordPromptChallengeAttempt, attempts } = makePromptChallengeStore()
    recordMock.mockImplementation(recordPromptChallengeAttempt)
    createTutorMessageMock.mockResolvedValue(evaluationScoring(3))

    const res = await POST(makeRequest({ ...REQUEST, aiScore: 5 }))

    expect(res.status).toBe(200)
    const body = await res.json()

    expect(attempts).toHaveLength(1)
    expect(attempts[0]).toMatchObject({ challengeId: 'scenario-1', prompt: 'my prompt' })
    // The persisted score is the one Angelo just computed, not the 5 the
    // caller tried to smuggle in.
    expect(attempts[0].score).toBe(body.evaluation.score)
    expect(attempts[0].score).not.toBe(5)
    // Identity comes from the session, never the body.
    expect(recordMock.mock.calls[0][0]).toMatchObject({ userId: 'session-user-1' })
  })

  it('does not persist in demo mode, and says so rather than implying a save', async () => {
    isDemoModeRef.value = true

    const res = await POST(makeRequest(REQUEST))

    expect(res.status).toBe(200)
    const body = await res.json()
    expect(body.evaluation).toBeTruthy()
    expect(body.attempt).toBeUndefined()
    expect(recordMock).not.toHaveBeenCalled()
  })

  it('does not attempt to persist when no challengeId is supplied', async () => {
    createTutorMessageMock.mockResolvedValue(evaluationScoring(3))

    const res = await POST(
      makeRequest({ mode: 'prompt_evaluation', scenarioContext: 'ctx', scenarioTask: 'task', studentPrompt: 'p' })
    )

    expect(res.status).toBe(200)
    expect(recordMock).not.toHaveBeenCalled()
  })

  it('awards the prompt-master badge on a perfect score and includes it in the response', async () => {
    const { recordPromptChallengeAttempt, userRow } = makePromptChallengeStore()
    recordMock.mockImplementation(recordPromptChallengeAttempt)
    createTutorMessageMock.mockResolvedValue(evaluationScoring(5))

    const res = await POST(makeRequest(REQUEST))
    const body = await res.json()

    expect(body.evaluation.score).toBe(5)
    expect(body.attempt.newBadges).toContain('prompt-master')
    expect(userRow.badges).toContain('prompt-master')
  })

  it('does not award the badge for a less-than-perfect score', async () => {
    const { recordPromptChallengeAttempt, userRow } = makePromptChallengeStore()
    recordMock.mockImplementation(recordPromptChallengeAttempt)
    createTutorMessageMock.mockResolvedValue(evaluationScoring(4))

    const body = await (await POST(makeRequest(REQUEST))).json()

    expect(body.attempt.newBadges).toEqual([])
    expect(userRow.badges).not.toContain('prompt-master')
  })

  /**
   * The reason the persistence path was rewritten. It used to insert the
   * attempt, then read the user, then write XP back - swallowing every
   * failure after the first. A failed write still replied as though the
   * XP had landed, so the client showed badge confetti for nothing.
   */
  it('reports persisted:false when the write fails, instead of celebrating', async () => {
    recordMock.mockResolvedValue(null)
    createTutorMessageMock.mockResolvedValue(evaluationScoring(4))

    const body = await (await POST(makeRequest(REQUEST))).json()

    expect(body.evaluation).toBeTruthy()
    expect(body.persisted).toBe(false)
    expect(body.attempt).toBeUndefined()
  })
})
