import { describe, it, expect } from 'vitest'
import {
  calibrationOf,
  xpFor,
  marksEarned,
  SCAFFOLD,
  type Familiarity,
} from '../calibration'

describe('calibration', () => {
  it('calls a confident wrong answer a blind spot', () => {
    expect(calibrationOf('confident', 0, 2)).toBe('blind-spot')
    expect(calibrationOf('confident', 1, 4)).toBe('blind-spot')
  })

  it('calls a confident right answer mastered', () => {
    expect(calibrationOf('confident', 2, 2)).toBe('mastered')
  })

  it('notices a student who underrates themselves', () => {
    expect(calibrationOf('new', 2, 2)).toBe('underconfident')
  })

  it('treats an admitted gap as honest, not a failure', () => {
    expect(calibrationOf('new', 0, 2)).toBe('honest-gap')
    expect(calibrationOf('shaky', 0, 3)).toBe('honest-gap')
  })

  it('does not call partial marks mastery', () => {
    // Telling a student who scored 1 of 2 that there is nothing more to do
    // here is exactly the wrong message - the missing mark is the point.
    expect(calibrationOf('confident', 1, 2)).toBe('slipped')
    expect(calibrationOf('confident', 2, 2)).toBe('mastered')
  })

  it('separates losing a few marks from not knowing it', () => {
    expect(calibrationOf('confident', 4, 5)).toBe('slipped')
    expect(calibrationOf('confident', 1, 5)).toBe('blind-spot')
  })
})

describe('scoring keeps honesty worth more than farming help', () => {
  it('pays most for a claim that was justified', () => {
    const claimed = xpFor(calibrationOf('confident', 2, 2), 2)
    const hedged = xpFor(calibrationOf('new', 2, 2), 2)
    expect(claimed).toBeGreaterThan(hedged)
  })

  it('pays a slip less than full mastery but more than a blind spot', () => {
    expect(xpFor('slipped', 2)).toBeLessThan(xpFor('mastered', 2))
    expect(xpFor('slipped', 2)).toBeGreaterThan(xpFor('blind-spot', 2))
  })

  it('never punishes being wrong', () => {
    for (const f of ['new', 'shaky', 'confident'] as Familiarity[]) {
      expect(xpFor(calibrationOf(f, 0, 3), 0)).toBeGreaterThan(0)
    }
  })

  it('is worth something to discover a blind spot', () => {
    expect(xpFor('blind-spot', 0)).toBeGreaterThan(0)
  })
})

describe('scaffolding follows the claim', () => {
  it('teaches first only when the student says it is new', () => {
    expect(SCAFFOLD.new).toBe('teach')
    expect(SCAFFOLD.shaky).toBe('nudge')
    expect(SCAFFOLD.confident).toBe('none')
  })
})

describe('marks are awarded per descriptor, like the memo', () => {
  const scheme = [
    { descriptor: '+30°', value: 1 },
    { descriptor: 'simplest form', value: 1 },
  ]

  it('gives the method mark even when the answer is wrong', () => {
    expect(marksEarned(scheme, ['+30°'])).toBe(1)
  })

  it('gives full marks when both are satisfied', () => {
    expect(marksEarned(scheme, ['+30°', 'simplest form'])).toBe(2)
  })

  it('gives nothing for an unrelated descriptor', () => {
    expect(marksEarned(scheme, ['value of p'])).toBe(0)
  })
})
