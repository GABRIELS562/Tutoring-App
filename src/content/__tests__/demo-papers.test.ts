import { describe, it, expect } from 'vitest'
import { demoPapers } from '@/content/demo-papers'

/**
 * Angelo sent a WCED ePortal link asking for more papers and memos. WCED
 * turned out to be a pointer: every resource there names a "Reference
 * content" URL on education.gov.za, which serves the files directly. The
 * Grade 10 and Grade 11 Common Papers (2015-2018) were harvested from
 * there and every URL below was verified 200 / application/pdf.
 *
 * Before that, Grade 10 had papers but no memos at all - a student could
 * download a paper and had no way to check their answers. These tests
 * exist to stop that state coming back.
 */

const commonPapers = demoPapers.filter((p) => p.examType === 'Common')

describe('Grade 10 and 11 Common Papers', () => {
  it('covers both grades, both subjects, both languages, 2015-2018', () => {
    expect(commonPapers).toHaveLength(64)

    for (const grade of [10, 11]) {
      for (const subject of ['maths', 'science']) {
        for (const year of [2015, 2016, 2017, 2018]) {
          for (const paperNumber of [1, 2]) {
            for (const language of ['English', 'Afrikaans']) {
              const match = commonPapers.filter(
                (p) =>
                  p.grade === grade &&
                  p.subject === subject &&
                  p.year === year &&
                  p.paperNumber === paperNumber &&
                  p.language === language
              )
              expect(
                match,
                `Grade ${grade} ${subject} ${year} P${paperNumber} ${language}`
              ).toHaveLength(1)
            }
          }
        }
      }
    }
  })

  /**
   * The point of the whole exercise. A paper without a memo is a dead end
   * for a student working alone, which is most of them.
   */
  it('gives every paper a memo', () => {
    const orphans = commonPapers.filter((p) => !p.memoUrl).map((p) => p.id)
    expect(orphans).toEqual([])
  })

  it('leaves no Grade 10 paper without a memo', () => {
    const grade10 = demoPapers.filter((p) => p.grade === 10)
    expect(grade10.length).toBeGreaterThan(0)
    expect(grade10.filter((p) => !p.memoUrl)).toEqual([])
  })

  /**
   * DBE publishes one bilingual memo per paper ("Memo Eng & Afr"), so the
   * English and Afrikaans editions deliberately share a memoUrl. That is
   * correct, not a copy-paste slip - but the *papers* must differ, which
   * is the mistake this guards.
   */
  it('gives each language its own question paper', () => {
    const byPaper = new Map<string, string[]>()
    for (const p of commonPapers) {
      const key = `${p.subject}-${p.grade}-${p.year}-p${p.paperNumber}`
      byPaper.set(key, [...(byPaper.get(key) ?? []), p.pdfUrl])
    }
    for (const [key, urls] of byPaper) {
      expect(new Set(urls).size, `${key} serves the same PDF to both languages`).toBe(urls.length)
    }
  })

  it('uses ids that are unique across the whole list', () => {
    const ids = demoPapers.map((p) => p.id)
    expect(new Set(ids).size).toBe(ids.length)
  })

  it('points every URL at education.gov.za over https', () => {
    for (const p of commonPapers) {
      expect(p.pdfUrl).toMatch(/^https:\/\/www\.education\.gov\.za\//)
      expect(p.memoUrl).toMatch(/^https:\/\/www\.education\.gov\.za\//)
    }
  })

  /**
   * Two files DBE hosts but does not correctly link from its own index:
   * the Grade 10 "2018 Maths P1 Afr" slot points at a Grade 11 2017 paper,
   * and the Grade 11 Physical Sciences P2 2017 Afr link is missing
   * entirely. Both files exist at the paths below (verified 200). If a
   * future re-harvest trusts DBE's index blindly, these break.
   */
  it('keeps the two files DBE mislinks or omits', () => {
    const g10Maths2018Af = commonPapers.find((p) => p.id === 'maths-10-2018-p1-af')
    expect(g10Maths2018Af?.pdfUrl).toContain('Mathematics%20P1%20Grade%2010%20Nov%202018%20Afr.pdf')

    const g11Sci2017Af = commonPapers.find((p) => p.id === 'science-11-2017-p2-af')
    expect(g11Sci2017Af?.pdfUrl).toContain('Physical%20Sciences%20P2%20Grade%2011%20Nov%202017%20Afr.pdf')
  })

  it('never labels a Grade 10 entry with a Grade 11 file, or vice versa', () => {
    for (const p of commonPapers) {
      expect(decodeURIComponent(p.pdfUrl), p.id).toContain(`Grade ${p.grade} Nov ${p.year}`)
    }
  })
})
