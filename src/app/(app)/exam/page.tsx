import { cookies } from 'next/headers'
import { papersForLanguage, papers } from '@/content/exam'
import ExamPageClient from './ExamPageClient'

export const dynamic = 'force-dynamic'

export default async function ExamPage() {
  // An Afrikaans learner sits the Afrikaans paper. The client supplied a
  // matched pair - P1 in Afrikaans, P2 in English - so each language has one.
  const locale = (await cookies()).get('NEXT_LOCALE')?.value === 'af' ? 'af' : 'en'
  const paper = papersForLanguage(locale)[0] ?? papers[0]

  return <ExamPageClient items={paper.items} />
}
