import { describe, it, expect } from 'vitest'
import { todaySast } from '@/lib/dates'

describe('todaySast', () => {
  it('returns YYYY-MM-DD for a plain UTC morning timestamp', () => {
    // 2026-03-14T09:00:00Z -> SAST (UTC+2) 11:00 - same calendar day.
    expect(todaySast(new Date('2026-03-14T09:00:00Z'))).toBe('2026-03-14')
  })

  it('does not roll over yet for a UTC timestamp still the same SAST day', () => {
    // 2026-03-14T20:00:00Z -> SAST 22:00 on 2026-03-14 - no rollover.
    expect(todaySast(new Date('2026-03-14T20:00:00Z'))).toBe('2026-03-14')
  })

  it('rolls over to the next SAST day for a late-UTC timestamp', () => {
    // 2026-03-14T23:30:00Z -> SAST 2026-03-15T01:30 - a plain UTC day key
    // (new Date().toISOString().split('T')[0]) would still say
    // 2026-03-14, two hours after the SAST day already rolled over.
    expect(todaySast(new Date('2026-03-14T23:30:00Z'))).toBe('2026-03-15')
  })

  it('does not observe DST (SAST is a fixed UTC+2 offset year-round)', () => {
    // Same 23:30 UTC rollover behaviour in a different month.
    expect(todaySast(new Date('2026-07-01T23:30:00Z'))).toBe('2026-07-02')
  })

  it('defaults to the current date when no argument is given', () => {
    expect(todaySast()).toMatch(/^\d{4}-\d{2}-\d{2}$/)
  })
})
