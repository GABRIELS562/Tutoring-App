import { describe, it, expect, vi, beforeEach } from 'vitest'

/**
 * The exam game's answers now persist, which means for the first time a
 * client can try to tell the server what it scored. It must not be able to.
 *
 * Practice already establishes the rule - "XP is decided server-side; the
 * client never sends an XP amount" - and these pin the same rule for the
 * exam: the action accepts a CLAIM and a set of ticked mark points, and
 * derives everything else from the mark scheme in src/content/exam.
 */

const requireUser = vi.fn(async () => ({ id: 'user-1', email: 'a@b.c' }))
type SavedCall = {
  userId: string
  paperKey: string
  itemId: string
  familiarity: string
  calibration: string
  marksEarned: number
  marksAvailable: number
  xpIfFirst: number
}
const saveExamAttempt = vi
  .fn<(input: SavedCall) => Promise<{ xpEarned: number; firstAttempt: boolean }>>()
  .mockResolvedValue({ xpEarned: 15, firstAttempt: true })
const applyDayRollover = vi.fn(async () => ({ newStreak: 1, hearts: 5 }))

vi.mock('@/lib/auth/require-user', () => ({ requireUser }))
vi.mock('@/db/queries/exam', () => ({ saveExamAttempt }))
vi.mock('@/db/queries/questions', () => ({ applyDayRollover }))
vi.mock('@/db', () => ({ isDemoMode: false }))

const { recordExamAttempt } = await import('../actions')
const { papers } = await import('@/content/exam')

const paper = papers[0]
/** A question with more than one mark point, so partial credit is visible. */
const item = paper.items.find((i) => i.markScheme.length > 1)!

function lastSaved(): SavedCall {
  return saveExamAttempt.mock.calls.at(-1)![0]
}

describe('recordExamAttempt derives the marks itself', () => {
  beforeEach(() => vi.clearAllMocks())

  it('scores the ticked mark points against the real scheme', async () => {
    const result = await recordExamAttempt({
      paperKey: paper.key,
      itemId: item.id,
      familiarity: 'confident',
      satisfied: [0],
    })

    expect(result.ok).toBe(true)
    expect(lastSaved().marksEarned).toBe(item.markScheme[0].value)
    expect(lastSaved().marksAvailable).toBe(item.marks)
  })

  /**
   * `satisfied` is a list of positions, so the obvious forgery is to repeat
   * one. This asserts the outcome at the action's boundary rather than the
   * mechanism: today both the normalisation in recordExamAttempt and the
   * scheme-side filter in marksEarned() independently prevent it, and this
   * must keep holding if either one changes.
   */
  it('cannot be inflated by repeating a mark point', async () => {
    await recordExamAttempt({
      paperKey: paper.key,
      itemId: item.id,
      familiarity: 'confident',
      satisfied: [0, 0, 0, 0, 0],
    })

    expect(lastSaved().marksEarned).toBe(item.markScheme[0].value)
    expect(lastSaved().marksEarned).toBeLessThanOrEqual(item.marks)
  })

  it('ignores mark points that do not exist', async () => {
    await recordExamAttempt({
      paperKey: paper.key,
      itemId: item.id,
      familiarity: 'confident',
      satisfied: [0, 999],
    })

    expect(lastSaved().marksEarned).toBe(item.markScheme[0].value)
  })

  it('never awards more than the question is worth', async () => {
    await recordExamAttempt({
      paperKey: paper.key,
      itemId: item.id,
      familiarity: 'confident',
      satisfied: item.markScheme.map((_, index) => index),
    })

    expect(lastSaved().marksEarned).toBe(item.marks)
  })

  it('computes the calibration from the claim and the outcome', async () => {
    await recordExamAttempt({
      paperKey: paper.key,
      itemId: item.id,
      familiarity: 'confident',
      satisfied: [],
    })

    // Sure of it, scored nothing - the case the whole feature exists for.
    expect(lastSaved().calibration).toBe('blind-spot')
    expect(lastSaved().marksEarned).toBe(0)
  })

  it('rewards a claimed correct answer above an unclaimed one', async () => {
    const all = item.markScheme.map((_, index) => index)

    await recordExamAttempt({ paperKey: paper.key, itemId: item.id, familiarity: 'confident', satisfied: all })
    const claimed = lastSaved().xpIfFirst

    await recordExamAttempt({ paperKey: paper.key, itemId: item.id, familiarity: 'new', satisfied: all })
    const unclaimed = lastSaved().xpIfFirst

    expect(claimed).toBeGreaterThan(unclaimed)
  })
})

describe('recordExamAttempt rejects what it cannot verify', () => {
  beforeEach(() => vi.clearAllMocks())

  it('refuses an unknown question', async () => {
    const result = await recordExamAttempt({
      paperKey: paper.key,
      itemId: 'not-a-real-item',
      familiarity: 'new',
      satisfied: [],
    })

    expect(result).toEqual({ ok: false, error: 'Unknown question' })
    expect(saveExamAttempt).not.toHaveBeenCalled()
  })

  /**
   * Item ids are globally unique, so the paper key is not needed to find
   * the question - it is checked anyway, so a mismatched pair cannot be
   * filed against a paper it does not belong to.
   */
  it('refuses a question that belongs to a different paper', async () => {
    const other = papers.find((p) => p.key !== paper.key)!

    const result = await recordExamAttempt({
      paperKey: other.key,
      itemId: item.id,
      familiarity: 'new',
      satisfied: [],
    })

    expect(result).toEqual({ ok: false, error: 'Unknown question' })
    expect(saveExamAttempt).not.toHaveBeenCalled()
  })

  it('refuses a familiarity it does not recognise', async () => {
    const result = await recordExamAttempt({
      paperKey: paper.key,
      itemId: item.id,
      // @ts-expect-error - exactly what a hand-rolled request would send
      familiarity: 'expert',
      satisfied: [],
    })

    expect(result).toEqual({ ok: false, error: 'Invalid attempt' })
    expect(saveExamAttempt).not.toHaveBeenCalled()
  })

  it('refuses negative mark point positions', async () => {
    const result = await recordExamAttempt({
      paperKey: paper.key,
      itemId: item.id,
      familiarity: 'new',
      satisfied: [-1],
    })

    expect(result).toEqual({ ok: false, error: 'Invalid attempt' })
    expect(saveExamAttempt).not.toHaveBeenCalled()
  })

  it('requires a session before it will look at anything', async () => {
    requireUser.mockRejectedValueOnce(new Error('unauthenticated'))

    await expect(
      recordExamAttempt({ paperKey: paper.key, itemId: item.id, familiarity: 'new', satisfied: [] })
    ).rejects.toThrow()

    expect(saveExamAttempt).not.toHaveBeenCalled()
  })

  /**
   * Whatever the client sends, no field of the payload is passed through to
   * the database untouched except the ones it is allowed to choose.
   */
  it('takes nothing from the client but the claim and the ticks', async () => {
    await recordExamAttempt({
      paperKey: paper.key,
      itemId: item.id,
      familiarity: 'shaky',
      satisfied: [0],
      // @ts-expect-error - a forged payload trying to set its own score
      marksEarned: 999,
      xpEarned: 999,
      userId: 'someone-else',
    })

    const saved = lastSaved()
    expect(saved.marksEarned).toBe(item.markScheme[0].value)
    expect(saved.xpIfFirst).toBeLessThan(999)
    expect(saved).not.toHaveProperty('xpEarned', 999)
  })
})
