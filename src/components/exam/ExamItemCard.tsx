'use client'

import { memo, useEffect, useRef, useState } from 'react'
import { useTranslations } from 'next-intl'
import Image from 'next/image'
import { Check, X, Clock, ArrowRight } from 'lucide-react'
import MathRenderer from '@/components/math/MathRenderer'
import type { ExamItem } from '@/content/exam/types'
import {
  SCAFFOLD,
  calibrationOf,
  xpFor,
  marksEarned,
  CALIBRATION_COPY,
  type Familiarity,
} from '@/lib/exam/calibration'

/** The words are in the `exam` message namespace; only the dot colour is data. */
const OPTIONS: { value: Familiarity; dot: string }[] = [
  { value: 'new', dot: '#4a9dd4' },
  { value: 'shaky', dot: '#e9c46a' },
  { value: 'confident', dot: '#2a9d8f' },
]

type Phase = 'gate' | 'scaffold' | 'attempt' | 'marking' | 'result'

/** What the student did, once they have marked themselves. */
export interface ExamAttempt {
  familiarity: Familiarity
  /** Positions in item.markScheme, never descriptors. */
  satisfied: number[]
  marks: number
  available: number
}

function ExamItemCard({
  item,
  onDone,
  showStem = true,
  groupContext,
  groupDiagram,
  previousAttempt,
  saveFailed = false,
}: {
  item: ExamItem
  /**
   * Takes the item back, so the parent can pass ONE stable callback for
   * all 53 cards. An inline `(attempt) => persist(item, attempt)` is a new
   * function every render, which defeats the memo() below entirely.
   */
  onDone?: (item: ExamItem, attempt: ExamAttempt) => void
  /** False when the question group above already shows the stem and diagram. */
  showStem?: boolean
  /** The stem shown above the group, so a local one can be told apart. */
  groupContext?: string
  /** The diagram shown above the group, if the whole group shares one. */
  groupDiagram?: string
  /**
   * A saved attempt from an earlier sitting. The paper is long enough that
   * nobody finishes it in one go, so coming back to a paper that shows no
   * sign of the work already done is the difference between a tool and a
   * demo. Only the claim and the score are restored - which individual mark
   * points were ticked is not stored, so the card opens on its result.
   */
  previousAttempt?: { familiarity: Familiarity; marksEarned: number }
  /** This answer did not reach the server; say so rather than implying it saved. */
  saveFailed?: boolean
}) {
  // A sub-part may carry its own context that is not the question's stem -
  // 6.4 adds "the graph f is shifted 30° to the left" on top of question 6's
  // diagram - and that must still be shown even when the stem is not.
  const t = useTranslations('exam')
  const localContext =
    item.context && item.context !== groupContext ? item.context : undefined
  const [phase, setPhase] = useState<Phase>(previousAttempt ? 'result' : 'gate')
  const [familiarity, setFamiliarity] = useState<Familiarity | null>(
    previousAttempt?.familiarity ?? null
  )
  // Positions in item.markScheme, not descriptors - a memo can award two
  // marks with identical wording (both roots of a quadratic are 'answers').
  const [satisfied, setSatisfied] = useState<number[]>([])

  const available = item.marks
  // A restored attempt has a score but no record of WHICH mark points were
  // ticked, so the score is taken as given rather than recomputed from an
  // empty `satisfied` (which would redisplay every finished question as 0).
  const earned = previousAttempt && phase === 'result' && satisfied.length === 0
    ? previousAttempt.marksEarned
    : marksEarned(item.markScheme, satisfied)
  const calibration = familiarity ? calibrationOf(familiarity, earned, available) : null
  const copy = calibration ? CALIBRATION_COPY[calibration] : null

  /**
   * Each phase replaces the button the student just pressed, so the
   * browser drops focus to <body> - up to five times per question, on a
   * 53-question paper. A keyboard user has to tab back down from the top
   * of the page every time, and a screen reader loses its place at the
   * exact moment the new content appears.
   *
   * Focus moves to the new phase instead. Skipped on first render so that
   * arriving at the page (or scrolling past 50 cards) does not yank focus
   * into one of them.
   */
  const phaseRef = useRef<HTMLDivElement>(null)
  const settled = useRef(false)

  useEffect(() => {
    if (!settled.current) {
      settled.current = true
      return
    }
    phaseRef.current?.focus()
  }, [phase])

  /**
   * What the result actually says, as one sentence. The marks, the
   * verdict and the XP are spread across three separate nodes on screen,
   * and none of them was in a live region - so a blind student marking
   * themselves against the memo got no feedback at all on the app's main
   * feature.
   */
  const resultAnnouncement =
    phase === 'result' && copy && calibration
      ? `${t(copy.key)}. ${earned} ${earned === 1 ? t('mark') : t('marks')} ${t(
          'outOf'
        )} ${available}. ${t(`${copy.key}Detail`)}`
      : ''

  const choose = (value: Familiarity) => {
    setFamiliarity(value)
    setPhase(SCAFFOLD[value] === 'none' ? 'attempt' : 'scaffold')
  }

  const toggle = (index: number) =>
    setSatisfied((s) => (s.includes(index) ? s.filter((i) => i !== index) : [...s, index]))

  return (
    <div
      className="rounded-xl p-5 mb-6"
      style={{ background: 'var(--surface)', border: '1px solid var(--border-custom)' }}
    >
      <div className="flex items-baseline justify-between mb-3">
        <span className="text-sm font-semibold" style={{ color: 'var(--accent-red-text)' }}>
          {t('question')} {item.question}
        </span>
        <span className="text-xs" style={{ color: 'var(--muted-custom)' }}>
          {item.source} · {item.marks} {item.marks === 1 ? t('mark') : t('marks')}
        </span>
      </div>

      {showStem && item.context && (
        <div className="text-sm mb-3" style={{ color: 'var(--text)', opacity: 0.85 }}>
          <MathRenderer content={item.context} />
        </div>
      )}

      {!showStem && localContext && (
        <div className="text-sm mb-3" style={{ color: 'var(--text)', opacity: 0.85 }}>
          <MathRenderer content={localContext} />
        </div>
      )}

      {(showStem || !groupDiagram) && item.diagram && (
        <div className="my-3 rounded-lg overflow-hidden" style={{ background: '#fff' }}>
          <Image
            src={item.diagram}
            alt={`Diagram for question ${item.question}`}
            width={1000}
            height={620}
            className="w-full h-auto"
          />
        </div>
      )}

      <div className="text-base mb-4" style={{ color: 'var(--text)' }}>
        <MathRenderer content={item.prompt} />
      </div>

      {/* Announces the outcome. role="status" rather than "alert": it
          should be read when reached, not interrupt. */}
      <div aria-live="polite" role="status" className="sr-only">
        {resultAnnouncement}
      </div>

      {/* tabIndex -1 makes this a valid programmatic focus target; it is
          not in the tab order itself. */}
      <div ref={phaseRef} tabIndex={-1} className="outline-none">

      {/* ---------------------------------------------------- the gate */}
      {phase === 'gate' && (
        <div>
          <p className="text-sm font-semibold mb-3" style={{ color: 'var(--text)' }}>
            {t('familiarity')}
          </p>
          <div className="grid gap-2 sm:grid-cols-3">
            {OPTIONS.map((option) => (
              <button
                key={option.value}
                onClick={() => choose(option.value)}
                className="text-left rounded-lg p-3 transition-all hover:scale-[1.02]"
                style={{ background: 'var(--surface2)', border: '1px solid var(--border-custom)' }}
              >
                <span className="flex items-center gap-2 text-sm font-semibold" style={{ color: 'var(--text)' }}>
                  <span className="w-2.5 h-2.5 rounded-full" style={{ background: option.dot }} />
                  {t(option.value)}
                </span>
                <span className="block text-xs mt-1" style={{ color: 'var(--muted-custom)' }}>
                  {t(`${option.value}Hint`)}
                </span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* ------------------------------------------- scaffold before attempt */}
      {phase === 'scaffold' && familiarity && (
        <div
          className="rounded-lg p-4"
          style={{ background: 'rgba(74, 157, 212, 0.08)', border: '1px solid #4a9dd4' }}
        >
          <p className="text-xs font-semibold uppercase tracking-wide mb-2" style={{ color: '#4a9dd4' }}>
            {familiarity === 'new' ? t('beforeYouTry') : t('aNudge')}
          </p>
          {familiarity === 'new' ? (
            <ol className="text-sm space-y-1 list-decimal ml-4" style={{ color: 'var(--text)' }}>
              {item.solution.map((line, i) => (
                <li key={i}>
                  <MathRenderer content={line} />
                </li>
              ))}
            </ol>
          ) : (
            <div className="text-sm" style={{ color: 'var(--text)' }}>
              <MathRenderer content={item.solution[0]} />
            </div>
          )}
          <button
            onClick={() => setPhase('attempt')}
            className="mt-3 inline-flex items-center gap-1 text-sm font-semibold tap-target"
            style={{ color: 'var(--accent-red-text)' }}
          >
            {t('nowTryIt')} <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* ------------------------------------------------------ attempt */}
      {phase === 'attempt' && (
        <button
          onClick={() => setPhase('marking')}
          className="px-4 py-2 rounded-lg text-sm font-semibold"
          style={{ background: 'var(--accent-red)', color: 'white' }}
        >
          {t('markMe')}
        </button>
      )}

      {/* ---------------------------------------------- mark yourself */}
      {phase === 'marking' && (
        <div>
          <p
            id={`marking-${item.id}`}
            className="text-sm mb-1 font-semibold"
            style={{ color: 'var(--text)' }}
          >
            {t('tickWhatShows')}
          </p>
          <p className="text-xs mb-3" style={{ color: 'var(--muted-custom)' }}>
            {t('examinersMarks')}
          </p>
          {/* These toggle on and off, and the only thing that said so was a
              tick icon and a colour - a screen reader read the descriptor
              and gave no hint whether the student had claimed that mark
              (WCAG 2.2 SC 4.1.2). role=checkbox matches what is drawn; the
              element stays a <button>, so Enter and Space both still work. */}
          <div className="space-y-2" role="group" aria-labelledby={`marking-${item.id}`}>
            {item.markScheme.map((point, index) => {
              const on = satisfied.includes(index)
              return (
                <button
                  key={index}
                  onClick={() => toggle(index)}
                  role="checkbox"
                  aria-checked={on}
                  className="w-full flex items-center gap-3 rounded-lg p-3 text-left"
                  style={{
                    background: on ? 'rgba(42, 157, 143, 0.12)' : 'var(--surface2)',
                    border: `1px solid ${on ? 'var(--teal)' : 'var(--border-custom)'}`,
                  }}
                >
                  <span
                    aria-hidden="true"
                    className="w-5 h-5 rounded flex items-center justify-center shrink-0"
                    style={{ border: `1px solid ${on ? 'var(--teal)' : 'var(--border-custom)'}` }}
                  >
                    {on && <Check className="w-3.5 h-3.5" style={{ color: 'var(--teal)' }} />}
                  </span>
                  <span className="text-sm flex-1" style={{ color: 'var(--text)' }}>
                    <MathRenderer content={point.descriptor} />
                  </span>
                  <span
                    className="text-[10px] uppercase tracking-wide px-2 py-0.5 rounded"
                    style={{
                      background: point.kind === 'method' ? 'rgba(233,196,106,0.15)' : 'var(--surface)',
                      color: point.kind === 'method' ? '#e9c46a' : 'var(--muted-custom)',
                    }}
                  >
                    {t(point.kind)}
                  </span>
                </button>
              )
            })}
          </div>
          <button
            onClick={() => {
              setPhase('result')
              if (familiarity) {
                onDone?.(item, { familiarity, satisfied, marks: earned, available })
              }
            }}
            className="mt-3 px-4 py-2 rounded-lg text-sm font-semibold"
            style={{ background: 'var(--accent-red)', color: 'white' }}
          >
            {t('seeHowIDid')}
          </button>
        </div>
      )}

      {/* ------------------------------------------------------- result */}
      {phase === 'result' && copy && (
        <div className="space-y-3">
          <div
            className="rounded-lg p-4"
            style={{
              background:
                copy.tone === 'warn'
                  ? 'rgba(233, 196, 106, 0.1)'
                  : copy.tone === 'good'
                  ? 'rgba(42, 157, 143, 0.1)'
                  : 'var(--surface2)',
              border: `1px ${copy.tone === 'warn' ? 'dashed' : 'solid'} ${
                copy.tone === 'warn' ? '#e9c46a' : copy.tone === 'good' ? 'var(--teal)' : 'var(--border-custom)'
              }`,
            }}
          >
            <div className="flex items-center justify-between mb-1">
              <span
                className="text-xs font-semibold uppercase tracking-wide"
                style={{ color: copy.tone === 'warn' ? '#e9c46a' : copy.tone === 'good' ? 'var(--teal)' : 'var(--muted-custom)' }}
              >
                {copy.tone === 'warn' && <Clock className="w-3.5 h-3.5 inline mr-1" />}
                {t(copy.key)}
              </span>
              <span className="text-sm font-bold" style={{ color: 'var(--text)' }}>
                {earned} / {available}
              </span>
            </div>
            <p className="text-sm" style={{ color: 'var(--text)' }}>
              {t(`${copy.key}Detail`)}
            </p>
            <p className="text-xs mt-2" style={{ color: 'var(--muted-custom)' }}>
              +{xpFor(calibration!, earned)} XP
            </p>
            {saveFailed && (
              <p className="text-xs mt-1" style={{ color: 'var(--accent-red-text)' }}>
                {t('notSaved')}
              </p>
            )}
          </div>

          {item.markScheme.some((p, i) => p.kind === 'method' && satisfied.includes(i)) &&
            earned < available && (
              <p className="text-sm" style={{ color: 'var(--teal)' }}>
                {t('methodMarkNote')}
              </p>
            )}

          <div>
            <p className="text-xs font-semibold uppercase tracking-wide mb-2" style={{ color: 'var(--muted-custom)' }}>
              {t('theMemo')}
            </p>
            <ol className="text-sm space-y-1 list-decimal ml-4" style={{ color: 'var(--text)' }}>
              {item.solution.map((line, i) => (
                <li key={i}>
                  <MathRenderer content={line} />
                </li>
              ))}
            </ol>
          </div>

          {calibration === 'blind-spot' && item.commonError && (
            <div className="rounded-lg p-3" style={{ background: 'var(--surface2)' }}>
              <p className="text-xs font-semibold uppercase tracking-wide mb-1" style={{ color: '#e9c46a' }}>
                {t('whatGoesWrong')}
              </p>
              <p className="text-sm" style={{ color: 'var(--text)' }}>
                <MathRenderer content={item.commonError} />
              </p>
            </div>
          )}

          {/* Only meaningful for an attempt marked in THIS session - a
              restored one knows the score but not which points earned it. */}
          <div className="flex gap-3 text-xs" hidden={satisfied.length === 0 && !!previousAttempt} style={{ color: 'var(--muted-custom)' }}>
            {item.markScheme.map((p, i) => (
              <span key={i} className="inline-flex items-center gap-1">
                {satisfied.includes(i) ? (
                  <Check className="w-3 h-3" style={{ color: 'var(--teal)' }} />
                ) : (
                  <X className="w-3 h-3" style={{ color: 'var(--accent-red-text)' }} />
                )}
                {/* Descriptors carry LaTeX - the memo writes marks like
                    $\frac{408}{19}$ - so this summary must render them the
                    same way the marking list above does, not print the
                    source. */}
                <MathRenderer content={p.descriptor} />
              </span>
            ))}
          </div>
        </div>
      )}

      </div>
    </div>
  )
}

/**
 * A 150-mark paper is 53 of these on one page, and marking any single
 * question updates state that lives in ExamPageClient - so without this,
 * every answer re-rendered all 53 cards and everything inside them,
 * including the KaTeX in each mark scheme.
 *
 * The props that matter are the item (static per page) and the two
 * per-item flags, so a default shallow compare is exactly right - as long
 * as the parent does not hand each card a freshly-built onDone on every
 * render, which is why that callback is memoised there.
 */
export default memo(ExamItemCard)
