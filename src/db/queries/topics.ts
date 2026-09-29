import { db } from '@/db'
import { topics, pastPapers } from '@/db/schema'
import { eq, and, desc, asc, sql } from 'drizzle-orm'

export type TopicRecord = {
  id: string
  subject: string
  grade: number
  paper: number | null
  name: string
  slug: string
  term: number | null
  capsWeightPercent: number | null
  sortOrder: number | null
}

export type PastPaperRecord = {
  id: string
  grade: number
  subject: string
  year: number
  examType: string
  paperNumber: number
  language: string | null
  pdfUrl: string
  memoUrl: string | null
  topicsCovered: string[] | null
}

export type PastPaperFilters = {
  grade?: number
  subject?: string
  year?: number
  paperNumber?: number
}

export async function getTopicsBySubjectAndGrade(
  subject: string,
  grade: number
): Promise<TopicRecord[]> {
  try {
    const results = await db
      .select()
      .from(topics)
      .where(and(eq(topics.subject, subject), eq(topics.grade, grade)))
      .orderBy(asc(topics.sortOrder))

    return results as TopicRecord[]
  } catch (error) {
    console.error('Error fetching topics:', error)
    return []
  }
}

export async function getTopicBySlug(slug: string): Promise<TopicRecord | null> {
  try {
    const results = await db
      .select()
      .from(topics)
      .where(eq(topics.slug, slug))
      .limit(1)

    return results[0] as TopicRecord || null
  } catch (error) {
    console.error('Error fetching topic:', error)
    return null
  }
}

export async function getAllPastPapers(
  filters: PastPaperFilters = {}
): Promise<PastPaperRecord[]> {
  try {
    const conditions = []

    if (filters.grade) {
      conditions.push(eq(pastPapers.grade, filters.grade))
    }

    if (filters.subject) {
      conditions.push(eq(pastPapers.subject, filters.subject))
    }

    if (filters.year) {
      conditions.push(eq(pastPapers.year, filters.year))
    }

    if (filters.paperNumber) {
      conditions.push(eq(pastPapers.paperNumber, filters.paperNumber))
    }

    const query = conditions.length > 0
      ? db.select().from(pastPapers).where(and(...conditions))
      : db.select().from(pastPapers)

    const results = await query
      .orderBy(desc(pastPapers.year), asc(pastPapers.paperNumber))

    return results as PastPaperRecord[]
  } catch (error) {
    console.error('Error fetching past papers:', error)
    return []
  }
}

export type PastPaperNaturalKey = {
  subject: string
  grade: number
  year: number
  paperNumber: number
  examType: string
  language?: string | null
}

/**
 * `past_papers.language` is nullable with a default of 'english', so a row
 * seeded before the column existed and a row seeded as 'english' are the
 * same paper. Both sides of the comparison are normalised to that default
 * so they compare equal.
 */
const DEFAULT_PAPER_LANGUAGE = 'english'

/**
 * A paper is considered a duplicate of one already seeded when its
 * subject, grade, year, paper number, exam type AND language all match.
 *
 * Language used to be left out of this key, which made the English and
 * Afrikaans editions of the same paper look like the same row: seeding
 * both kept whichever came first and silently dropped the other. On a
 * bilingual app that meant an Afrikaans student was shown an English
 * paper, or no paper at all.
 *
 * There is no unique constraint on the table, so seed-papers.ts checks
 * this before inserting.
 */
export async function pastPaperExists(paper: PastPaperNaturalKey): Promise<boolean> {
  const language = paper.language ?? DEFAULT_PAPER_LANGUAGE

  const existing = await db
    .select({ id: pastPapers.id })
    .from(pastPapers)
    .where(
      and(
        eq(pastPapers.subject, paper.subject),
        eq(pastPapers.grade, paper.grade),
        eq(pastPapers.year, paper.year),
        eq(pastPapers.paperNumber, paper.paperNumber),
        eq(pastPapers.examType, paper.examType),
        sql`coalesce(${pastPapers.language}, ${DEFAULT_PAPER_LANGUAGE}) = ${language}`
      )
    )
    .limit(1)

  return existing.length > 0
}

export async function getPastPaperById(id: string): Promise<PastPaperRecord | null> {
  try {
    const results = await db
      .select()
      .from(pastPapers)
      .where(eq(pastPapers.id, id))
      .limit(1)

    return results[0] as PastPaperRecord || null
  } catch (error) {
    console.error('Error fetching past paper:', error)
    return null
  }
}
