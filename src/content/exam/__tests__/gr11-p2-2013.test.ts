/**
 * The paper is transcribed by hand from the rendered PDF pages, because the
 * PDF text layer scrambles every equation. These tests are how that
 * transcription is trusted: every printed total is checked, so a question
 * that was mistyped or half-entered fails here rather than teaching a
 * student the wrong mark allocation.
 */
import { describe, it, expect } from 'vitest'
import { gr11P2Exemplar2013 as items } from '../gr11-p2-2013'
import { totalMarks, methodMarks } from '../types'
import { readFileSync } from 'node:fs'

/** Totals printed in square brackets on the paper itself. */
const PRINTED: Record<string, number> = {
  '1': 14, '2': 9, '3': 14, '4': 15, '5': 26, '6': 9,
  '7': 17, '8': 6, '9': 7, '10': 18, '11': 15,
}

const rootOf = (question: string) => question.split('.')[0].replace(/\(.*/, '')

describe('Grade 11 P2 exemplar reconciles against the printed paper', () => {
  it.each(Object.entries(PRINTED))('question %s totals %i marks', (root, printed) => {
    const marks = items
      .filter((item) => rootOf(item.question) === root)
      .reduce((sum, item) => sum + item.marks, 0)

    expect(marks).toBe(printed)
  })

  it('totals 150 marks, the full paper', () => {
    expect(totalMarks(items)).toBe(150)
  })

  it('gives every question at least one sub-part', () => {
    for (const root of Object.keys(PRINTED)) {
      expect(items.some((item) => rootOf(item.question) === root)).toBe(true)
    }
  })
})

describe('every item can actually be marked', () => {
  it('has a mark scheme summing to its own marks', () => {
    for (const item of items) {
      const scheme = item.markScheme.reduce((sum, point) => sum + point.value, 0)
      expect({ q: item.question, scheme }).toEqual({ q: item.question, scheme: item.marks })
    }
  })

  it('names every mark, since the descriptor is what the student ticks', () => {
    for (const item of items) {
      for (const point of item.markScheme) {
        expect(point.descriptor.trim().length).toBeGreaterThan(0)
      }
    }
  })

  it('shows a worked solution for every item', () => {
    for (const item of items) {
      expect(item.solution.length).toBeGreaterThan(0)
    }
  })

  it('has a unique id per item', () => {
    const ids = items.map((item) => item.id)
    expect(new Set(ids).size).toBe(ids.length)
  })

  it('points every item at a CAPS topic, so a lost mark finds its video', () => {
    for (const item of items) {
      expect(item.topicSlug).toMatch(/-gr1[012]$/)
    }
  })
})

describe('method marks are carried, since that is the point of the feature', () => {
  it('finds method marks across the paper', () => {
    // Exam technique moves a matric mark more than knowledge does, and these
    // are the marks a student throws away by writing nothing down.
    expect(items.reduce((sum, item) => sum + methodMarks(item), 0)).toBeGreaterThan(50)
  })

  it('marks the sine rule proof as entirely method', () => {
    const proof = items.find((item) => item.question === '7.1')!
    expect(methodMarks(proof)).toBe(proof.marks)
  })
})

/**
 * Mark descriptors are the memo's own words, and the memo writes maths:
 * "$\frac{408}{19}$". Anywhere a descriptor is displayed it has to go
 * through MathRenderer - the result summary printed the raw source, so a
 * student who had just scored full marks saw "✓ $\frac{408}{19}$".
 */
describe('mark descriptors that contain maths', () => {
  it('has descriptors carrying LaTeX, so every render site must handle it', () => {
    const withMaths = items.flatMap((item) =>
      item.markScheme.filter((point) => point.descriptor.includes('$'))
    )

    expect(withMaths.length).toBeGreaterThan(0)
  })

  it('renders every descriptor through MathRenderer in ExamItemCard', () => {
    const source = readFileSync('src/components/exam/ExamItemCard.tsx', 'utf8')

    // A bare {p.descriptor} / {point.descriptor} in JSX prints the source.
    const bare = [...source.matchAll(/^\s*\{(?:p|point)\.descriptor\}\s*$/gm)]

    expect(
      bare.map((m) => m[0].trim()),
      'a descriptor is rendered without MathRenderer, so its LaTeX will show raw'
    ).toEqual([])
  })
})
