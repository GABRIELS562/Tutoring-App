import { describe, it, expect, vi, beforeEach } from 'vitest'

// Same minimal chainable/thenable drizzle mock as questions.test.ts.
type Chain = {
  from: ReturnType<typeof vi.fn>
  where: ReturnType<typeof vi.fn>
  limit: ReturnType<typeof vi.fn>
  set: ReturnType<typeof vi.fn>
  values: ReturnType<typeof vi.fn>
  for: ReturnType<typeof vi.fn>
  groupBy: ReturnType<typeof vi.fn>
  onConflictDoNothing: ReturnType<typeof vi.fn>
  then: (resolve: (value: unknown) => void) => void
}

function makeChain(result: unknown): Chain {
  const chain = {} as Chain
  for (const key of ['from', 'where', 'limit', 'set', 'values', 'for', 'groupBy', 'onConflictDoNothing'] as const) {
    chain[key] = vi.fn(() => chain)
  }
  chain.then = (resolve: (value: unknown) => void) => resolve(result)
  return chain
}

const txMock = { select: vi.fn(), update: vi.fn(), insert: vi.fn() }
const dbMock = {
  select: vi.fn(),
  update: vi.fn(),
  insert: vi.fn(),
  transaction: vi.fn(async (cb: (tx: typeof txMock) => unknown) => cb(txMock)),
}

vi.mock('@/db', () => ({ db: dbMock }))

const { saveExamAttempt, getExamAttemptsForPaper, getExamSummary } = await import('../exam')

const input = {
  userId: 'user-1',
  paperKey: 'gr11-p2-2013',
  itemId: 'gr11-p2-2013-1.1',
  familiarity: 'confident' as const,
  calibration: 'mastered' as const,
  marksEarned: 2,
  marksAvailable: 2,
  xpIfFirst: 30,
}

/** Arranges the tx so the locked row comes back with `attempts` already set. */
function withExistingAttempts(attempts: number) {
  txMock.insert.mockReturnValueOnce(makeChain(undefined))
  txMock.select.mockReturnValueOnce(makeChain([{ id: 'row-1', attempts }]))
  txMock.update.mockReturnValue(makeChain(undefined))
}

describe('saveExamAttempt awards XP once per question', () => {
  beforeEach(() => vi.clearAllMocks())

  it('awards the XP on the first attempt', async () => {
    withExistingAttempts(0)

    const result = await saveExamAttempt(input)

    expect(result).toEqual({ xpEarned: 30, firstAttempt: true })
  })

  /**
   * Replaying one question must not be the fastest way to farm XP. The
   * attempt is still recorded - a student who comes back and now gets it
   * right should see that - it just earns nothing further.
   */
  it('awards nothing on a re-attempt, but still records it', async () => {
    withExistingAttempts(1)

    const result = await saveExamAttempt(input)

    expect(result).toEqual({ xpEarned: 0, firstAttempt: false })
    expect(txMock.update).toHaveBeenCalled()
  })

  it('does not touch users.xp on a re-attempt', async () => {
    withExistingAttempts(1)

    await saveExamAttempt(input)

    // One update: the attempt row. A second would be the XP grant.
    expect(txMock.update).toHaveBeenCalledTimes(1)
  })

  it('updates users.xp on the first attempt', async () => {
    withExistingAttempts(0)

    await saveExamAttempt(input)

    expect(txMock.update).toHaveBeenCalledTimes(2)
  })

  /**
   * The insert must be a no-op on conflict and the read must lock, or two
   * concurrent first attempts at the same question both see "no attempt
   * yet" and both award XP.
   */
  it('upserts without conflict and locks the row it reads', async () => {
    const insertChain = makeChain(undefined)
    const selectChain = makeChain([{ id: 'row-1', attempts: 0 }])
    txMock.insert.mockReturnValueOnce(insertChain)
    txMock.select.mockReturnValueOnce(selectChain)
    txMock.update.mockReturnValue(makeChain(undefined))

    await saveExamAttempt(input)

    expect(insertChain.onConflictDoNothing).toHaveBeenCalled()
    expect(selectChain.for).toHaveBeenCalledWith('update')
  })

  it('runs inside a single transaction', async () => {
    withExistingAttempts(0)

    await saveExamAttempt(input)

    expect(dbMock.transaction).toHaveBeenCalledTimes(1)
  })

  it('returns null rather than throwing when the write fails', async () => {
    dbMock.transaction.mockRejectedValueOnce(new Error('connection lost'))

    await expect(saveExamAttempt(input)).resolves.toBeNull()
  })
})

/**
 * A student who cannot load their history should still be able to sit the
 * paper. They lose the rehydration, not the exam - so these read paths
 * degrade to empty rather than propagating.
 */
describe('reads fail soft', () => {
  beforeEach(() => vi.clearAllMocks())

  it('returns no attempts when the query fails', async () => {
    dbMock.select.mockImplementationOnce(() => {
      throw new Error('connection lost')
    })

    await expect(getExamAttemptsForPaper('user-1', 'gr11-p2-2013')).resolves.toEqual([])
  })

  it('returns no summary when the query fails', async () => {
    dbMock.select.mockImplementationOnce(() => {
      throw new Error('connection lost')
    })

    await expect(getExamSummary('user-1')).resolves.toEqual([])
  })

  it('coerces the aggregate counts postgres returns as strings', async () => {
    dbMock.select.mockReturnValueOnce(
      makeChain([
        {
          paperKey: 'gr11-p2-2013',
          itemsAttempted: '3',
          marksEarned: '7',
          marksAvailable: '10',
          xpEarned: '90',
          blindSpots: '1',
          mastered: '2',
        },
      ])
    )

    const [summary] = await getExamSummary('user-1')

    expect(summary).toEqual({
      paperKey: 'gr11-p2-2013',
      itemsAttempted: 3,
      marksEarned: 7,
      marksAvailable: 10,
      xpEarned: 90,
      blindSpots: 1,
      mastered: 2,
    })
  })
})
