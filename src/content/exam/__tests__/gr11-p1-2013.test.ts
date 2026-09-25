/**
 * The Afrikaans Vraestel 1, checked the same way as the English paper: every
 * printed total is asserted, so a mistyped question fails here rather than
 * teaching a learner the wrong mark allocation.
 */
import { describe, it, expect } from 'vitest'
import { gr11P1Eksemplaar2013 as items } from '../gr11-p1-2013'
import { totalMarks } from '../types'

/** Totals printed in square brackets on the vraestel itself. */
const PRINTED: Record<string, number> = {
  '1': 15, '2': 19, '3': 13, '4': 10, '5': 8, '6': 17,
  '7': 6, '8': 19, '9': 20, '10': 4, '11': 5, '12': 14,
}

describe('Graad 11 Vraestel 1 reconciles against the printed paper', () => {
  it.each(Object.entries(PRINTED))('vraag %s totals %i punte', (root, printed) => {
    const marks = items
      .filter((item) => item.question.split('.')[0] === root)
      .reduce((sum, item) => sum + item.marks, 0)

    expect(marks).toBe(printed)
  })

  it('totals 150 marks, the full paper', () => {
    expect(totalMarks(items)).toBe(150)
  })
})

describe('the paper stays in Afrikaans', () => {
  it('is marked as an Afrikaans paper throughout', () => {
    for (const item of items) expect(item.language).toBe('af')
  })

  it('keeps the memorandum in Afrikaans, not translated', () => {
    // "vervanging" is the examiner's word. Translating the descriptors would
    // mean marking an Afrikaans learner against an English mark scheme.
    const descriptors = items.flatMap((item) => item.markScheme.map((m) => m.descriptor))
    expect(descriptors).toContain('vervanging')
    expect(descriptors).toContain('antwoord')
    expect(descriptors).toContain('faktore')
    expect(descriptors).not.toContain('substitution')
  })

  it('numbers the last sub-part of vraag 9 as the paper does, not as the memo does', () => {
    // The printed vraestel skips 9.6 and labels it 9.7; the memo says 9.6.
    // The question paper is what the learner is reading.
    const nines = items.filter((item) => item.question.startsWith('9.')).map((i) => i.question)
    expect(nines).toContain('9.7')
    expect(nines).not.toContain('9.6')
  })
})

describe('every item can be marked', () => {
  it('has a mark scheme summing to its own marks', () => {
    for (const item of items) {
      const scheme = item.markScheme.reduce((sum, point) => sum + point.value, 0)
      expect({ q: item.question, scheme }).toEqual({ q: item.question, scheme: item.marks })
    }
  })

  it('has a unique id per item', () => {
    const ids = items.map((item) => item.id)
    expect(new Set(ids).size).toBe(ids.length)
  })
})
