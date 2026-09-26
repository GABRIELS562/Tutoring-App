import { describe, it, expect, vi, beforeEach } from 'vitest'
import type { saveProgress, recordWrongAnswer, applyDayRollover } from '@/db/queries/questions'
import type { getUserById } from '@/db/queries/users'
import { MAX_HEARTS } from '@/lib/game-rules'

const requireUserMock = vi.fn()
const saveProgressMock = vi.fn<typeof saveProgress>(async () => ({ xpEarned: 10 }))
// One call now does both halves of a wrong answer, so a failed save
// rolls the heart back instead of leaving it spent.
const recordWrongAnswerMock = vi.fn<typeof recordWrongAnswer>(async () => ({ ok: true, xpEarned: 0, hearts: 4 }))
const applyDayRolloverMock = vi.fn<typeof applyDayRollover>(async () => ({ newStreak: 1, hearts: MAX_HEARTS }))
type UserRow = Awaited<ReturnType<typeof getUserById>>

function fakeUser(overrides: Partial<NonNullable<UserRow>> = {}): NonNullable<UserRow> {
  return {
    id: 'user-1',
    email: 'a@b.com',
    name: 'Test Student',
    grade: 11,
    school: null,
    xp: 0,
    streakCount: 0,
    lastActiveDate: null,
    hearts: 5,
    isPremium: false,
    isAdmin: false,
    createdAt: null,
    aiModulesCompleted: [],
    promptChallengesCompleted: 0,
    cvStatement: null,
    badges: [],
    ...overrides,
  }
}

const getUserByIdMock = vi.fn<typeof getUserById>(async () => fakeUser())

vi.mock('@/lib/auth/require-user', async () => {
  const actual = await vi.importActual<typeof import('@/lib/auth/require-user')>(
    '@/lib/auth/require-user'
  )
  return {
    ...actual,
    requireUser: requireUserMock,
  }
})

vi.mock('@/db/queries/questions', () => ({
  saveProgress: saveProgressMock,
  recordWrongAnswer: recordWrongAnswerMock,
  applyDayRollover: applyDayRolloverMock,
}))

vi.mock('@/db/queries/users', () => ({
  getUserById: getUserByIdMock,
}))

let isDemoMode = false
vi.mock('@/db', () => ({
  get isDemoMode() {
    return isDemoMode
  },
}))

const { AuthError } = await import('@/lib/auth/require-user')
const { recordAnswer, completeQuiz } = await import('../actions')

const VALID_QUESTION_ID = 'c56a4180-65aa-42ec-a945-5fd21dec0538'

describe('recordAnswer', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    isDemoMode = false
    requireUserMock.mockResolvedValue({ id: 'user-1', email: 'a@b.com' })
    getUserByIdMock.mockResolvedValue(fakeUser())
    saveProgressMock.mockResolvedValue({ xpEarned: 10 })
    recordWrongAnswerMock.mockResolvedValue({ ok: true, xpEarned: 0, hearts: 4 })
    applyDayRolloverMock.mockResolvedValue({ newStreak: 1, hearts: MAX_HEARTS })
  })

  it('rejects a malformed question id without touching auth or the database', async () => {
    const result = await recordAnswer('not-a-uuid', true)

    expect(result).toEqual({ ok: false, error: 'Invalid question id' })
    expect(requireUserMock).not.toHaveBeenCalled()
    expect(saveProgressMock).not.toHaveBeenCalled()
  })

  it('requires an authenticated session', async () => {
    requireUserMock.mockRejectedValueOnce(new AuthError('Unauthorized', 401))

    await expect(recordAnswer(VALID_QUESTION_ID, true)).rejects.toThrow('Unauthorized')
    expect(saveProgressMock).not.toHaveBeenCalled()
  })

  it('is a no-op against the database in demo mode', async () => {
    isDemoMode = true

    const result = await recordAnswer(VALID_QUESTION_ID, true)

    expect(result).toEqual({ ok: true, demo: true })
    expect(applyDayRolloverMock).not.toHaveBeenCalled()
    expect(getUserByIdMock).not.toHaveBeenCalled()
    expect(saveProgressMock).not.toHaveBeenCalled()
  })

  it('applies the day rollover before checking hearts (fixes the 0-hearts deadlock)', async () => {
    const callOrder: string[] = []
    applyDayRolloverMock.mockImplementationOnce(async () => {
      callOrder.push('rollover')
      return { newStreak: 1, hearts: MAX_HEARTS }
    })
    getUserByIdMock.mockImplementationOnce(async () => {
      callOrder.push('gate')
      return fakeUser()
    })

    await recordAnswer(VALID_QUESTION_ID, true)

    expect(callOrder).toEqual(['rollover', 'gate'])
  })

  it('a student at 0 hearts with lastActiveDate yesterday can answer again today (deadlock fix)', async () => {
    // applyDayRollover reports the refill it just performed ...
    applyDayRolloverMock.mockResolvedValueOnce({ newStreak: 2, hearts: MAX_HEARTS })
    // ... so the wrong-answer gate-and-decrement now succeeds against
    // the refilled value instead of being permanently blocked.
    recordWrongAnswerMock.mockResolvedValueOnce({ ok: true, xpEarned: 0, hearts: MAX_HEARTS - 1 })

    const result = await recordAnswer(VALID_QUESTION_ID, false)

    expect(result).toEqual({ ok: true, xpEarned: 0 })
    expect(recordWrongAnswerMock).toHaveBeenCalledWith('user-1', VALID_QUESTION_ID)
  })

  it('a student already active today at 0 hearts stays blocked (no refill due)', async () => {
    // applyDayRollover is a no-op - already rolled over today, hearts
    // stayed at 0.
    applyDayRolloverMock.mockResolvedValueOnce({ newStreak: 2, hearts: 0 })
    recordWrongAnswerMock.mockResolvedValueOnce({ ok: false, reason: 'blocked' })

    const result = await recordAnswer(VALID_QUESTION_ID, false)

    expect(result).toEqual({ ok: false, error: 'out_of_hearts' })
    expect(saveProgressMock).not.toHaveBeenCalled()
  })

  it('surfaces a save failure when the day rollover fails', async () => {
    applyDayRolloverMock.mockResolvedValueOnce(null)

    const result = await recordAnswer(VALID_QUESTION_ID, true)

    expect(result).toEqual({ ok: false, error: 'Could not save your answer' })
    expect(getUserByIdMock).not.toHaveBeenCalled()
  })

  it('blocks a non-premium user at 0 hearts on a correct answer, without saving progress or awarding XP', async () => {
    getUserByIdMock.mockResolvedValueOnce(fakeUser({ hearts: 0, isPremium: false }))

    const result = await recordAnswer(VALID_QUESTION_ID, true)

    expect(result).toEqual({ ok: false, error: 'out_of_hearts' })
    expect(saveProgressMock).not.toHaveBeenCalled()
  })

  it('never blocks a premium user, even at 0 hearts', async () => {
    getUserByIdMock.mockResolvedValueOnce(fakeUser({ hearts: 0, isPremium: true }))

    const result = await recordAnswer(VALID_QUESTION_ID, true)

    expect(result).toEqual({ ok: true, xpEarned: 10 })
    expect(saveProgressMock).toHaveBeenCalledWith('user-1', VALID_QUESTION_ID, true)
  })

  it('reads hearts and premium status via a single getUserById call for a correct answer', async () => {
    await recordAnswer(VALID_QUESTION_ID, true)

    expect(getUserByIdMock).toHaveBeenCalledTimes(1)
    expect(getUserByIdMock).toHaveBeenCalledWith('user-1')
  })

  it('a correct answer never calls the hearts decrement gate (does not consume a heart)', async () => {
    const result = await recordAnswer(VALID_QUESTION_ID, true)

    expect(result).toEqual({ ok: true, xpEarned: 10 })
    expect(recordWrongAnswerMock).not.toHaveBeenCalled()
  })

  it('a wrong answer never calls getUserById (uses the atomic gate-and-decrement instead)', async () => {
    await recordAnswer(VALID_QUESTION_ID, false)

    expect(getUserByIdMock).not.toHaveBeenCalled()
    expect(recordWrongAnswerMock).toHaveBeenCalledWith('user-1', VALID_QUESTION_ID)
    // The heart and the progress row are written in one transaction, so the
    // action must not call saveProgress separately - doing so is what let a
    // retry spend a second heart for one wrong answer.
    expect(saveProgressMock).not.toHaveBeenCalled()
  })

  it('does not re-award XP for a repeat correct answer (forwards whatever saveProgress reports)', async () => {
    saveProgressMock.mockResolvedValueOnce({ xpEarned: 0 })

    const result = await recordAnswer(VALID_QUESTION_ID, true)

    expect(result).toEqual({ ok: true, xpEarned: 0 })
  })

  it('does not save progress when the wrong-answer hearts gate blocks', async () => {
    recordWrongAnswerMock.mockResolvedValueOnce({ ok: false, reason: 'blocked' })

    const result = await recordAnswer(VALID_QUESTION_ID, false)

    expect(result).toEqual({ ok: false, error: 'out_of_hearts' })
    expect(saveProgressMock).not.toHaveBeenCalled()
  })

  it('surfaces a save failure instead of silently succeeding when saveProgress fails', async () => {
    saveProgressMock.mockResolvedValueOnce(null)

    const result = await recordAnswer(VALID_QUESTION_ID, true)

    expect(result).toEqual({ ok: false, error: 'Could not save your answer' })
  })

  it('surfaces a save failure (not out_of_hearts) when the hearts gate errors for a reason other than blocked', async () => {
    recordWrongAnswerMock.mockResolvedValueOnce({ ok: false, reason: 'error' })

    const result = await recordAnswer(VALID_QUESTION_ID, false)

    expect(result).toEqual({ ok: false, error: 'Could not save your answer' })
  })

  it('surfaces a save failure when the user row cannot be read for a correct answer', async () => {
    getUserByIdMock.mockResolvedValueOnce(null)

    const result = await recordAnswer(VALID_QUESTION_ID, true)

    expect(result).toEqual({ ok: false, error: 'Could not save your answer' })
    expect(saveProgressMock).not.toHaveBeenCalled()
  })
})

describe('completeQuiz', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    isDemoMode = false
    requireUserMock.mockResolvedValue({ id: 'user-1', email: 'a@b.com' })
    applyDayRolloverMock.mockResolvedValue({ newStreak: 3, hearts: MAX_HEARTS })
  })

  it('requires an authenticated session', async () => {
    requireUserMock.mockRejectedValueOnce(new AuthError('Unauthorized', 401))

    await expect(completeQuiz()).rejects.toThrow('Unauthorized')
    expect(applyDayRolloverMock).not.toHaveBeenCalled()
  })

  it('is a no-op against the database in demo mode', async () => {
    isDemoMode = true

    const result = await completeQuiz()

    expect(result).toEqual({ ok: true, demo: true })
    expect(applyDayRolloverMock).not.toHaveBeenCalled()
  })

  it('takes no XP argument - cannot change xp, only applies the day rollover', async () => {
    const result = await completeQuiz()

    expect(result).toEqual({ ok: true })
    expect(applyDayRolloverMock).toHaveBeenCalledTimes(1)
    expect(applyDayRolloverMock).toHaveBeenCalledWith('user-1')
  })

  it('surfaces a save failure when the day rollover fails', async () => {
    applyDayRolloverMock.mockResolvedValueOnce(null)

    const result = await completeQuiz()

    expect(result).toEqual({ ok: false, error: 'Could not save your answer' })
  })
})
