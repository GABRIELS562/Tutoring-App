import { describe, it, expect } from 'vitest'
import {
  calibrationOf,
  xpFor,
  marksEarned,
  SCAFFOLD,
  CALIBRATION_COPY,
  type Familiarity,
} from '../calibration'
import en from '@/messages/en.json'
import { papers } from '@/content/exam'

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

describe('marks are awarded per mark point, like the memo', () => {
  const scheme = [
    { descriptor: '+30\u00b0', value: 1 },
    { descriptor: 'simplest form', value: 1 },
  ]

  it('gives the method mark even when the answer is wrong', () => {
    expect(marksEarned(scheme, [0])).toBe(1)
  })

  it('gives full marks when both are satisfied', () => {
    expect(marksEarned(scheme, [0, 1])).toBe(2)
  })

  it('gives nothing when nothing is ticked', () => {
    expect(marksEarned(scheme, [])).toBe(0)
  })

  // Question 1.1.1 awards 'answers' twice, once per root of (2x-1)(x+5)=0.
  // Keying on the descriptor made the two indivisible, so a student who got
  // the question right scored zero. 9 of the 105 items do this, 37 marks.
  it('awards duplicate descriptors independently', () => {
    const duplicated = [
      { descriptor: 'answers', value: 1 },
      { descriptor: 'answers', value: 1 },
    ]

    expect(marksEarned(duplicated, [0])).toBe(1)
    expect(marksEarned(duplicated, [1])).toBe(1)
    expect(marksEarned(duplicated, [0, 1])).toBe(2)
  })
})

describe('every paper is markable to full marks', () => {
  it('awards each item its printed total when all its mark points are ticked', () => {
    for (const paper of papers) {
      for (const item of paper.items) {
        const all = item.markScheme.map((_, index) => index)
        expect(
          marksEarned(item.markScheme, all),
          `${paper.key} ${item.question} does not reach its ${item.marks} marks`
        ).toBe(item.marks)
      }
    }
  })
})

describe('calibration copy resolves to real messages', () => {
  it('has an en string for every calibration key and its detail', () => {
    const exam = en.exam as Record<string, string>
    const missing = Object.values(CALIBRATION_COPY).flatMap(({ key }) =>
      [key, `${key}Detail`].filter((path) => typeof exam[path] !== 'string')
    )

    expect(missing, `calibration keys with no message: ${missing.join(', ')}`).toEqual([])
  })
})
