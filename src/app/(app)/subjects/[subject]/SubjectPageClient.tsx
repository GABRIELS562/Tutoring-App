'use client'

import { useState } from 'react'
import Link from 'next/link'
import Topbar from '@/components/layout/Topbar'
import { useUser } from '@/context/UserContext'
import { useTranslations, useLocale } from 'next-intl'
import type { RegisteredTopic } from '@/content/registry'
import {
  Calculator,
  Atom,
  ChevronRight,
  CheckCircle2,
  Circle,
  Lock,
  Star,
} from 'lucide-react'

type Grade = 10 | 11 | 12

type SubjectPageClientProps = {
  subject: 'maths' | 'science'
  topicsByGrade: Record<Grade, RegisteredTopic[]>
  progressBySlug: Record<string, number>
}

const subjectInfo = {
  maths: {
    nameKey: 'mathematics',
    icon: Calculator,
    color: 'var(--accent-red-text)',
  },
  science: {
    nameKey: 'physicalScience',
    icon: Atom,
    color: 'var(--teal)',
  },
} as const

export default function SubjectPageClient({
  subject,
  topicsByGrade,
  progressBySlug,
}: SubjectPageClientProps) {
  const { user } = useUser()
  const t = useTranslations('subjects')
  const locale = useLocale()
  const tTopics = useTranslations('topics')
  const tHome = useTranslations('home')
  const [selectedGrade, setSelectedGrade] = useState<Grade>((user?.grade as Grade) || 11)

  const info = subjectInfo[subject]
  const Icon = info.icon
  const name = t(info.nameKey)
  const topics = topicsByGrade[selectedGrade] || []

  // A grade tab beyond the student's real grade is a preview - the
  // student can look, but can't practice yet. This is a real signal
  // (the student's own grade), never a fabricated status.
  const userGrade = user?.grade || 11
  const tabLocked = selectedGrade > userGrade

  return (
    <div>
      <Topbar
        title={name}
        subtitle={tHome('gradeCurriculum', { grade: selectedGrade })}
      />
      <div className="p-4 md:p-6 max-w-4xl mx-auto">
        {/* Subject Header */}
        <div className="flex items-center gap-4 mb-6">
          <div
            className="w-16 h-16 rounded-xl flex items-center justify-center"
            style={{ background: `${info.color}20` }}
          >
            <Icon className="w-8 h-8" style={{ color: info.color }} />
          </div>
          <div>
            <h2 className="text-2xl font-bold" style={{ color: 'var(--text)' }}>
              {name}
            </h2>
            <p style={{ color: 'var(--muted-custom)' }}>
              {t('topicCount', { count: topics.length })}
            </p>
          </div>
        </div>

        {/* Grade Selector */}
        <div className="flex gap-2 mb-6">
          {([10, 11, 12] as const).map((grade) => (
            <button
              key={grade}
              onClick={() => setSelectedGrade(grade)}
              aria-pressed={selectedGrade === grade}
              className="px-4 py-2 rounded-lg font-medium text-sm transition-colors"
              style={{
                background: selectedGrade === grade ? info.color : 'var(--surface)',
                // Both subject accents are light - white on them is 1.86:1
                // (teal) and 3.18:1 (the text red). Dark reads on both.
                color: selectedGrade === grade ? 'var(--bg)' : 'var(--text)',
                border: `1px solid ${selectedGrade === grade ? info.color : 'var(--border-custom)'}`,
              }}
            >
              {tTopics('grade')} {grade}
            </button>
          ))}
        </div>

        {tabLocked && (
          <p className="text-sm mb-4" style={{ color: 'var(--muted-custom)' }}>
            {t('previewingGrade', { grade: selectedGrade })}
          </p>
        )}

        {/* Topics grouped by exam paper, as the CAPS handbook sets them out -
            students revise and are examined per paper, so a flat list of ten
            topics hides the one distinction that matters most to them. */}
        <div className="space-y-6">
          {([1, 2] as const).map((paper) => {
            const paperTopics = topics.filter((topic) => topic.paper === paper)
            if (paperTopics.length === 0) return null

            return (
              <section key={paper} aria-labelledby={`paper-${paper}-heading`}>
                <h2
                  id={`paper-${paper}-heading`}
                  className="text-sm font-semibold uppercase tracking-wide mb-3"
                  style={{ color: 'var(--muted-custom)' }}
                >
                  {t('paperHeading', { number: paper })}
                </h2>
                <div className="space-y-3">
                  {paperTopics.map((topic, index) => {
            const progress = progressBySlug[topic.slug]
            const hasProgress = typeof progress === 'number'
            const isCompleted = hasProgress && progress >= 100
            const isInProgress = hasProgress && progress > 0 && progress < 100
            const isLocked = tabLocked

            const content = (
              <div className="flex items-center gap-4">
                {/* Status Icon */}
                <div
                  className="w-10 h-10 rounded-full flex items-center justify-center shrink-0"
                  style={{
                    background: isCompleted
                      ? 'rgba(42, 157, 143, 0.15)'
                      : isInProgress
                      ? `${info.color}20`
                      : 'var(--surface2)',
                  }}
                >
                  {isLocked ? (
                    <Lock className="w-5 h-5" style={{ color: 'var(--muted-custom)' }} />
                  ) : isCompleted ? (
                    <CheckCircle2 className="w-5 h-5" style={{ color: 'var(--teal)' }} />
                  ) : (
                    <Circle className="w-5 h-5" style={{ color: info.color }} />
                  )}
                </div>

                {/* Topic Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs font-medium px-2 py-0.5 rounded" style={{ background: 'var(--surface2)', color: 'var(--muted-custom)' }}>
                      {index + 1}
                    </span>
                    <h3 className="font-semibold truncate" style={{ color: 'var(--text)' }}>
                      {locale === 'af' && topic.titleAf ? topic.titleAf : topic.title}
                    </h3>
                    {isInProgress && (
                      <Star className="w-4 h-4 shrink-0" style={{ color: 'var(--gold)' }} />
                    )}
                    {isLocked && (
                      <span className="text-xs font-medium" style={{ color: 'var(--muted-custom)' }}>
                        {tTopics('locked')}
                      </span>
                    )}
                  </div>

                  {/* Progress Bar - only when real progress data exists */}
                  {!isLocked && hasProgress && (
                    <div className="mt-2">
                      <div
                        className="h-1.5 rounded-full overflow-hidden"
                        style={{ background: 'var(--surface2)' }}
                      >
                        <div
                          className="h-full rounded-full transition-all"
                          style={{
                            width: `${progress}%`,
                            background: isCompleted ? 'var(--teal)' : info.color,
                          }}
                        />
                      </div>
                    </div>
                  )}
                </div>

                {/* Arrow */}
                {!isLocked && (
                  <ChevronRight className="w-5 h-5 shrink-0" style={{ color: 'var(--muted-custom)' }} />
                )}
              </div>
            )

            if (isLocked) {
              return (
                <div
                  key={topic.slug}
                  aria-disabled="true"
                  className="block rounded-xl p-4 opacity-60 cursor-not-allowed"
                  style={{
                    background: 'var(--surface)',
                    border: '1px solid var(--border-custom)',
                  }}
                >
                  {content}
                </div>
              )
            }

            return (
              <Link
                key={topic.slug}
                href={`/topics/${topic.slug}`}
                className="block rounded-xl p-4 transition-all hover:scale-[1.01]"
                style={{
                  background: 'var(--surface)',
                  border: `1px solid ${isInProgress ? info.color : 'var(--border-custom)'}`,
                }}
              >
                {content}
              </Link>
            )
                  })}
                </div>
              </section>
            )
          })}

          {topics.length === 0 && (
            <div
              className="text-center py-12 rounded-xl"
              style={{ background: 'var(--surface)', border: '1px solid var(--border-custom)' }}
            >
              <p style={{ color: 'var(--muted-custom)' }}>
                {t('noTopicsForGrade', { grade: selectedGrade })}
              </p>
            </div>
          )}
        </div>

        {/* Back Link */}
        <div className="mt-6 pt-6" style={{ borderTop: '1px solid var(--border-custom)' }}>
          <Link
            href="/subjects"
            className="inline-block text-sm font-medium hover:underline tap-target"
            style={{ color: info.color }}
          >
            {t('backToAllSubjects')}
          </Link>
        </div>
      </div>
    </div>
  )
}
