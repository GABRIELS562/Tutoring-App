import { describe, it, expect, vi, beforeEach } from 'vitest'
import type { saveProgress, decrementHearts, touchStreak } from '@/db/queries/questions'
import type { getUserById } from '@/db/queries/users'

const requireUserMock = vi.fn()
const saveProgressMock = vi.fn<typeof saveProgress>(async () => ({ xpEarned: 10 }))
const decrementHeartsMock = vi.fn<typeof decrementHearts>(async () => ({ hearts: 4 }))
const touchStreakMock = vi.fn<typeof touchStreak>(async () => ({ newStreak: 1 }))
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
  decrementHearts: decrementHeartsMock,
  touchStreak: touchStreakMock,
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
    decrementHeartsMock.mockResolvedValue({ hearts: 4 })
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
    expect(getUserByIdMock).not.toHaveBeenCalled()
    expect(saveProgressMock).not.toHaveBeenCalled()
  })

  it('blocks a non-premium user at 0 hearts, without saving progress or awarding XP', async () => {
    getUserByIdMock.mockResolvedValueOnce(fakeUser({ hearts: 0, isPremium: false }))

    const result = await recordAnswer(VALID_QUESTION_ID, true)

    expect(result).toEqual({ ok: false, error: 'out_of_hearts' })
    expect(saveProgressMock).not.toHaveBeenCalled()
    expect(decrementHeartsMock).not.toHaveBeenCalled()
  })

  it('never blocks a premium user, even at 0 hearts', async () => {
    getUserByIdMock.mockResolvedValueOnce(fakeUser({ hearts: 0, isPremium: true }))

    const result = await recordAnswer(VALID_QUESTION_ID, true)

    expect(result).toEqual({ ok: true, xpEarned: 10 })
    expect(saveProgressMock).toHaveBeenCalledWith('user-1', VALID_QUESTION_ID, true)
  })

  it('reads hearts and premium status in a single call to getUserById', async () => {
    await recordAnswer(VALID_QUESTION_ID, true)

    expect(getUserByIdMock).toHaveBeenCalledTimes(1)
    expect(getUserByIdMock).toHaveBeenCalledWith('user-1')
  })

  it('returns the server-computed xpEarned for a correct answer, without decrementing hearts', async () => {
    const result = await recordAnswer(VALID_QUESTION_ID, true)

    expect(result).toEqual({ ok: true, xpEarned: 10 })
    expect(decrementHeartsMock).not.toHaveBeenCalled()
  })

  it('does not re-award XP for a repeat correct answer (forwards whatever saveProgress reports)', async () => {
    saveProgressMock.mockResolvedValueOnce({ xpEarned: 0 })

    const result = await recordAnswer(VALID_QUESTION_ID, true)

    expect(result).toEqual({ ok: true, xpEarned: 0 })
  })

  it('decrements hearts for a wrong answer', async () => {
    saveProgressMock.mockResolvedValueOnce({ xpEarned: 0 })

    const result = await recordAnswer(VALID_QUESTION_ID, false)

    expect(result).toEqual({ ok: true, xpEarned: 0 })
    expect(decrementHeartsMock).toHaveBeenCalledWith('user-1')
  })

  it('surfaces a save failure instead of silently succeeding when saveProgress fails', async () => {
    saveProgressMock.mockResolvedValueOnce(null)

    const result = await recordAnswer(VALID_QUESTION_ID, true)

    expect(result).toEqual({ ok: false, error: 'Could not save your answer' })
  })

  it('surfaces a save failure when decrementHearts fails on a wrong answer', async () => {
    saveProgressMock.mockResolvedValueOnce({ xpEarned: 0 })
    decrementHeartsMock.mockResolvedValueOnce(null)

    const result = await recordAnswer(VALID_QUESTION_ID, false)

    expect(result).toEqual({ ok: false, error: 'Could not save your answer' })
  })

  it('surfaces a save failure when the user row cannot be read', async () => {
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
    touchStreakMock.mockResolvedValue({ newStreak: 3 })
  })

  it('requires an authenticated session', async () => {
    requireUserMock.mockRejectedValueOnce(new AuthError('Unauthorized', 401))

    await expect(completeQuiz()).rejects.toThrow('Unauthorized')
    expect(touchStreakMock).not.toHaveBeenCalled()
  })

  it('is a no-op against the database in demo mode', async () => {
    isDemoMode = true

    const result = await completeQuiz()

    expect(result).toEqual({ ok: true, demo: true })
    expect(touchStreakMock).not.toHaveBeenCalled()
  })

  it('takes no XP argument - cannot change xp, only touches the streak', async () => {
    const result = await completeQuiz()

    expect(result).toEqual({ ok: true })
    expect(touchStreakMock).toHaveBeenCalledTimes(1)
    expect(touchStreakMock).toHaveBeenCalledWith('user-1')
  })

  it('surfaces a save failure when touchStreak fails', async () => {
    touchStreakMock.mockResolvedValueOnce(null)

    const result = await completeQuiz()

    expect(result).toEqual({ ok: false, error: 'Could not save your answer' })
  })
})
