'use client'

import Link from 'next/link'
import Topbar from '@/components/layout/Topbar'
import { useUser } from '@/context/UserContext'
import { useTranslations } from 'next-intl'
import { Calculator, Atom, ChevronRight, BookOpen } from 'lucide-react'
import { getTopicsForSubjectGrade } from '@/content/registry'
import type { Grade } from '@/types'

/**
 * The topic counts used to be hardcoded (12 and 10) and each card also
 * showed an invented completion percentage - 45% for Maths, 30% for
 * Science - drawn as a filled progress bar. A student who had never
 * answered a question was shown someone else's progress as their own.
 *
 * The count is now read from the registry for the student's own grade.
 * The percentage is simply gone: this is a client component with no
 * progress data, and the honest options were to fetch it or not to claim
 * it. /subjects/[subject] already shows real per-topic progress.
 */
const subjects = [
  {
    id: 'maths',
    nameKey: 'mathematics',
    icon: Calculator,
    descriptionKey: 'mathsDescription',
    color: 'var(--accent-red)',
  },
  {
    id: 'science',
    nameKey: 'physicalScience',
    icon: Atom,
    descriptionKey: 'scienceDescription',
    color: 'var(--teal)',
  },
] as const

export default function SubjectsPage() {
  const { user } = useUser()
  const t = useTranslations('subjects')
  const tHome = useTranslations('home')

  return (
    <div>
      <Topbar
        title={t('title')}
        subtitle={user?.grade ? tHome('gradeCurriculum', { grade: user.grade }) : tHome('capsCurriculum')}
      />
      <div className="p-4 md:p-6 max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <h2 className="text-2xl font-bold mb-2" style={{ color: 'var(--text)' }}>
            {t('chooseSubject')}
          </h2>
          <p style={{ color: 'var(--muted-custom)' }}>
            {t('chooseSubjectDesc')}
          </p>
        </div>

        {/* Subject Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {subjects.map((subject) => {
            const Icon = subject.icon
            const topicCount = getTopicsForSubjectGrade(
              subject.id,
              (user?.grade ?? 11) as Grade
            ).length
            return (
              <Link
                key={subject.id}
                href={`/subjects/${subject.id}`}
                className="group block rounded-xl p-6 transition-all hover:scale-[1.02]"
                style={{
                  background: 'var(--surface)',
                  border: '1px solid var(--border-custom)',
                }}
              >
                {/* Icon and Title */}
                <div className="flex items-start justify-between mb-4">
                  <div
                    className="w-14 h-14 rounded-xl flex items-center justify-center"
                    style={{ background: `${subject.color}20` }}
                  >
                    <Icon className="w-7 h-7" style={{ color: subject.color }} />
                  </div>
                  <ChevronRight
                    className="w-5 h-5 transition-transform group-hover:translate-x-1"
                    style={{ color: 'var(--muted-custom)' }}
                  />
                </div>

                {/* Subject Info */}
                <h2 className="text-xl font-bold mb-2" style={{ color: 'var(--text)' }}>
                  {t(subject.nameKey)}
                </h2>
                <p className="text-sm mb-4" style={{ color: 'var(--muted-custom)' }}>
                  {t(subject.descriptionKey)}
                </p>

                {/* Stats */}
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-1.5">
                    <BookOpen className="w-4 h-4" style={{ color: 'var(--muted-custom)' }} />
                    <span className="text-sm" style={{ color: 'var(--muted-custom)' }}>
                      {t('topicCount', { count: topicCount })}
                    </span>
                  </div>
                </div>
              </Link>
            )
          })}
        </div>

        {/* Info Note */}
        <div
          className="mt-6 rounded-xl p-4 flex items-start gap-3"
          style={{
            background: 'var(--surface)',
            border: '1px solid var(--border-custom)',
          }}
        >
          <div
            className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
            style={{ background: 'rgba(244, 162, 97, 0.15)' }}
          >
            <BookOpen className="w-4 h-4" style={{ color: 'var(--gold)' }} />
          </div>
          <div>
            <p className="font-medium mb-1" style={{ color: 'var(--text)' }}>
              {t('capsAligned')}
            </p>
            <p className="text-sm" style={{ color: 'var(--muted-custom)' }}>
              {t('capsAlignedDesc')}
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
