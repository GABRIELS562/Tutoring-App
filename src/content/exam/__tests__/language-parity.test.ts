import { describe, it, expect } from 'vitest'
import { papers, type Paper } from '../index'

/**
 * Each paper exists in two languages, and the two editions are generated
 * from ONE set of items. That is the only reason the mark scheme can be
 * trusted across languages: a translation done by hand would let the
 * marks, the order of the mark points, or the kind of a mark drift, and
 * an Afrikaans student would be marked against a different memo from the
 * English student sitting the same paper.
 *
 * Only the prose may differ. Everything a mark depends on must not.
 */

function pairs(): [Paper, Paper][] {
  const byPaper = new Map<string, Paper[]>()
  for (const paper of papers) {
    const key = `${paper.grade}-${paper.paper}-${paper.year}`
    byPaper.set(key, [...(byPaper.get(key) ?? []), paper])
  }
  return [...byPaper.values()]
    .filter((group) => group.length === 2)
    .map((group) => [
      group.find((p) => p.language === 'en')!,
      group.find((p) => p.language === 'af')!,
    ])
}

describe('every paper is available in both languages', () => {
  it('offers the same papers to English and Afrikaans students', () => {
    const shape = (language: 'en' | 'af') =>
      papers
        .filter((p) => p.language === language)
        .map((p) => `${p.grade}-${p.paper}-${p.year}`)
        .sort()

    expect(shape('en')).toEqual(shape('af'))
    expect(shape('en').length).toBeGreaterThan(0)
  })

  it('finds a matched pair for every paper', () => {
    expect(pairs()).toHaveLength(papers.length / 2)
  })

  it('gives every paper a unique key', () => {
    const keys = papers.map((p) => p.key)
    expect(new Set(keys).size).toBe(keys.length)
  })

  /**
   * Item ids are the primary key of exam_attempts. A collision between
   * two papers would file one student's answer against another paper's
   * question.
   */
  it('gives every question a unique id across all papers', () => {
    const ids = papers.flatMap((p) => p.items.map((i) => i.id))
    expect(new Set(ids).size).toBe(ids.length)
  })

  it('reconciles every paper against the total printed on it', () => {
    for (const paper of papers) {
      const sum = paper.items.reduce((total, item) => total + item.marks, 0)
      expect(sum, paper.key).toBe(paper.totalMarks)
    }
  })
})

describe.each(pairs())('$0.key and $1.key mark identically', (en, af) => {
  it('asks the same number of questions', () => {
    expect(af.items).toHaveLength(en.items.length)
  })

  it('uses the same question numbers in the same order', () => {
    expect(af.items.map((i) => i.question)).toEqual(en.items.map((i) => i.question))
  })

  it('awards the same marks for each question', () => {
    expect(af.items.map((i) => i.marks)).toEqual(en.items.map((i) => i.marks))
  })

  it('tags each question with the same CAPS sub-topic', () => {
    expect(af.items.map((i) => i.topicSlug)).toEqual(en.items.map((i) => i.topicSlug))
  })

  /**
   * Mark points are identified by POSITION when an attempt is scored
   * (see marksEarned in lib/exam/calibration.ts), so position n must be
   * worth the same and be the same kind of mark in both editions.
   */
  it('keeps every mark point at the same position, kind and value', () => {
    for (const [index, enItem] of en.items.entries()) {
      const afItem = af.items[index]
      expect(afItem.markScheme.map((p) => p.kind), enItem.id).toEqual(
        enItem.markScheme.map((p) => p.kind)
      )
      expect(afItem.markScheme.map((p) => p.value), enItem.id).toEqual(
        enItem.markScheme.map((p) => p.value)
      )
    }
  })

  it('shows the same diagrams on the same questions', () => {
    expect(af.items.map((i) => i.diagram)).toEqual(en.items.map((i) => i.diagram))
  })

  it('agrees on which questions need a sketch', () => {
    expect(af.items.map((i) => !!i.requiresDrawing)).toEqual(
      en.items.map((i) => !!i.requiresDrawing)
    )
  })

  it('gives the same number of worked solution steps', () => {
    expect(af.items.map((i) => i.solution.length)).toEqual(
      en.items.map((i) => i.solution.length)
    )
  })

  it('carries a common error on the same questions', () => {
    expect(af.items.map((i) => !!i.commonError)).toEqual(
      en.items.map((i) => !!i.commonError)
    )
  })

  it('labels each edition with its own language', () => {
    expect(en.items.every((i) => i.language === 'en')).toBe(true)
    expect(af.items.every((i) => i.language === 'af')).toBe(true)
  })
})

/**
 * LaTeX is written in single-quoted TS strings, where a lone backslash
 * before t, n, b, f, r or v is an ESCAPE, not a backslash. `'$\theta$'`
 * silently becomes `$<tab>heta$` and renders as garbage - which is
 * exactly what had happened to question 3.3 of P2.
 */
describe('no LaTeX command has been eaten by a string escape', () => {
  it('contains no control characters in any displayed text', () => {
    const offenders: string[] = []
    for (const paper of papers) {
      for (const item of paper.items) {
        const fields: [string, string | undefined][] = [
          ['prompt', item.prompt],
          ['context', item.context],
          ['commonError', item.commonError],
          ...item.solution.map((s, n) => [`solution[${n}]`, s] as [string, string]),
          ...item.markScheme.map(
            (m, n) => [`markScheme[${n}]`, m.descriptor] as [string, string]
          ),
        ]
        for (const [field, value] of fields) {
          // Newlines are legitimate - several stems are data tables.
          if (value && /[\t\v\f\b\r]/.test(value)) {
            offenders.push(`${item.id} ${field}`)
          }
        }
      }
    }
    expect(offenders).toEqual([])
  })
})
