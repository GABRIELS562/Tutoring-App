'use client'

import { useState } from 'react'
import Image from 'next/image'
import Topbar from '@/components/layout/Topbar'
import MathRenderer from '@/components/math/MathRenderer'
import ExamItemCard from '@/components/exam/ExamItemCard'
import type { ExamItem } from '@/content/exam/types'
import { totalMarks } from '@/content/exam/types'

/** '6.4.1' -> '6'. Sub-parts of one question share a stem and a diagram. */
function questionRoot(question: string): string {
  return question.split('.')[0]
}

interface Group {
  root: string
  context?: string
  diagram?: string
  items: ExamItem[]
}

function groupByQuestion(items: ExamItem[]): Group[] {
  const groups: Group[] = []
  for (const item of items) {
    const root = questionRoot(item.question)
    let group = groups.find((g) => g.root === root)
    if (!group) {
      group = { root, items: [] }
      groups.push(group)
    }
    // The first sub-part carrying each is taken to own it for the group.
    group.context ??= item.context
    group.diagram ??= item.diagram
    group.items.push(item)
  }
  return groups
}

export default function ExamPageClient({ items }: { items: ExamItem[] }) {
  const [scores, setScores] = useState<Record<string, number>>({})

  const available = totalMarks(items)
  const earned = Object.values(scores).reduce((a, b) => a + b, 0)
  const done = Object.keys(scores).length
  const groups = groupByQuestion(items)

  return (
    <div className="min-h-screen" style={{ background: 'var(--bg)' }}>
      <Topbar title="Exam practice" subtitle={items[0]?.source} />

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

        {groups.map((group) => (
          <section key={group.root} className="mb-8">
            <h2 className="text-lg font-bold mb-2" style={{ color: 'var(--text)' }}>
              Question {group.root}
            </h2>

            {(group.context || group.diagram) && (
              <div
                className="rounded-xl p-4 mb-3"
                style={{ background: 'var(--surface)', border: '1px solid var(--border-custom)' }}
              >
                {group.context && (
                  <div className="text-sm" style={{ color: 'var(--text)', opacity: 0.9 }}>
                    <MathRenderer content={group.context} />
                  </div>
                )}
                {group.diagram && (
                  <div className="mt-3 rounded-lg overflow-hidden" style={{ background: '#fff' }}>
                    <Image
                      src={group.diagram}
                      alt={`Diagram for question ${group.root}`}
                      width={1000}
                      height={620}
                      className="w-full h-auto"
                    />
                  </div>
                )}
              </div>
            )}

            {group.items.map((item) => (
              <ExamItemCard
                key={item.id}
                item={item}
                showStem={false}
                groupContext={group.context}
                onDone={(marks) => setScores((s) => ({ ...s, [item.id]: marks }))}
              />
            ))}
          </section>
        ))}
      </div>
    </div>
  )
}
