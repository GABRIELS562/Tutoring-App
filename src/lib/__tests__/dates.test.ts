import { describe, it, expect } from 'vitest'
import { todaySast, yesterdaySast } from '../dates'

describe('todaySast', () => {
  it('rolls over to the next SAST day at 23:30 UTC (01:30 SAST)', () => {
    // Arrange - SAST is UTC+2, so 23:30 UTC on the 19th is 01:30 SAST on the 20th
    const instant = new Date('2026-09-19T23:30:00.000Z')

    // Act
    const result = todaySast(instant)

    // Assert
    expect(result).toBe('2026-09-20')
  })

  it('stays on the same SAST day at 22:00 SAST (20:00 UTC)', () => {
    // Arrange - 20:00 UTC on the 19th is 22:00 SAST, still the 19th
    const instant = new Date('2026-09-19T20:00:00.000Z')

    // Act
    const result = todaySast(instant)

    // Assert
    expect(result).toBe('2026-09-19')
  })

  it('defaults to the system clock when no instant is given', () => {
    expect(todaySast()).toMatch(/^\d{4}-\d{2}-\d{2}$/)
  })
})

describe('yesterdaySast', () => {
  it('returns the SAST calendar date one day before the given instant', () => {
    // Arrange
    const instant = new Date('2026-09-19T20:00:00.000Z') // 22:00 SAST on the 19th

    // Act
    const result = yesterdaySast(instant)

    // Assert
    expect(result).toBe('2026-09-18')
  })

  it('is consistent across the 23:30 UTC rollover boundary', () => {
    // Arrange - 01:30 SAST on the 20th; yesterday should be the 19th
    const instant = new Date('2026-09-19T23:30:00.000Z')

    // Act
    const result = yesterdaySast(instant)

    // Assert
    expect(result).toBe('2026-09-19')
  })
})
