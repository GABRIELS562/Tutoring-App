'use client'

import { ClipboardList, ChevronRight } from 'lucide-react'
import Link from 'next/link'
import { useTranslations } from 'next-intl'

type TopicProgress = {
  topicSlug: string
  topicName: string
  completed: boolean
}

type StudyPlanBannerProps = {
  daysRemaining: number
  topics?: TopicProgress[]
}

// Angelo's expert-recommended order (highest impact first). nameKey/reasonKey
// resolve against the "studyPlan" message namespace at render time.
const RECOMMENDED_ORDER = [
  {
    slug: 'trig-gr11',
    nameKey: 'topicTrig',
    reasonKey: 'reasonTrig',
    priority: 1,
  },
  {
    slug: 'euclidean-geometry',
    nameKey: 'topicEuclidean',
    reasonKey: 'reasonEuclidean',
    priority: 2,
  },
  {
    slug: 'analytical-geometry',
    nameKey: 'topicAnalytical',
    reasonKey: 'reasonAnalytical',
    priority: 3,
  },
  {
    slug: 'statistics',
    nameKey: 'topicStatistics',
    reasonKey: 'reasonStatistics',
    priority: 4,
  },
] as const

export default function StudyPlanBanner({ daysRemaining, topics = [] }: StudyPlanBannerProps) {
  const t = useTranslations('studyPlan')
  // Filter out completed topics
  const completedSlugs = new Set(topics.filter(t => t.completed).map(t => t.topicSlug))
  const remainingTopics = RECOMMENDED_ORDER.filter(t => !completedSlugs.has(t.slug))

  if (remainingTopics.length === 0) {
    return (
      <div
        className="rounded-xl p-4"
        style={{
          background: 'rgba(42, 157, 143, 0.1)',
          border: '1px solid var(--teal)',
        }}
      >
        <div className="flex items-center gap-3">
          <ClipboardList className="w-5 h-5" style={{ color: 'var(--teal)' }} />
          <p className="text-sm font-medium" style={{ color: 'var(--text)' }}>
            {t('allTopicsCovered')}
          </p>
        </div>
      </div>
    )
  }

  return (
    <div
      className="rounded-xl p-5"
      style={{
        background: 'var(--surface)',
        border: '1px solid var(--border-custom)',
      }}
    >
      {/* Header */}
      <div className="flex items-center gap-2 mb-3">
        <ClipboardList className="w-5 h-5" style={{ color: 'var(--accent-red)' }} />
        <h2 className="font-semibold" style={{ color: 'var(--text)' }}>
          {t('title')}
        </h2>
      </div>

      {/* Summary */}
      <p className="text-sm mb-4" style={{ color: 'var(--muted-custom)' }}>
        {t('summary', { days: daysRemaining, topicCount: remainingTopics.length })}
      </p>

      {/* Topic List */}
      <div className="space-y-2">
        {remainingTopics.slice(0, 3).map((topic, index) => (
          <Link
            key={topic.slug}
            href={`/topics/${topic.slug}`}
            className="flex items-center justify-between p-3 rounded-lg transition-all hover:scale-[1.01]"
            style={{
              background: 'var(--surface2)',
              border: index === 0 ? '1px solid var(--accent-red)' : '1px solid transparent',
            }}
          >
            <div className="flex items-center gap-3">
              {/* Priority Number */}
              <span
                className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold"
                style={{
                  background: index === 0 ? 'var(--accent-red)' : 'var(--surface)',
                  color: index === 0 ? 'white' : 'var(--muted-custom)',
                }}
              >
                {index + 1}
              </span>

              <div>
                <p className="text-sm font-medium" style={{ color: 'var(--text)' }}>
                  {t(topic.nameKey)}
                </p>
                <p className="text-xs" style={{ color: 'var(--muted-custom)' }}>
                  {t(topic.reasonKey)}
                </p>
              </div>
            </div>

            <ChevronRight className="w-4 h-4" style={{ color: 'var(--muted-custom)' }} />
          </Link>
        ))}
      </div>

      {/* Start Button for First Topic */}
      {remainingTopics.length > 0 && (
        <Link
          href={`/topics/${remainingTopics[0].slug}/practice`}
          className="mt-4 w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg font-semibold text-white text-sm transition-all hover:opacity-90"
          style={{ background: 'var(--accent-red)' }}
        >
          {t('startWith', { topicName: t(remainingTopics[0].nameKey) })}
          <ChevronRight className="w-4 h-4" />
        </Link>
      )}
    </div>
  )
}
