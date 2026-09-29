import { notFound } from 'next/navigation'
import { paperByKey } from '@/content/exam'
import { getExamAttemptsForPaper } from '@/db/queries/exam'
import { getSessionUser } from '@/lib/auth/require-user'
import { isDemoMode } from '@/db'
import ExamPageClient, { type SavedAttempt } from '../ExamPageClient'

export const dynamic = 'force-dynamic'

type ExamPageProps = {
  params: Promise<{ key: string }>
}

export default async function ExamPage({ params }: ExamPageProps) {
  const { key } = await params
  const paper = paperByKey(key)
  if (!paper) {
    notFound()
  }

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
