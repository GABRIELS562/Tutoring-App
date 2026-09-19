import Link from 'next/link'
import { getTranslations } from 'next-intl/server'
import Topbar from '@/components/layout/Topbar'
import { getTopicsForSubjectGrade, type RegisteredTopic } from '@/content/registry'
import { getSessionUser } from '@/lib/auth/require-user'
import { getDashboardData } from '@/db/queries/progress'
import { isDemoMode } from '@/db'
import SubjectPageClient from './SubjectPageClient'

const GRADES = [10, 11, 12] as const

type SubjectPageProps = {
  params: Promise<{ subject: string }>
}

export default async function SubjectPage({ params }: SubjectPageProps) {
  const { subject } = await params
  const t = await getTranslations('subjects')

  if (subject !== 'maths' && subject !== 'science') {
    return (
      <div>
        <Topbar title={t('subjectNotFound')} />
        <div className="p-6">
          <p style={{ color: 'var(--muted-custom)' }}>
            {t('subjectNotFoundMessage', { subject })}
          </p>
          <Link
            href="/subjects"
            className="inline-flex items-center gap-2 mt-4 px-4 py-2 rounded-lg"
            style={{ background: 'var(--accent-red)', color: 'white' }}
          >
            {t('backToSubjects')}
          </Link>
        </div>
      </div>
    )
  }

  const topicsByGrade = Object.fromEntries(
    GRADES.map((grade) => [grade, getTopicsForSubjectGrade(subject, grade)])
  ) as Record<(typeof GRADES)[number], RegisteredTopic[]>

  // Real progress only - never fabricated. Only fetched for a real,
  // authenticated user against a configured database.
  let progressBySlug: Record<string, number> = {}
  if (!isDemoMode) {
    try {
      const user = await getSessionUser()
      if (user) {
        const dashboard = await getDashboardData(user.id)
        progressBySlug = Object.fromEntries(
          dashboard.topicsWithProgress.map((t) => [t.topicSlug, t.progressPercent])
        )
      }
    } catch (error) {
      console.error(`Failed to load progress for subject "${subject}":`, error)
    }
  }

  return (
    <SubjectPageClient
      subject={subject}
      topicsByGrade={topicsByGrade}
      progressBySlug={progressBySlug}
    />
  )
}
