import { describe, it, expect, vi, beforeEach } from 'vitest'

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
  updateUserXP,
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

  it('decrements hearts by 1', async () => {
    dbMock.select.mockReturnValueOnce(makeChain([{ hearts: 3 }]))
    dbMock.update.mockReturnValueOnce(makeChain(undefined))

    const result = await decrementHearts('user-1')

    expect(result).toEqual({ hearts: 2 })
  })

  it('floors at 0 and never goes negative', async () => {
    dbMock.select.mockReturnValueOnce(makeChain([{ hearts: 0 }]))
    dbMock.update.mockReturnValueOnce(makeChain(undefined))

    const result = await decrementHearts('user-1')

    expect(result).toEqual({ hearts: 0 })
  })

  it('returns null when the user does not exist', async () => {
    dbMock.select.mockReturnValueOnce(makeChain([]))

    const result = await decrementHearts('missing-user')

    expect(result).toBeNull()
    expect(dbMock.update).not.toHaveBeenCalled()
  })

  it('returns null and does not throw on a DB error', async () => {
    dbMock.select.mockReturnValueOnce({
      from: () => { throw new Error('db down') },
    })

    const result = await decrementHearts('user-1')

    expect(result).toBeNull()
  })
})

describe('updateUserXP', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('starts the streak at 1 on first-ever activity (no lastActiveDate)', async () => {
    dbMock.select.mockReturnValueOnce(
      makeChain([{ id: 'u1', xp: 0, streakCount: 0, lastActiveDate: null }])
    )
    const updateChain = makeChain(undefined)
    dbMock.update.mockReturnValueOnce(updateChain)

    const result = await updateUserXP('u1', 10)

    expect(result).toEqual({ newXp: 10, newStreak: 1 })
    // A new day (first activity) refills hearts in the same update call.
    expect(updateChain.set).toHaveBeenCalledWith(
      expect.objectContaining({ hearts: 5 })
    )
  })

  it('increments the streak when last active yesterday', async () => {
    const yesterday = new Date()
    yesterday.setDate(yesterday.getDate() - 1)

    dbMock.select.mockReturnValueOnce(
      makeChain([{ id: 'u1', xp: 100, streakCount: 4, lastActiveDate: yesterday.toISOString() }])
    )
    const updateChain = makeChain(undefined)
    dbMock.update.mockReturnValueOnce(updateChain)

    const result = await updateUserXP('u1', 10)

    expect(result).toEqual({ newXp: 110, newStreak: 5 })
    expect(updateChain.set).toHaveBeenCalledWith(
      expect.objectContaining({ hearts: 5 })
    )
  })

  it('keeps the streak and does not refill hearts when already active today', async () => {
    const today = new Date().toISOString()

    dbMock.select.mockReturnValueOnce(
      makeChain([{ id: 'u1', xp: 100, streakCount: 4, lastActiveDate: today }])
    )
    const updateChain = makeChain(undefined)
    dbMock.update.mockReturnValueOnce(updateChain)

    const result = await updateUserXP('u1', 10)

    expect(result).toEqual({ newXp: 110, newStreak: 4 })
    const setArg = updateChain.set.mock.calls[0][0]
    expect(setArg).not.toHaveProperty('hearts')
  })

  it('resets the streak to 1 after missing more than a day', async () => {
    const longAgo = new Date()
    longAgo.setDate(longAgo.getDate() - 5)

    dbMock.select.mockReturnValueOnce(
      makeChain([{ id: 'u1', xp: 100, streakCount: 9, lastActiveDate: longAgo.toISOString() }])
    )
    dbMock.update.mockReturnValueOnce(makeChain(undefined))

    const result = await updateUserXP('u1', 10)

    expect(result).toEqual({ newXp: 110, newStreak: 1 })
  })

  it('returns null when the user does not exist', async () => {
    dbMock.select.mockReturnValueOnce(makeChain([]))

    const result = await updateUserXP('missing', 10)

    expect(result).toBeNull()
  })
})

describe('saveProgress', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('inserts a new progress record when none exists', async () => {
    dbMock.select.mockReturnValueOnce(makeChain([]))
    const insertChain = makeChain(undefined)
    dbMock.insert.mockReturnValueOnce(insertChain)

    const result = await saveProgress('u1', 'q1', true)

    expect(result).toEqual({ xpEarned: 10 })
    expect(insertChain.values).toHaveBeenCalledWith(
      expect.objectContaining({ userId: 'u1', questionId: 'q1', status: 'correct' })
    )
  })

  it('updates an existing progress record instead of inserting a duplicate', async () => {
    dbMock.select.mockReturnValueOnce(makeChain([{ id: 'progress-1' }]))
    const updateChain = makeChain(undefined)
    dbMock.update.mockReturnValueOnce(updateChain)

    const result = await saveProgress('u1', 'q1', false)

    expect(result).toEqual({ xpEarned: 0 })
    expect(dbMock.insert).not.toHaveBeenCalled()
    expect(updateChain.set).toHaveBeenCalledWith(
      expect.objectContaining({ status: 'incorrect' })
    )
  })
})
