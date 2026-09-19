import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { todaySast, yesterdaySast } from '@/lib/dates'
import { XP_PER_CORRECT_ANSWER, MAX_HEARTS } from '@/lib/game-rules'

// A minimal chainable, thenable mock of the drizzle query builder: every
// chain method returns the same object, and awaiting it (or calling
// .then) resolves to whatever `result` was configured for that call.
type Chain = {
  from: ReturnType<typeof vi.fn>
  where: ReturnType<typeof vi.fn>
  limit: ReturnType<typeof vi.fn>
  orderBy: ReturnType<typeof vi.fn>
  set: ReturnType<typeof vi.fn>
  values: ReturnType<typeof vi.fn>
  returning: ReturnType<typeof vi.fn>
  for: ReturnType<typeof vi.fn>
  onConflictDoNothing: ReturnType<typeof vi.fn>
  then: (resolve: (value: unknown) => void) => void
}

function makeChain(result: unknown): Chain {
  const chain = {} as Chain
  chain.from = vi.fn(() => chain)
  chain.where = vi.fn(() => chain)
  chain.limit = vi.fn(() => chain)
  chain.orderBy = vi.fn(() => chain)
  chain.set = vi.fn(() => chain)
  chain.values = vi.fn(() => chain)
  chain.returning = vi.fn(() => chain)
  chain.for = vi.fn(() => chain)
  chain.onConflictDoNothing = vi.fn(() => chain)
  chain.then = (resolve: (value: unknown) => void) => resolve(result)
  return chain
}

// Everything saveProgress() does happens on a `tx` handed to
// db.transaction()'s callback - a second select/update/insert mock set,
// separate from the top-level dbMock, since drizzle's tx object is a
// distinct handle in real usage too.
const txMock = {
  select: vi.fn(),
  update: vi.fn(),
  insert: vi.fn(),
}

const dbMock = {
  select: vi.fn(),
  update: vi.fn(),
  insert: vi.fn(),
  transaction: vi.fn(async (cb: (tx: typeof txMock) => unknown) => cb(txMock)),
}

vi.mock('@/db', () => ({ db: dbMock }))

const {
  decrementHeartsIfAllowed,
  applyDayRollover,
  saveProgress,
} = await import('../questions')

describe('decrementHeartsIfAllowed', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('performs a single atomic UPDATE ... RETURNING (no read-then-write)', async () => {
    const updateChain = makeChain([{ hearts: 2 }])
    dbMock.update.mockReturnValueOnce(updateChain)

    const result = await decrementHeartsIfAllowed('user-1')

    expect(result).toEqual({ ok: true, hearts: 2 })
    expect(dbMock.select).not.toHaveBeenCalled()
    expect(dbMock.update).toHaveBeenCalledTimes(1)
  })

  it('floors at 0 in SQL via GREATEST(hearts - 1, 0)', async () => {
    const updateChain = makeChain([{ hearts: 0 }])
    dbMock.update.mockReturnValueOnce(updateChain)

    const result = await decrementHeartsIfAllowed('user-1')

    expect(result).toEqual({ ok: true, hearts: 0 })

    const setArg = updateChain.set.mock.calls[0][0]
    expect(setArg).toHaveProperty('hearts')
    // Not a plain number - a SQL fragment computed in the database.
    expect(typeof setArg.hearts).not.toBe('number')
    const rendered = setArg.hearts.queryChunks
      .map((chunk: unknown) => {
        if (chunk && typeof chunk === 'object' && 'value' in chunk) {
          return (chunk as { value: string[] }).value.join('')
        }
        return ''
      })
      .join('<param>')
    expect(rendered).toContain('GREATEST(')
    expect(rendered).toContain('- 1, 0)')
  })

  it('is blocked (zero rows updated) for a non-premium user with 0 hearts, without decrementing', async () => {
    dbMock.update.mockReturnValueOnce(makeChain([]))

    const result = await decrementHeartsIfAllowed('user-1')

    expect(result).toEqual({ ok: false, reason: 'blocked' })
  })

  it('reports an error (not "blocked") when hearts comes back null', async () => {
    dbMock.update.mockReturnValueOnce(makeChain([{ hearts: null }]))

    const result = await decrementHeartsIfAllowed('user-1')

    expect(result).toEqual({ ok: false, reason: 'error' })
  })

  it('reports an error and does not throw on a DB error', async () => {
    dbMock.update.mockReturnValueOnce({
      set: () => { throw new Error('db down') },
    })

    const result = await decrementHeartsIfAllowed('user-1')

    expect(result).toEqual({ ok: false, reason: 'error' })
  })
})

describe('applyDayRollover', () => {
  // Pinned well clear of the SAST/UTC boundary so the fixture dates
  // below (built from the same todaySast/yesterdaySast helper the
  // function under test uses) are unambiguous.
  const NOW = new Date('2026-09-19T10:00:00.000Z')

  beforeEach(() => {
    vi.clearAllMocks()
    vi.useFakeTimers()
    vi.setSystemTime(NOW)
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('starts the streak at 1 and refills hearts on first-ever activity (no lastActiveDate)', async () => {
    dbMock.select.mockReturnValueOnce(
      makeChain([{ id: 'u1', xp: 0, streakCount: 0, hearts: 0, lastActiveDate: null }])
    )
    const updateChain = makeChain(undefined)
    dbMock.update.mockReturnValueOnce(updateChain)

    const result = await applyDayRollover('u1')

    expect(result).toEqual({ newStreak: 1, hearts: MAX_HEARTS })
    expect(updateChain.set).toHaveBeenCalledWith(
      expect.objectContaining({ hearts: MAX_HEARTS, lastActiveDate: todaySast(), streakCount: 1 })
    )
    // Never touches xp - saveProgress() is the only place XP is set.
    expect(updateChain.set.mock.calls[0][0]).not.toHaveProperty('xp')
  })

  it('increments the streak and refills hearts when last active yesterday (SAST)', async () => {
    dbMock.select.mockReturnValueOnce(
      makeChain([{ id: 'u1', xp: 100, streakCount: 4, hearts: 1, lastActiveDate: yesterdaySast() }])
    )
    const updateChain = makeChain(undefined)
    dbMock.update.mockReturnValueOnce(updateChain)

    const result = await applyDayRollover('u1')

    expect(result).toEqual({ newStreak: 5, hearts: MAX_HEARTS })
    expect(updateChain.set).toHaveBeenCalledWith(
      expect.objectContaining({ hearts: MAX_HEARTS })
    )
  })

  it('is a no-op (no DB write) when already rolled over today (SAST)', async () => {
    dbMock.select.mockReturnValueOnce(
      makeChain([{ id: 'u1', xp: 100, streakCount: 4, hearts: 2, lastActiveDate: todaySast() }])
    )

    const result = await applyDayRollover('u1')

    expect(result).toEqual({ newStreak: 4, hearts: 2 })
    expect(dbMock.update).not.toHaveBeenCalled()
  })

  it('resets the streak to 1 and refills hearts after missing more than a day', async () => {
    dbMock.select.mockReturnValueOnce(
      makeChain([{ id: 'u1', xp: 100, streakCount: 9, hearts: 0, lastActiveDate: '2026-09-01' }])
    )
    dbMock.update.mockReturnValueOnce(makeChain(undefined))

    const result = await applyDayRollover('u1')

    expect(result).toEqual({ newStreak: 1, hearts: MAX_HEARTS })
  })

  it('treats a student active at 23:30 UTC as already on the next SAST day', async () => {
    // 23:30 UTC is 01:30 SAST the next day - lastActiveDate written by
    // an earlier call *today* (in SAST terms) should still count as
    // "already rolled over today", not roll again.
    vi.setSystemTime(new Date('2026-09-19T23:30:00.000Z'))
    dbMock.select.mockReturnValueOnce(
      makeChain([{ id: 'u1', xp: 0, streakCount: 1, hearts: 3, lastActiveDate: '2026-09-20' }])
    )

    const result = await applyDayRollover('u1')

    expect(result).toEqual({ newStreak: 1, hearts: 3 })
    expect(dbMock.update).not.toHaveBeenCalled()
  })

  it('returns null when the user does not exist', async () => {
    dbMock.select.mockReturnValueOnce(makeChain([]))

    const result = await applyDayRollover('missing')

    expect(result).toBeNull()
  })
})

describe('saveProgress', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('runs inside a transaction: upsert-placeholder then SELECT ... FOR UPDATE', async () => {
    txMock.insert.mockReturnValueOnce(makeChain(undefined))
    txMock.select.mockReturnValueOnce(makeChain([{ id: 'progress-1', status: 'unanswered', attempts: 0 }]))
    const progressUpdateChain = makeChain(undefined)
    const xpUpdateChain = makeChain(undefined)
    txMock.update
      .mockReturnValueOnce(progressUpdateChain)
      .mockReturnValueOnce(xpUpdateChain)

    const result = await saveProgress('u1', 'q1', true)

    expect(dbMock.transaction).toHaveBeenCalledTimes(1)
    expect(result).toEqual({ xpEarned: XP_PER_CORRECT_ANSWER })

    // Upsert-placeholder insert, guarded by ON CONFLICT DO NOTHING.
    const insertChain = txMock.insert.mock.results[0].value
    expect(insertChain.onConflictDoNothing).toHaveBeenCalled()

    // The row is then locked for the rest of the transaction.
    const selectChain = txMock.select.mock.results[0].value
    expect(selectChain.for).toHaveBeenCalledWith('update')
  })

  it('awards XP once for a first-ever correct answer, and applies it to users.xp atomically', async () => {
    txMock.insert.mockReturnValueOnce(makeChain(undefined))
    txMock.select.mockReturnValueOnce(makeChain([{ id: 'progress-1', status: 'unanswered', attempts: 0 }]))
    const progressUpdateChain = makeChain(undefined)
    const xpUpdateChain = makeChain(undefined)
    txMock.update
      .mockReturnValueOnce(progressUpdateChain)
      .mockReturnValueOnce(xpUpdateChain)

    const result = await saveProgress('u1', 'q1', true)

    expect(result).toEqual({ xpEarned: XP_PER_CORRECT_ANSWER })
    expect(txMock.update).toHaveBeenCalledTimes(2)
    const xpSetArg = xpUpdateChain.set.mock.calls[0][0]
    expect(xpSetArg).toHaveProperty('xp')
    expect(typeof xpSetArg.xp).not.toBe('number') // a SQL fragment (xp + 10), not a client-trusted number
  })

  it('awards nothing for a wrong answer, and only updates the progress row (no xp call)', async () => {
    txMock.insert.mockReturnValueOnce(makeChain(undefined))
    txMock.select.mockReturnValueOnce(makeChain([{ id: 'progress-1', status: 'incorrect', attempts: 1 }]))
    const progressUpdateChain = makeChain(undefined)
    txMock.update.mockReturnValueOnce(progressUpdateChain)

    const result = await saveProgress('u1', 'q1', false)

    expect(result).toEqual({ xpEarned: 0 })
    expect(progressUpdateChain.set).toHaveBeenCalledWith(
      expect.objectContaining({ status: 'incorrect' })
    )
    expect(txMock.update).toHaveBeenCalledTimes(1)
  })

  it('does not re-award XP for a question already marked correct (no XP farming via repeat answers)', async () => {
    txMock.insert.mockReturnValueOnce(makeChain(undefined))
    txMock.select.mockReturnValueOnce(makeChain([{ id: 'progress-1', status: 'correct', attempts: 2 }]))
    txMock.update.mockReturnValueOnce(makeChain(undefined))

    const result = await saveProgress('u1', 'q1', true)

    expect(result).toEqual({ xpEarned: 0 })
    // Only the student_progress row update - no second call to add xp.
    expect(txMock.update).toHaveBeenCalledTimes(1)
  })

  it('returns null and does not throw when the transaction fails', async () => {
    dbMock.transaction.mockImplementationOnce(async () => {
      throw new Error('serialization failure')
    })

    const result = await saveProgress('u1', 'q1', true)

    expect(result).toBeNull()
  })

  it('two concurrent correct submissions for the same question award XP exactly once (simulated serialization)', async () => {
    // Simulates what SELECT ... FOR UPDATE guarantees in real Postgres:
    // the second transaction's select only runs after the first's
    // update has "committed", so it sees status: 'correct' already.
    let committedStatus: string | null = null

    txMock.insert.mockImplementation(() => makeChain(undefined))
    txMock.select.mockImplementation(() =>
      makeChain([{ id: 'progress-1', status: committedStatus ?? 'unanswered', attempts: committedStatus ? 1 : 0 }])
    )
    txMock.update.mockImplementation(() => {
      const chain = makeChain(undefined)
      const originalSet = chain.set
      chain.set = vi.fn((setArg: Record<string, unknown>) => {
        if (setArg.status) {
          committedStatus = setArg.status as string
        }
        return originalSet(setArg)
      })
      return chain
    })

    const first = await saveProgress('u1', 'q1', true)
    const second = await saveProgress('u1', 'q1', true)

    expect(first).toEqual({ xpEarned: XP_PER_CORRECT_ANSWER })
    expect(second).toEqual({ xpEarned: 0 })
  })
})
