'use client'

import { ClipboardList, ChevronRight } from 'lucide-react'
import Link from 'next/link'

type TopicProgress = {
  topicSlug: string
  topicName: string
  completed: boolean
}

type StudyPlanBannerProps = {
  daysRemaining: number
  topics?: TopicProgress[]
}

// Angelo's expert-recommended order (highest impact first)
const RECOMMENDED_ORDER = [
  {
    slug: 'trig-gr11',
    name: 'Trigonometry',
    reason: 'highest mark weight',
    priority: 1,
  },
  {
    slug: 'euclidean-geometry',
    name: 'Euclidean Geometry',
    reason: 'most improved with practice',
    priority: 2,
  },
  {
    slug: 'analytical-geometry',
    name: 'Analytical Geometry',
    reason: 'quickest wins',
    priority: 3,
  },
  {
    slug: 'statistics',
    name: 'Statistics',
    reason: 'guaranteed marks',
    priority: 4,
  },
]

export default function StudyPlanBanner({ daysRemaining, topics = [] }: StudyPlanBannerProps) {
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
            Amazing! You&apos;ve covered all the key topics. Now focus on past papers!
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
        <h3 className="font-semibold" style={{ color: 'var(--text)' }}>
          Angelo&apos;s Study Plan
        </h3>
      </div>

      {/* Summary */}
      <p className="text-sm mb-4" style={{ color: 'var(--muted-custom)' }}>
        With <strong style={{ color: 'var(--text)' }}>{daysRemaining} days</strong> left and{' '}
        <strong style={{ color: 'var(--text)' }}>{remainingTopics.length} topics</strong> remaining,
        here&apos;s the recommended order:
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
                  {topic.name}
                </p>
                <p className="text-xs" style={{ color: 'var(--muted-custom)' }}>
                  {topic.reason}
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
          Start with {remainingTopics[0].name}
          <ChevronRight className="w-4 h-4" />
        </Link>
      )}
    </div>
  )
}
