import { cookies } from 'next/headers'
import { getAllPastPapers, type PastPaperRecord } from '@/db/queries/topics'
import { isDemoMode } from '@/db'
import { demoPapers } from '@/content/demo-papers'
import { papersForLanguage, papers as examPapers } from '@/content/exam'
import PapersPageClient from './PapersPageClient'

export default async function PapersPage() {
  let papers: PastPaperRecord[] = demoPapers

  if (!isDemoMode) {
    try {
      papers = await getAllPastPapers()
    } catch (error) {
      console.error('Failed to load past papers:', error)
      papers = []
    }
  }

  // Which papers are playable, in the language the student is reading in.
  // An Afrikaans student is offered the Afrikaans paper; if their language
  // has none transcribed yet they still see what exists rather than nothing.
  const locale = (await cookies()).get('NEXT_LOCALE')?.value === 'af' ? 'af' : 'en'
  const forLocale = papersForLanguage(locale)
  const playable = (forLocale.length > 0 ? forLocale : examPapers).map((paper) => ({
    key: paper.key,
    title: paper.title,
    source: paper.source,
    questionCount: paper.items.length,
    totalMarks: paper.totalMarks,
  }))

  return <PapersPageClient papers={papers} playable={playable} />
}
