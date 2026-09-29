import { cookies } from 'next/headers'
import { papersForLanguage, papers } from '@/content/exam'
import { getExamAttemptsForPaper } from '@/db/queries/exam'
import { getSessionUser } from '@/lib/auth/require-user'
import { isDemoMode } from '@/db'
import ExamPageClient, { type SavedAttempt } from './ExamPageClient'

export const dynamic = 'force-dynamic'

export default async function ExamPage() {
  // An Afrikaans learner sits the Afrikaans paper. The client supplied a
  // matched pair - P1 in Afrikaans, P2 in English - so each language has one.
  const locale = (await cookies()).get('NEXT_LOCALE')?.value === 'af' ? 'af' : 'en'
  const paper = papersForLanguage(locale)[0] ?? papers[0]

  // A 150-mark paper is not a single sitting, so a returning student sees
  // the work they have already done. Signed-out and demo visitors simply
  // start fresh rather than being bounced - the exam is the most
  // demonstrable thing in the app.
  let savedAttempts: SavedAttempt[] = []
  if (!isDemoMode) {
    const user = await getSessionUser()
    if (user) {
      const attempts = await getExamAttemptsForPaper(user.id, paper.key)
      savedAttempts = attempts.map((a) => ({
        itemId: a.itemId,
        familiarity: a.familiarity,
        marksEarned: a.marksEarned,
      }))
    }
  }

  return (
    <ExamPageClient items={paper.items} paperKey={paper.key} savedAttempts={savedAttempts} />
  )
}
