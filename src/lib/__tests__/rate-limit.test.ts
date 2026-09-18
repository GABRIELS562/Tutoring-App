import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { checkRateLimit } from '@/lib/rate-limit'

describe('checkRateLimit', () => {
  beforeEach(() => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date('2026-01-01T00:00:00Z'))
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('allows requests under the limit and decrements remaining', () => {
    const key = `test-key-${Math.random()}`
    const first = checkRateLimit(key, { max: 3, windowMs: 1000 })
    expect(first.allowed).toBe(true)
    expect(first.remaining).toBe(2)

    const second = checkRateLimit(key, { max: 3, windowMs: 1000 })
    expect(second.allowed).toBe(true)
    expect(second.remaining).toBe(1)
  })

  it('blocks once the max is exceeded within the window', () => {
    const key = `test-key-${Math.random()}`
    checkRateLimit(key, { max: 2, windowMs: 1000 })
    checkRateLimit(key, { max: 2, windowMs: 1000 })
    const third = checkRateLimit(key, { max: 2, windowMs: 1000 })

    expect(third.allowed).toBe(false)
    expect(third.remaining).toBe(0)
  })

  it('resets after the window elapses', () => {
    const key = `test-key-${Math.random()}`
    checkRateLimit(key, { max: 1, windowMs: 1000 })
    const blocked = checkRateLimit(key, { max: 1, windowMs: 1000 })
    expect(blocked.allowed).toBe(false)

    vi.advanceTimersByTime(1001)

    const afterReset = checkRateLimit(key, { max: 1, windowMs: 1000 })
    expect(afterReset.allowed).toBe(true)
  })

  it('tracks separate keys independently', () => {
    const keyA = `key-a-${Math.random()}`
    const keyB = `key-b-${Math.random()}`
    checkRateLimit(keyA, { max: 1, windowMs: 1000 })
    const resultA = checkRateLimit(keyA, { max: 1, windowMs: 1000 })
    const resultB = checkRateLimit(keyB, { max: 1, windowMs: 1000 })

    expect(resultA.allowed).toBe(false)
    expect(resultB.allowed).toBe(true)
  })

  it('defaults to 30 requests per 10 minutes', () => {
    const key = `default-key-${Math.random()}`
    for (let i = 0; i < 30; i++) {
      expect(checkRateLimit(key).allowed).toBe(true)
    }
    expect(checkRateLimit(key).allowed).toBe(false)
  })
})
