'use client'

import Link from 'next/link'
import { AlertTriangle, ArrowRight } from 'lucide-react'
import { useTranslations } from 'next-intl'
import type { Weakness } from '@/lib/weaknessDetector'

type WeaknessCardProps = {
  weakness: Weakness
}

export default function WeaknessCard({ weakness }: WeaknessCardProps) {
  const t = useTranslations('weaknessCard')
  const accuracyPercent = Math.round(weakness.accuracy * 100)
  const correctCount = Math.round(weakness.accuracy * weakness.totalAttempts)

  return (
    <div
      className="rounded-xl p-4"
      style={{
        background: 'rgba(244, 162, 97, 0.1)',
        border: '1px solid var(--gold)',
      }}
    >
      <div className="flex items-start gap-3">
        {/* Warning Icon */}
        <div
          className="p-2 rounded-lg shrink-0"
          style={{ background: 'rgba(244, 162, 97, 0.2)' }}
        >
          <AlertTriangle className="w-5 h-5" style={{ color: 'var(--gold)' }} />
        </div>

        <div className="flex-1 min-w-0">
          {/* Header */}
          <h3 className="font-semibold text-sm mb-1" style={{ color: 'var(--text)' }}>
            {t('spotted')}
          </h3>

          {/* Issue Description */}
          <p className="text-sm mb-2" style={{ color: 'var(--text)' }}>
            {t('issueDescription', { issue: weakness.specificIssue, topic: weakness.topicName })}
          </p>

          {/* Stats */}
          <p className="text-xs mb-3" style={{ color: 'var(--muted-custom)' }}>
            {t('attemptedPrefix', { attempts: weakness.totalAttempts })}{' '}
            <span
              style={{
                color: accuracyPercent < 40 ? 'var(--accent-red)' : 'var(--gold)',
                fontWeight: 600,
              }}
            >
              {accuracyPercent}%
            </span>{' '}
            {t('attemptedSuffix', { correct: correctCount, total: weakness.totalAttempts })}
          </p>

          {/* Action Button */}
          <Link
            href={`/topics/${weakness.topicSlug}/practice`}
            className="inline-flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-semibold text-white transition-all hover:opacity-90"
            style={{ background: 'var(--accent-red)' }}
          >
            {t('fixNow')}
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </div>
  )
}
