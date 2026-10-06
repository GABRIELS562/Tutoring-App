import { describe, it, expect, vi, beforeEach } from 'vitest'

// Same minimal chainable/thenable drizzle mock as exam.test.ts, plus
// returning() for the insert.
type Chain = {
  from: ReturnType<typeof vi.fn>
  where: ReturnType<typeof vi.fn>
  limit: ReturnType<typeof vi.fn>
  set: ReturnType<typeof vi.fn>
  values: ReturnType<typeof vi.fn>
  for: ReturnType<typeof vi.fn>
  returning: ReturnType<typeof vi.fn>
  then: (resolve: (value: unknown) => void) => void
}

function makeChain(result: unknown): Chain {
  const chain = {} as Chain
  for (const key of ['from', 'where', 'limit', 'set', 'values', 'for', 'returning'] as const) {
    chain[key] = vi.fn(() => chain)
  }
  chain.then = (resolve: (value: unknown) => void) => resolve(result)
  return chain
}

const txMock = { select: vi.fn(), update: vi.fn(), insert: vi.fn() }
const dbMock = {
  transaction: vi.fn(async (cb: (tx: typeof txMock) => unknown) => cb(txMock)),
}

vi.mock('@/db', () => ({ db: dbMock }))

const { recordPromptChallengeAttempt } = await import('../ai-skills')

const INPUT = {
  userId: 'user-1',
  challengeId: 'study-plan',
  studentPrompt: 'Help me plan revision',
  score: 3,
  feedback: 'Good context. Add a target.',
  improvedPrompt: 'A better prompt',
  xpPerStar: 10,
  masterBadgeId: 'prompt-master',
  masterBadgeXp: 50,
}

/**
 * Arranges the locked user row and whether an attempt already exists.
 * Order matters: the function locks the user first, then looks for the
 * attempt.
 */
function arrange({
  xp = 0,
  badges = [] as string[],
  completed = 0,
  existing = null as { id: string; score: number | null } | null,
}) {
  txMock.select
    .mockReturnValueOnce(makeChain([{ xp, badges, completed }]))
    .mockReturnValueOnce(makeChain(existing ? [existing] : []))
  txMock.insert.mockReturnValue(makeChain([{ id: 'attempt-1' }]))
  txMock.update.mockReturnValue(makeChain(undefined))
}

/** The object passed to the users .set() call, if there was one. */
function userUpdatePayload(): Record<string, unknown> | undefined {
  const chain = txMock.update.mock.results[0]?.value as Chain | undefined
  return chain?.set.mock.calls[0]?.[0] as Record<string, unknown> | undefined
}

describe('recordPromptChallengeAttempt', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('awards score x xpPerStar on a first completion', async () => {
    arrange({ completed: 2 })

    const result = await recordPromptChallengeAttempt(INPUT)

    expect(result).toEqual({
      attemptId: 'attempt-1',
      xpEarned: 30,
      newBadges: [],
      totalChallengesCompleted: 3,
    })
  })

  it('adds the prompt-master badge and its XP on a perfect score', async () => {
    arrange({})

    const result = await recordPromptChallengeAttempt({ ...INPUT, score: 5 })

    expect(result?.newBadges).toEqual(['prompt-master'])
    expect(result?.xpEarned).toBe(5 * 10 + 50)
  })

  it('does not award the badge twice to a student who already holds it', async () => {
    arrange({ badges: ['prompt-master'] })

    const result = await recordPromptChallengeAttempt({ ...INPUT, score: 5 })

    expect(result?.newBadges).toEqual([])
    expect(result?.xpEarned).toBe(50) // stars only, no badge bonus
    expect(userUpdatePayload()?.badges).toEqual(['prompt-master'])
  })

  /**
   * XP must be applied as `xp + n`, not a number computed from the value
   * that was read. Two attempts finishing together both read the same
   * starting xp, and a literal would make the second overwrite the first.
   */
  it('increments XP with a SQL expression rather than a stale computed value', async () => {
    arrange({ xp: 500 })

    await recordPromptChallengeAttempt(INPUT)

    const xp = userUpdatePayload()?.xp
    expect(typeof xp).not.toBe('number')
    expect(xp).toBeDefined()
  })

  it('locks the user row before reading it', async () => {
    arrange({})

    await recordPromptChallengeAttempt(INPUT)

    const lockedChain = txMock.select.mock.results[0].value as Chain
    expect(lockedChain.for).toHaveBeenCalledWith('update')
  })

  describe('a repeat attempt', () => {
    it('earns no further XP and leaves the user row alone', async () => {
      arrange({ completed: 4, existing: { id: 'attempt-old', score: 2 } })

      const result = await recordPromptChallengeAttempt(INPUT)

      expect(result).toEqual({
        attemptId: 'attempt-old',
        xpEarned: 0,
        newBadges: [],
        totalChallengesCompleted: 4,
      })
      // One update - the attempt row - and nothing touching users.
      expect(txMock.insert).not.toHaveBeenCalled()
      expect(userUpdatePayload()?.xp).toBeUndefined()
    })

    it('updates the stored prompt when the student improves on their best', async () => {
      arrange({ existing: { id: 'attempt-old', score: 2 } })

      await recordPromptChallengeAttempt({ ...INPUT, score: 4 })

      expect(userUpdatePayload()?.aiScore).toBe(4)
    })

    it('does not overwrite a better previous attempt with a worse one', async () => {
      arrange({ existing: { id: 'attempt-old', score: 5 } })

      await recordPromptChallengeAttempt({ ...INPUT, score: 1 })

      expect(txMock.update).not.toHaveBeenCalled()
    })
  })

  /**
   * The point of returning null. The route reports `persisted: false` on
   * null, so the client does not show badge confetti for XP that was
   * never applied - which is exactly what the old three-call version did
   * when its user UPDATE failed.
   */
  describe('failure is reported, not swallowed', () => {
    it('returns null when the user row is missing', async () => {
      txMock.select.mockReturnValueOnce(makeChain([]))

      expect(await recordPromptChallengeAttempt(INPUT)).toBeNull()
    })

    it('returns null when the transaction throws', async () => {
      dbMock.transaction.mockRejectedValueOnce(new Error('connection lost'))
      vi.spyOn(console, 'error').mockImplementation(() => {})

      expect(await recordPromptChallengeAttempt(INPUT)).toBeNull()
    })

    it('returns null when the insert comes back empty', async () => {
      arrange({})
      txMock.insert.mockReturnValue(makeChain([]))

      expect(await recordPromptChallengeAttempt(INPUT)).toBeNull()
    })
  })
})
