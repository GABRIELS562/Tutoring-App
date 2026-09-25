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

/**
 * A stem or diagram belongs to a RUN of consecutive sub-parts, not to the
 * whole question. Question 6 shows its graph for 6.1 to 6.3 but not for 6.4,
 * and question 7 is three different scenarios under one number - a general
 * proof, a triangle PQR, and a figure. Hoisting to the question repeated the
 * graph three times in one case and paired the wrong stem with the wrong
 * diagram in the other.
 */
interface Run {
  diagram?: string
  items: ExamItem[]
}

interface Group {
  root: string
  runs: Run[]
}

function groupByQuestion(items: ExamItem[]): Group[] {
  const byRoot = new Map<string, Group>()
  for (const item of items) {
    const root = questionRoot(item.question)
    const group = byRoot.get(root) ?? { root, runs: [] }
    byRoot.set(root, group)

    // Runs break on the DIAGRAM only. Sub-parts of one question often carry
    // slightly different stems - "From QUESTION 4.1, ..." - while sharing the
    // same figure, and breaking on the stem repeated question 4's diagram
    // five times.
    const current = group.runs.at(-1)
    if (current && current.diagram === item.diagram) current.items.push(item)
    else group.runs.push({ diagram: item.diagram, items: [item] })
  }
  return [...byRoot.values()]
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

            {group.runs.map((run, index) => (
              <div key={index}>
                {run.diagram && (
                  <div
                    className="rounded-xl p-4 mb-3"
                    style={{ background: 'var(--surface)', border: '1px solid var(--border-custom)' }}
                  >
                    <div className="rounded-lg overflow-hidden" style={{ background: '#fff' }}>
                      <Image
                        src={run.diagram}
                        alt={`Diagram for question ${run.items[0].question}`}
                        width={1000}
                        height={620}
                        className="w-full h-auto"
                      />
                    </div>
                  </div>
                )}

                {run.items.map((item, i) => (
                  <ExamItemCard
                    key={item.id}
                    item={item}
                    showStem={false}
                    groupContext={i > 0 ? run.items[i - 1].context : undefined}
                    groupDiagram={run.diagram}
                    onDone={(marks) => setScores((s) => ({ ...s, [item.id]: marks }))}
                  />
                ))}
              </div>
            ))}
          </section>
        ))}
      </div>
    </div>
  )
}
