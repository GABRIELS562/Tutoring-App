'use client'

import { useCallback, useMemo, useState } from 'react'
import { useTranslations } from 'next-intl'
import Image from 'next/image'
import Topbar from '@/components/layout/Topbar'
import ExamItemCard, { type ExamAttempt } from '@/components/exam/ExamItemCard'
import type { ExamItem } from '@/content/exam/types'
import { totalMarks } from '@/content/exam/types'
import type { Familiarity } from '@/lib/exam/calibration'
import { recordExamAttempt } from './actions'

/** An attempt from an earlier sitting, loaded server-side. */
export interface SavedAttempt {
  itemId: string
  familiarity: Familiarity
  marksEarned: number
}

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

export default function ExamPageClient({
  items,
  paperKey,
  savedAttempts = [],
}: {
  items: ExamItem[]
  paperKey: string
  savedAttempts?: SavedAttempt[]
}) {
  const t = useTranslations('exam')
  const saved = useMemo(
    () => new Map(savedAttempts.map((a) => [a.itemId, a])),
    [savedAttempts]
  )
  // Seeded from what was already saved, so the running total across the top
  // counts an earlier sitting instead of restarting at zero.
  const [scores, setScores] = useState<Record<string, number>>(() =>
    Object.fromEntries(savedAttempts.map((a) => [a.itemId, a.marksEarned]))
  )
  const [failedSaves, setFailedSaves] = useState<ReadonlySet<string>>(new Set())

  /**
   * Marks are shown immediately and persisted in the background: the
   * student has already marked themselves against the memo, so making
   * them wait on a round trip to see their own result would be a
   * regression on the version that saved nothing. A failure is surfaced on
   * the card rather than swallowed - "+15 XP" next to an answer that never
   * reached the server is a lie the student has no way to detect.
   *
   * Only the claim and the ticked positions are sent. The marks and the XP
   * are recomputed server-side from the real mark scheme; see
   * recordExamAttempt().
   */
  const persist = useCallback(async (item: ExamItem, attempt: ExamAttempt) => {
    setScores((s) => ({ ...s, [item.id]: attempt.marks }))
    // Clear any earlier failure for this question before retrying it.
    setFailedSaves((f) => {
      if (!f.has(item.id)) return f
      const next = new Set(f)
      next.delete(item.id)
      return next
    })

    try {
      const result = await recordExamAttempt({
        paperKey,
        itemId: item.id,
        familiarity: attempt.familiarity,
        satisfied: attempt.satisfied,
      })
      if (!result.ok) {
        setFailedSaves((f) => new Set(f).add(item.id))
      }
    } catch {
      setFailedSaves((f) => new Set(f).add(item.id))
    }
  }, [paperKey])

  const available = totalMarks(items)
  const earned = Object.values(scores).reduce((a, b) => a + b, 0)
  const done = Object.keys(scores).length
  const groups = useMemo(() => groupByQuestion(items), [items])

  return (
    <div className="min-h-screen" style={{ background: 'var(--bg)' }}>
      <Topbar title={t('title')} subtitle={items[0]?.source} />

      <div className="max-w-3xl mx-auto px-4 py-6">
        <div
          className="rounded-xl p-4 mb-6"
          style={{ background: 'var(--surface)', border: '1px solid var(--border-custom)' }}
        >
          <p className="text-sm" style={{ color: 'var(--text)' }}>
            {t('realQuestions')}
          </p>
          <p className="text-xs mt-1" style={{ color: 'var(--muted-custom)' }}>
            {t('progress', { done, total: items.length, earned, available })}
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
              {t('question')} {group.root}
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
                    previousAttempt={saved.get(item.id)}
                    saveFailed={failedSaves.has(item.id)}
                    onDone={persist}
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
