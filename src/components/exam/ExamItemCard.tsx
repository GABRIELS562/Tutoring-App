'use client'

import { useState } from 'react'
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

const OPTIONS: { value: Familiarity; label: string; hint: string; dot: string }[] = [
  { value: 'new', label: 'New to me', hint: "I haven't covered this", dot: '#4a9dd4' },
  { value: 'shaky', label: 'Seen it, shaky', hint: "I've covered it but I'm not confident", dot: '#e9c46a' },
  { value: 'confident', label: "I've got this", hint: 'I can do this', dot: '#2a9d8f' },
]

type Phase = 'gate' | 'scaffold' | 'attempt' | 'marking' | 'result'

export default function ExamItemCard({
  item,
  onDone,
}: {
  item: ExamItem
  onDone?: (marks: number, available: number) => void
}) {
  const [phase, setPhase] = useState<Phase>('gate')
  const [familiarity, setFamiliarity] = useState<Familiarity | null>(null)
  const [satisfied, setSatisfied] = useState<string[]>([])

  const available = item.marks
  const earned = marksEarned(item.markScheme, satisfied)
  const calibration = familiarity ? calibrationOf(familiarity, earned, available) : null
  const copy = calibration ? CALIBRATION_COPY[calibration] : null

  const choose = (value: Familiarity) => {
    setFamiliarity(value)
    setPhase(SCAFFOLD[value] === 'none' ? 'attempt' : 'scaffold')
  }

  const toggle = (descriptor: string) =>
    setSatisfied((s) =>
      s.includes(descriptor) ? s.filter((d) => d !== descriptor) : [...s, descriptor]
    )

  return (
    <div
      className="rounded-xl p-5 mb-6"
      style={{ background: 'var(--surface)', border: '1px solid var(--border-custom)' }}
    >
      <div className="flex items-baseline justify-between mb-3">
        <span className="text-sm font-semibold" style={{ color: 'var(--accent-red)' }}>
          Question {item.question}
        </span>
        <span className="text-xs" style={{ color: 'var(--muted-custom)' }}>
          {item.source} · {item.marks} {item.marks === 1 ? 'mark' : 'marks'}
        </span>
      </div>

      {item.context && (
        <div className="text-sm mb-3" style={{ color: 'var(--text)', opacity: 0.85 }}>
          <MathRenderer content={item.context} />
        </div>
      )}

      {item.diagram && (
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

      {/* ---------------------------------------------------- the gate */}
      {phase === 'gate' && (
        <div>
          <p className="text-sm font-semibold mb-3" style={{ color: 'var(--text)' }}>
            How familiar are you with this?
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
                  {option.label}
                </span>
                <span className="block text-xs mt-1" style={{ color: 'var(--muted-custom)' }}>
                  {option.hint}
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
            {familiarity === 'new' ? 'Before you try' : 'A nudge'}
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
            className="mt-3 inline-flex items-center gap-1 text-sm font-semibold"
            style={{ color: 'var(--accent-red)' }}
          >
            Now try it <ArrowRight className="w-4 h-4" />
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
          I&apos;ve worked it out — mark me
        </button>
      )}

      {/* ---------------------------------------------- mark yourself */}
      {phase === 'marking' && (
        <div>
          <p className="text-sm mb-1 font-semibold" style={{ color: 'var(--text)' }}>
            Tick what your working actually shows
          </p>
          <p className="text-xs mb-3" style={{ color: 'var(--muted-custom)' }}>
            These are the examiner&apos;s marks, in the memo&apos;s own words.
          </p>
          <div className="space-y-2">
            {item.markScheme.map((point) => {
              const on = satisfied.includes(point.descriptor)
              return (
                <button
                  key={point.descriptor}
                  onClick={() => toggle(point.descriptor)}
                  className="w-full flex items-center gap-3 rounded-lg p-3 text-left"
                  style={{
                    background: on ? 'rgba(42, 157, 143, 0.12)' : 'var(--surface2)',
                    border: `1px solid ${on ? 'var(--teal)' : 'var(--border-custom)'}`,
                  }}
                >
                  <span
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
                    {point.kind}
                  </span>
                </button>
              )
            })}
          </div>
          <button
            onClick={() => {
              setPhase('result')
              onDone?.(earned, available)
            }}
            className="mt-3 px-4 py-2 rounded-lg text-sm font-semibold"
            style={{ background: 'var(--accent-red)', color: 'white' }}
          >
            See how I did
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
                {copy.label}
              </span>
              <span className="text-sm font-bold" style={{ color: 'var(--text)' }}>
                {earned} / {available}
              </span>
            </div>
            <p className="text-sm" style={{ color: 'var(--text)' }}>
              {copy.detail}
            </p>
            <p className="text-xs mt-2" style={{ color: 'var(--muted-custom)' }}>
              +{xpFor(calibration!, earned)} XP
            </p>
          </div>

          {item.markScheme.some((p) => p.kind === 'method' && satisfied.includes(p.descriptor)) &&
            earned < available && (
              <p className="text-sm" style={{ color: 'var(--teal)' }}>
                In the real exam you would still get the method mark here, even though the
                final answer is wrong. That is a mark most students throw away by writing
                nothing down.
              </p>
            )}

          <div>
            <p className="text-xs font-semibold uppercase tracking-wide mb-2" style={{ color: 'var(--muted-custom)' }}>
              The memo
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
                What usually goes wrong here
              </p>
              <p className="text-sm" style={{ color: 'var(--text)' }}>
                <MathRenderer content={item.commonError} />
              </p>
            </div>
          )}

          <div className="flex gap-3 text-xs" style={{ color: 'var(--muted-custom)' }}>
            {item.markScheme.map((p) => (
              <span key={p.descriptor} className="inline-flex items-center gap-1">
                {satisfied.includes(p.descriptor) ? (
                  <Check className="w-3 h-3" style={{ color: 'var(--teal)' }} />
                ) : (
                  <X className="w-3 h-3" style={{ color: 'var(--accent-red)' }} />
                )}
                {p.descriptor}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
