import { cookies } from 'next/headers'
import Link from 'next/link'
import { getTranslations } from 'next-intl/server'
import { ArrowRight } from 'lucide-react'
import Topbar from '@/components/layout/Topbar'
import { papersForLanguage, papers as allPapers } from '@/content/exam'
import { getExamSummary } from '@/db/queries/exam'
import { getSessionUser } from '@/lib/auth/require-user'
import { isDemoMode } from '@/db'

export const dynamic = 'force-dynamic'

/**
 * Chooses a paper.
 *
 * This page used to BE a paper - it rendered papersForLanguage(locale)[0]
 * directly. That was fine while each language had exactly one transcribed
 * paper, but both languages now have P1 and P2, and a hard-coded [0] would
 * have made the second one unreachable.
 */
export default async function ExamIndexPage() {
  const t = await getTranslations('exam')
  const locale = (await cookies()).get('NEXT_LOCALE')?.value === 'af' ? 'af' : 'en'

  // If nothing is transcribed in the student's language, show what exists
  // rather than an empty page.
  const forLocale = papersForLanguage(locale)
  const papers = forLocale.length > 0 ? forLocale : allPapers

  // Progress per paper, so a student can tell at a glance which one they
  // are part-way through. Signed-out and demo visitors just see the list.
  let progress = new Map<string, { attempted: number; marks: number }>()
  if (!isDemoMode) {
    const user = await getSessionUser()
    if (user) {
      const summary = await getExamSummary(user.id)
      progress = new Map(
        summary.map((s) => [s.paperKey, { attempted: s.itemsAttempted, marks: s.marksEarned }])
      )
    }
  }

  return (
    <div className="min-h-screen" style={{ background: 'var(--bg)' }}>
      <Topbar title={t('title')} subtitle={t('chooseSubtitle')} />

      <div className="max-w-3xl mx-auto px-4 py-6">
        <div
          className="rounded-xl p-4 mb-6"
          style={{ background: 'var(--surface)', border: '1px solid var(--border-custom)' }}
        >
          <p className="text-sm" style={{ color: 'var(--text)' }}>
            {t('realQuestions')}
          </p>
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
          {papers.map((paper) => {
            const done = progress.get(paper.key)
            return (
              <Link
                key={paper.key}
                href={`/exam/${paper.key}`}
                className="rounded-xl p-4 flex flex-col gap-2 transition-all hover:scale-[1.01]"
                style={{ background: 'var(--surface)', border: '1px solid var(--border-custom)' }}
              >
                <span className="flex items-center justify-between gap-3">
                  <span className="font-semibold text-base" style={{ color: 'var(--text)' }}>
                    {paper.title}
                  </span>
                  <ArrowRight className="w-4 h-4 shrink-0" style={{ color: 'var(--accent-red-text)' }} />
                </span>
                <span className="text-xs" style={{ color: 'var(--muted-custom)' }}>
                  {paper.source}
                </span>
                <span className="text-xs" style={{ color: 'var(--muted-custom)' }}>
                  {t('paperMeta', { questions: paper.items.length, marks: paper.totalMarks })}
                </span>
                {done && done.attempted > 0 && (
                  <span className="text-xs font-semibold" style={{ color: 'var(--teal)' }}>
                    {t('paperProgress', {
                      done: done.attempted,
                      total: paper.items.length,
                      earned: done.marks,
                      available: paper.totalMarks,
                    })}
                  </span>
                )}
              </Link>
            )
          })}
        </div>
      </div>
    </div>
  )
}
