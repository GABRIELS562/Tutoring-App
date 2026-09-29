/**
 * Every transcribed exam paper, and how to find them.
 *
 * A paper is only listed here once it reconciles against the total printed
 * on it - see src/content/exam/__tests__.
 */
import type { ExamItem } from './types'
import { gr11P2Exemplar2013 } from './gr11-p2-2013'
import { gr11P1Eksemplaar2013 } from './gr11-p1-2013'

export interface Paper {
  /** URL segment, e.g. 'gr11-p2-2013'. */
  key: string
  title: string
  source: string
  paper: 'P1' | 'P2'
  grade: 10 | 11 | 12
  year: number
  language: 'en' | 'af'
  /** The total printed on the paper, which the items must sum to. */
  totalMarks: number
  items: ExamItem[]
}

export const papers: Paper[] = [
  {
    key: 'gr11-p2-2013',
    title: 'Mathematics Paper 2',
    source: 'DBE Grade 11 Exemplar 2013',
    paper: 'P2',
    grade: 11,
    year: 2013,
    language: 'en',
    totalMarks: 150,
    items: gr11P2Exemplar2013,
  },
  {
    key: 'gr11-p1-2013',
    title: 'Wiskunde Vraestel 1',
    source: 'DBE Graad 11 Eksemplaar 2013',
    paper: 'P1',
    grade: 11,
    year: 2013,
    language: 'af',
    totalMarks: 150,
    items: gr11P1Eksemplaar2013,
  },
]

export function paperByKey(key: string): Paper | undefined {
  return papers.find((paper) => paper.key === key)
}

/**
 * Finds one question by its id, scoped to the paper it should belong to.
 *
 * The paperKey is checked rather than ignored (item ids are globally
 * unique, so it is not needed to find the row) because this is the lookup
 * the server action uses to recompute marks from the real mark scheme. A
 * client that sends a mismatched pair gets nothing back instead of a
 * silently-accepted attempt filed against the wrong paper.
 */
export function itemInPaper(paperKey: string, itemId: string): ExamItem | undefined {
  return paperByKey(paperKey)?.items.find((item) => item.id === itemId)
}

/** Papers a student can sit in the language they are working in. */
export function papersForLanguage(language: 'en' | 'af'): Paper[] {
  return papers.filter((paper) => paper.language === language)
}
