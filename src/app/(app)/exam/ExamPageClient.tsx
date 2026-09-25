'use client'

import { useState } from 'react'
import Topbar from '@/components/layout/Topbar'
import ExamItemCard from '@/components/exam/ExamItemCard'
import type { ExamItem } from '@/content/exam/types'
import { totalMarks } from '@/content/exam/types'

export default function ExamPageClient({ items }: { items: ExamItem[] }) {
  const [scores, setScores] = useState<Record<string, number>>({})

  const available = totalMarks(items)
  const earned = Object.values(scores).reduce((a, b) => a + b, 0)
  const done = Object.keys(scores).length

  return (
    <div className="min-h-screen" style={{ background: 'var(--bg)' }}>
      <Topbar title="Exam practice" subtitle={`${items[0]?.source} · Question 6`} />

      <div className="max-w-3xl mx-auto px-4 py-6">
        <div
          className="rounded-xl p-4 mb-6"
          style={{ background: 'var(--surface)', border: '1px solid var(--border-custom)' }}
        >
          <p className="text-sm" style={{ color: 'var(--text)' }}>
            These are real NSC questions, marked the way the examiner marks them.
          </p>
          <p className="text-xs mt-1" style={{ color: 'var(--muted-custom)' }}>
            {done} of {items.length} attempted · {earned} of {available} marks
            {done === items.length && available > 0 && (
              <strong style={{ color: 'var(--accent-red)' }}>
                {' '}
                — {Math.round((earned / available) * 100)}%
              </strong>
            )}
          </p>
        </div>

        {items.map((item) => (
          <ExamItemCard
            key={item.id}
            item={item}
            onDone={(marks) => setScores((s) => ({ ...s, [item.id]: marks }))}
          />
        ))}
      </div>
    </div>
  )
}
