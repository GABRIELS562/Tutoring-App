import { describe, it, expect, vi, beforeEach } from 'vitest'

const requireUserMock = vi.fn()
const saveProgressMock = vi.fn(async () => ({ xpEarned: 10 }))
const updateUserXPMock = vi.fn(async () => ({ newXp: 10, newStreak: 1 }))
const decrementHeartsMock = vi.fn(async () => ({ hearts: 4 }))

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
  updateUserXP: updateUserXPMock,
  decrementHearts: decrementHeartsMock,
}))

let isDemoMode = false
vi.mock('@/db', () => ({
  get isDemoMode() {
    return isDemoMode
  },
}))

const { AuthError } = await import('@/lib/auth/require-user')
const { recordAnswer, completeQuiz } = await import('../actions')

describe('recordAnswer', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    isDemoMode = false
  })

  it('requires an authenticated session', async () => {
    requireUserMock.mockRejectedValueOnce(new AuthError('Unauthorized', 401))

    await expect(recordAnswer('q1', true)).rejects.toThrow('Unauthorized')
    expect(saveProgressMock).not.toHaveBeenCalled()
  })

  it('is a no-op against the database in demo mode', async () => {
    isDemoMode = true
    requireUserMock.mockResolvedValueOnce({ id: 'demo-user', email: null })

    const result = await recordAnswer('q1', true)

    expect(result).toEqual({ ok: true, demo: true })
    expect(saveProgressMock).not.toHaveBeenCalled()
    expect(decrementHeartsMock).not.toHaveBeenCalled()
  })

  it('calls through to saveProgress for a correct answer, without decrementing hearts', async () => {
    requireUserMock.mockResolvedValueOnce({ id: 'user-1', email: 'a@b.com' })

    const result = await recordAnswer('q1', true)

    expect(result).toEqual({ ok: true })
    expect(saveProgressMock).toHaveBeenCalledWith('user-1', 'q1', true)
    expect(decrementHeartsMock).not.toHaveBeenCalled()
  })

  it('calls through to saveProgress and decrementHearts for a wrong answer', async () => {
    requireUserMock.mockResolvedValueOnce({ id: 'user-1', email: 'a@b.com' })

    const result = await recordAnswer('q1', false)

    expect(result).toEqual({ ok: true })
    expect(saveProgressMock).toHaveBeenCalledWith('user-1', 'q1', false)
    expect(decrementHeartsMock).toHaveBeenCalledWith('user-1')
  })
})

describe('completeQuiz', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    isDemoMode = false
  })

  it('requires an authenticated session', async () => {
    requireUserMock.mockRejectedValueOnce(new AuthError('Unauthorized', 401))

    await expect(completeQuiz(50)).rejects.toThrow('Unauthorized')
    expect(updateUserXPMock).not.toHaveBeenCalled()
  })

  it('is a no-op against the database in demo mode', async () => {
    isDemoMode = true
    requireUserMock.mockResolvedValueOnce({ id: 'demo-user', email: null })

    const result = await completeQuiz(50)

    expect(result).toEqual({ ok: true, demo: true })
    expect(updateUserXPMock).not.toHaveBeenCalled()
  })

  it('calls through to exactly one updateUserXP', async () => {
    requireUserMock.mockResolvedValueOnce({ id: 'user-1', email: 'a@b.com' })

    const result = await completeQuiz(50)

    expect(result).toEqual({ ok: true })
    expect(updateUserXPMock).toHaveBeenCalledTimes(1)
    expect(updateUserXPMock).toHaveBeenCalledWith('user-1', 50)
  })
})
