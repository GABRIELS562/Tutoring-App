'use client'

import { Calendar, Clock } from 'lucide-react'

// NSC 2026 Exam Dates (Official)
const EXAM_DATES = {
  'maths-paper1': new Date('2026-10-28'),
  'maths-paper2': new Date('2026-10-30'),
  'science-paper1': new Date('2026-11-04'),
  'science-paper2': new Date('2026-11-06'),
}

type ExamCountdownProps = {
  subject?: 'maths' | 'science'
}

export default function ExamCountdown({ subject = 'maths' }: ExamCountdownProps) {
  const now = new Date()

  // Focus on Paper 2 (highest failure rate)
  const targetDate = subject === 'maths' ? EXAM_DATES['maths-paper2'] : EXAM_DATES['science-paper2']
  const examName = subject === 'maths' ? 'Mathematics Paper 2' : 'Physical Science Paper 2'

  // Calculate days remaining
  const diffTime = targetDate.getTime() - now.getTime()
  const daysRemaining = Math.ceil(diffTime / (1000 * 60 * 60 * 24))

  // Calculate year progress (from Jan 1 to exam date)
  const startOfYear = new Date(now.getFullYear(), 0, 1)
  const totalDays = Math.ceil((targetDate.getTime() - startOfYear.getTime()) / (1000 * 60 * 60 * 24))
  const daysPassed = Math.ceil((now.getTime() - startOfYear.getTime()) / (1000 * 60 * 60 * 24))
  const progressPercent = Math.min(Math.max((daysPassed / totalDays) * 100, 0), 100)

  // Determine urgency level
  const isUrgent = daysRemaining <= 30
  const isWarning = daysRemaining <= 60 && daysRemaining > 30

  return (
    <div
      className="rounded-xl p-5"
      style={{
        background: 'var(--surface)',
        border: `1px solid ${isUrgent ? 'var(--accent-red)' : isWarning ? 'var(--gold)' : 'var(--border-custom)'}`,
      }}
    >
      {/* Header */}
      <div className="flex items-center gap-3 mb-4">
        <div
          className="p-2 rounded-lg"
          style={{
            background: isUrgent
              ? 'rgba(230, 57, 70, 0.15)'
              : isWarning
              ? 'rgba(244, 162, 97, 0.15)'
              : 'rgba(42, 157, 143, 0.15)',
          }}
        >
          <Calendar
            className="w-5 h-5"
            style={{
              color: isUrgent ? 'var(--accent-red)' : isWarning ? 'var(--gold)' : 'var(--teal)',
            }}
          />
        </div>
        <div>
          <h3 className="font-semibold" style={{ color: 'var(--text)' }}>
            Exam Countdown
          </h3>
          <p className="text-xs" style={{ color: 'var(--muted-custom)' }}>
            {examName}
          </p>
        </div>
      </div>

      {/* Days Counter */}
      <div className="mb-4">
        <div className="flex items-baseline gap-2">
          <span
            className="text-4xl font-bold"
            style={{
              color: isUrgent ? 'var(--accent-red)' : isWarning ? 'var(--gold)' : 'var(--teal)',
            }}
          >
            {daysRemaining}
          </span>
          <span className="text-lg" style={{ color: 'var(--text)' }}>
            days
          </span>
        </div>
        <p className="text-sm" style={{ color: 'var(--muted-custom)' }}>
          until {examName}
        </p>
      </div>

      {/* Progress Bar */}
      <div className="mb-4">
        <div className="flex items-center justify-between text-xs mb-1.5">
          <span style={{ color: 'var(--muted-custom)' }}>Year progress</span>
          <span style={{ color: 'var(--muted-custom)' }}>{Math.round(progressPercent)}%</span>
        </div>
        <div
          className="h-2 rounded-full overflow-hidden"
          style={{ background: 'var(--surface2)' }}
        >
          <div
            className="h-full rounded-full transition-all"
            style={{
              width: `${progressPercent}%`,
              background: isUrgent
                ? 'var(--accent-red)'
                : isWarning
                ? 'var(--gold)'
                : 'var(--teal)',
            }}
          />
        </div>
      </div>

      {/* Angelo's Recommendation */}
      <div
        className="flex items-start gap-2 p-3 rounded-lg"
        style={{ background: 'var(--surface2)' }}
      >
        <Clock className="w-4 h-4 shrink-0 mt-0.5" style={{ color: 'var(--accent-red)' }} />
        <p className="text-xs leading-relaxed" style={{ color: 'var(--text)' }}>
          <strong style={{ color: 'var(--accent-red)' }}>Angelo&apos;s advice:</strong>{' '}
          {isUrgent
            ? 'Final stretch! Focus on past papers and your weakest topics.'
            : isWarning
            ? 'Time to intensify. Practice every day and track your progress.'
            : 'Good time to master the fundamentals. Focus on Paper 2 topics now.'}
        </p>
      </div>
    </div>
  )
}
