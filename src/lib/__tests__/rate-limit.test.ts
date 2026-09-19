import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { checkRateLimit, getClientIp, _debugBucketCount } from '@/lib/rate-limit'

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

  it('caps total tracked buckets so a flood of distinct keys cannot grow the store forever', () => {
    const prefix = `cap-flood-${Math.random()}-`
    const baseline = _debugBucketCount()

    // Comfortably exceed the internal cap (1000) with distinct, still-live
    // keys - nothing here expires, so only the hard cap can bound this.
    for (let i = 0; i < 1050; i++) {
      checkRateLimit(`${prefix}${i}`, { max: 5, windowMs: 10 * 60 * 1000 })
    }

    expect(_debugBucketCount()).toBeLessThanOrEqual(1000)
    // And it actually grew close to the cap, rather than e.g. silently
    // refusing to track anything past baseline.
    expect(_debugBucketCount()).toBeGreaterThan(baseline)
  })

  it('sweeps expired buckets once the map is at capacity, not just a single oldest one', () => {
    const prefix = `sweep-${Math.random()}-`

    // Fill up to the cap with entries that expire almost immediately.
    for (let i = 0; i < 1000; i++) {
      checkRateLimit(`${prefix}${i}`, { max: 1, windowMs: 1 })
    }
    vi.advanceTimersByTime(2) // now every one of those 1000 is expired

    // One more distinct key pushes the map to/over the cap and triggers a
    // prune - which should clear out the (now expired) entries in bulk,
    // not just evict a single oldest one.
    checkRateLimit(`${prefix}trigger`, { max: 1, windowMs: 60_000 })

    expect(_debugBucketCount()).toBeLessThan(50)
  })
})

describe('getClientIp', () => {
  it('takes the first entry of x-forwarded-for', () => {
    const headers = { get: (name: string) => (name === 'x-forwarded-for' ? '203.0.113.5, 10.0.0.1' : null) }
    expect(getClientIp(headers)).toBe('203.0.113.5')
  })

  it('falls back to "unknown" when x-forwarded-for is absent', () => {
    const headers = { get: () => null }
    expect(getClientIp(headers)).toBe('unknown')
  })

  it('accepts a standard Headers instance (NextRequest.headers)', () => {
    const headers = new Headers({ 'x-forwarded-for': '198.51.100.7' })
    expect(getClientIp(headers)).toBe('198.51.100.7')
  })

  it('accepts a next/headers ReadonlyHeaders-shaped object (Server Components)', () => {
    // Only relies on .get() - the same minimal shape next/headers's
    // headers() result satisfies, so this stands in without importing
    // next/headers (which requires the Next.js request-scope context).
    const headers = { get: (name: string) => (name === 'x-forwarded-for' ? '192.0.2.1' : null) }
    expect(getClientIp(headers)).toBe('192.0.2.1')
  })
})
