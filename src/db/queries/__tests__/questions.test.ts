import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { todaySast, yesterdaySast } from '@/lib/dates'
import { XP_PER_CORRECT_ANSWER } from '@/lib/game-rules'

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
  chain.then = (resolve: (value: unknown) => void) => resolve(result)
  return chain
}

const dbMock = {
  select: vi.fn(),
  update: vi.fn(),
  insert: vi.fn(),
}

vi.mock('@/db', () => ({ db: dbMock }))

const {
  refillHeartsIfNewDay,
  decrementHearts,
  touchStreak,
  saveProgress,
} = await import('../questions')

describe('refillHeartsIfNewDay (pure)', () => {
  it('returns the max hearts value when it is a new day', () => {
    expect(refillHeartsIfNewDay(true)).toBe(5)
  })

  it('returns undefined (no refill) when it is not a new day', () => {
    expect(refillHeartsIfNewDay(false)).toBeUndefined()
  })

  it('respects a custom max hearts value', () => {
    expect(refillHeartsIfNewDay(true, 10)).toBe(10)
  })
})

describe('decrementHearts', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('performs a single atomic UPDATE ... RETURNING (no read-then-write)', async () => {
    const updateChain = makeChain([{ hearts: 2 }])
    dbMock.update.mockReturnValueOnce(updateChain)

    const result = await decrementHearts('user-1')

    expect(result).toEqual({ hearts: 2 })
    expect(dbMock.select).not.toHaveBeenCalled()
    expect(dbMock.update).toHaveBeenCalledTimes(1)
  })

  it('floors at 0 in SQL via GREATEST(hearts - 1, 0)', async () => {
    const updateChain = makeChain([{ hearts: 0 }])
    dbMock.update.mockReturnValueOnce(updateChain)

    const result = await decrementHearts('user-1')

    expect(result).toEqual({ hearts: 0 })

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
    expect(rendered).toContain('COALESCE(')
    expect(rendered).toContain('- 1, 0)')
  })

  it('returns null when the user does not exist (no row to RETURNING)', async () => {
    dbMock.update.mockReturnValueOnce(makeChain([]))

    const result = await decrementHearts('missing-user')

    expect(result).toBeNull()
  })

  it('returns null and does not throw on a DB error', async () => {
    dbMock.update.mockReturnValueOnce({
      set: () => { throw new Error('db down') },
    })

    const result = await decrementHearts('user-1')

    expect(result).toBeNull()
  })
})

describe('touchStreak', () => {
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

  it('starts the streak at 1 on first-ever activity (no lastActiveDate)', async () => {
    dbMock.select.mockReturnValueOnce(
      makeChain([{ id: 'u1', xp: 0, streakCount: 0, lastActiveDate: null }])
    )
    const updateChain = makeChain(undefined)
    dbMock.update.mockReturnValueOnce(updateChain)

    const result = await touchStreak('u1')

    expect(result).toEqual({ newStreak: 1 })
    // A new day (first activity) refills hearts in the same update call.
    // Never touches xp - saveProgress() is the only place XP is set.
    expect(updateChain.set).toHaveBeenCalledWith(
      expect.objectContaining({ hearts: 5, lastActiveDate: todaySast() })
    )
    expect(updateChain.set.mock.calls[0][0]).not.toHaveProperty('xp')
  })

  it('increments the streak when last active yesterday (SAST)', async () => {
    dbMock.select.mockReturnValueOnce(
      makeChain([{ id: 'u1', xp: 100, streakCount: 4, lastActiveDate: yesterdaySast() }])
    )
    const updateChain = makeChain(undefined)
    dbMock.update.mockReturnValueOnce(updateChain)

    const result = await touchStreak('u1')

    expect(result).toEqual({ newStreak: 5 })
    expect(updateChain.set).toHaveBeenCalledWith(
      expect.objectContaining({ hearts: 5 })
    )
  })

  it('keeps the streak and does not refill hearts when already active today (SAST)', async () => {
    dbMock.select.mockReturnValueOnce(
      makeChain([{ id: 'u1', xp: 100, streakCount: 4, lastActiveDate: todaySast() }])
    )
    const updateChain = makeChain(undefined)
    dbMock.update.mockReturnValueOnce(updateChain)

    const result = await touchStreak('u1')

    expect(result).toEqual({ newStreak: 4 })
    const setArg = updateChain.set.mock.calls[0][0]
    expect(setArg).not.toHaveProperty('hearts')
  })

  it('resets the streak to 1 after missing more than a day', async () => {
    dbMock.select.mockReturnValueOnce(
      makeChain([{ id: 'u1', xp: 100, streakCount: 9, lastActiveDate: '2026-09-01' }])
    )
    dbMock.update.mockReturnValueOnce(makeChain(undefined))

    const result = await touchStreak('u1')

    expect(result).toEqual({ newStreak: 1 })
  })

  it('treats a student active at 23:30 UTC as already on the next SAST day', async () => {
    // 23:30 UTC is 01:30 SAST the next day - lastActiveDate written by
    // an earlier call *today* (in SAST terms) should still count as
    // "already active today", not roll the streak.
    vi.setSystemTime(new Date('2026-09-19T23:30:00.000Z'))
    dbMock.select.mockReturnValueOnce(
      makeChain([{ id: 'u1', xp: 0, streakCount: 1, lastActiveDate: '2026-09-20' }])
    )
    const updateChain = makeChain(undefined)
    dbMock.update.mockReturnValueOnce(updateChain)

    const result = await touchStreak('u1')

    expect(result).toEqual({ newStreak: 1 })
    expect(updateChain.set.mock.calls[0][0]).not.toHaveProperty('hearts')
  })

  it('returns null when the user does not exist', async () => {
    dbMock.select.mockReturnValueOnce(makeChain([]))

    const result = await touchStreak('missing')

    expect(result).toBeNull()
  })
})

describe('saveProgress', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('inserts a new progress record when none exists, and awards XP', async () => {
    dbMock.select.mockReturnValueOnce(makeChain([]))
    const insertChain = makeChain(undefined)
    dbMock.insert.mockReturnValueOnce(insertChain)
    const xpUpdateChain = makeChain(undefined)
    dbMock.update.mockReturnValueOnce(xpUpdateChain)

    const result = await saveProgress('u1', 'q1', true)

    expect(result).toEqual({ xpEarned: XP_PER_CORRECT_ANSWER })
    expect(insertChain.values).toHaveBeenCalledWith(
      expect.objectContaining({ userId: 'u1', questionId: 'q1', status: 'correct' })
    )
  })

  it('applies awarded XP to users.xp atomically, in the same call', async () => {
    dbMock.select.mockReturnValueOnce(makeChain([]))
    dbMock.insert.mockReturnValueOnce(makeChain(undefined))
    const xpUpdateChain = makeChain(undefined)
    dbMock.update.mockReturnValueOnce(xpUpdateChain)

    await saveProgress('u1', 'q1', true)

    expect(dbMock.update).toHaveBeenCalledTimes(1)
    const setArg = xpUpdateChain.set.mock.calls[0][0]
    expect(setArg).toHaveProperty('xp')
    expect(typeof setArg.xp).not.toBe('number') // a SQL fragment (xp + 10), not a client-trusted number
  })

  it('updates an existing progress record instead of inserting a duplicate, and awards nothing for a wrong answer', async () => {
    dbMock.select.mockReturnValueOnce(makeChain([{ id: 'progress-1', status: 'incorrect' }]))
    const updateChain = makeChain(undefined)
    dbMock.update.mockReturnValueOnce(updateChain)

    const result = await saveProgress('u1', 'q1', false)

    expect(result).toEqual({ xpEarned: 0 })
    expect(dbMock.insert).not.toHaveBeenCalled()
    expect(updateChain.set).toHaveBeenCalledWith(
      expect.objectContaining({ status: 'incorrect' })
    )
    // No xp update call at all when nothing was earned.
    expect(dbMock.update).toHaveBeenCalledTimes(1)
  })

  it('does not re-award XP for a question already marked correct (no XP farming via repeat answers)', async () => {
    dbMock.select.mockReturnValueOnce(makeChain([{ id: 'progress-1', status: 'correct' }]))
    const updateChain = makeChain(undefined)
    dbMock.update.mockReturnValueOnce(updateChain)

    const result = await saveProgress('u1', 'q1', true)

    expect(result).toEqual({ xpEarned: 0 })
    // Only the student_progress row update - no second call to add xp.
    expect(dbMock.update).toHaveBeenCalledTimes(1)
  })

  it('awards XP once when a question moves from incorrect to correct', async () => {
    dbMock.select.mockReturnValueOnce(makeChain([{ id: 'progress-1', status: 'incorrect' }]))
    const progressUpdateChain = makeChain(undefined)
    const xpUpdateChain = makeChain(undefined)
    dbMock.update
      .mockReturnValueOnce(progressUpdateChain)
      .mockReturnValueOnce(xpUpdateChain)

    const result = await saveProgress('u1', 'q1', true)

    expect(result).toEqual({ xpEarned: XP_PER_CORRECT_ANSWER })
    expect(dbMock.update).toHaveBeenCalledTimes(2)
  })
})
