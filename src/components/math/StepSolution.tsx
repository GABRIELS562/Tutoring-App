'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { HelpCircle, ChevronDown, ChevronUp, MessageCircle, Loader2 } from 'lucide-react'
import MathRenderer from './MathRenderer'

type Step = {
  stepNumber: number
  instruction: string
  hint: string | null
  correctAnswer: string
  explanation: string | null
}

type StepSolutionProps = {
  steps: Step[]
  /** The full question text - sent to /api/ai-hint's step_hint mode so
   * Angelo has context for the step, not just the step's own instruction. */
  questionText: string
}

/** Free-tier daily hint quota, shared across every step in this
 * solution (and every other 'Ask Angelo' surface) - not per step. */
type RemainingHints = number | 'unlimited' | null

function StepRow({
  step,
  index,
  questionText,
  remainingHints,
  onRemainingHintsChange,
}: {
  step: Step
  index: number
  questionText: string
  remainingHints: RemainingHints
  onRemainingHintsChange: (remaining: RemainingHints) => void
}) {
  const [showHint, setShowHint] = useState(false)
  const [askingAngelo, setAskingAngelo] = useState(false)
  const [angeloResponse, setAngeloResponse] = useState<string | null>(null)
  const [angeloError, setAngeloError] = useState<string | null>(null)

  const quotaExhausted = remainingHints === 0

  // Mirrors the "Ask Angelo" pattern in QuestionCard.tsx (fetch, loading,
  // error, and 429-quota handling) - the step_hint mode this calls was
  // previously wired up server-side (prompts.ts, api/ai-hint/route.ts)
  // but had no caller anywhere in the UI.
  const handleAskAngelo = async () => {
    setAskingAngelo(true)
    setAngeloError(null)

    try {
      const response = await fetch('/api/ai-hint', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          mode: 'step_hint',
          questionText,
          stepNumber: step.stepNumber,
          hint: step.hint ?? undefined,
        }),
      })

      const data = await response.json()

      if (response.status === 429) {
        setAngeloError(
          data.message || 'Daily hint limit reached. Upgrade to Premium for unlimited hints!'
        )
        onRemainingHintsChange(0)
        return
      }

      if (!response.ok) {
        throw new Error(data.error || 'Failed to get help')
      }

      setAngeloResponse(data.hint)
      if (data.remaining === 'unlimited' || typeof data.remaining === 'number') {
        onRemainingHintsChange(data.remaining)
      }
    } catch (error) {
      setAngeloError('Something went wrong. Please try again.')
      console.error('Ask Angelo (step hint) error:', error)
    } finally {
      setAskingAngelo(false)
    }
  }

  return (
    <motion.div
      initial={{ y: 10 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.3, delay: index * 0.1 }}
      className="flex gap-3"
    >
      {/* Step Number Badge */}
      <div
        className="flex-shrink-0 w-7 h-7 rounded-full flex items-center justify-center text-sm font-bold text-white"
        style={{ background: 'var(--accent-red)' }}
      >
        {step.stepNumber}
      </div>

      {/* Step Content */}
      <div className="flex-1 min-w-0">
        {/* Instruction */}
        <p className="text-sm mb-2" style={{ color: 'var(--text)' }}>
          {step.instruction}
        </p>

        {/* Answer Box */}
        <div
          className="p-3 rounded font-mono text-sm overflow-x-auto mb-2"
          style={{
            background: 'var(--bg)',
            border: '1px solid var(--border-custom)',
          }}
        >
          <MathRenderer content={step.correctAnswer} />
        </div>

        {/* Hint Toggle */}
        {step.hint && (
          <button
            onClick={() => setShowHint(!showHint)}
            className="flex items-center gap-1.5 text-xs font-medium mb-2 transition-colors"
            style={{ color: 'var(--muted-custom)' }}
          >
            <HelpCircle className="w-3.5 h-3.5" aria-hidden="true" />
            {showHint ? 'Hide hint' : 'Show hint'}
            {showHint ? (
              <ChevronUp className="w-3 h-3" aria-hidden="true" />
            ) : (
              <ChevronDown className="w-3 h-3" aria-hidden="true" />
            )}
          </button>
        )}

        {/* Hint Text */}
        <AnimatePresence>
          {showHint && step.hint && (
            <motion.p
              initial={{ height: 0 }}
              animate={{ height: 'auto' }}
              exit={{ height: 0 }}
              className="text-sm italic mb-2 pl-3"
              style={{
                color: 'var(--muted-custom)',
                borderLeft: '2px solid var(--border-custom)',
              }}
            >
              {step.hint}
            </motion.p>
          )}
        </AnimatePresence>

        {/* Explanation */}
        {step.explanation && (
          <p
            className="text-xs mt-2"
            style={{ color: 'var(--muted-custom)' }}
          >
            {step.explanation}
          </p>
        )}

        {/* Ask Angelo about this step */}
        {!angeloResponse && (
          <div className="mt-3">
            <button
              onClick={handleAskAngelo}
              disabled={askingAngelo || quotaExhausted}
              className="flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-medium transition-all hover:opacity-90 disabled:opacity-50"
              style={{
                background: 'rgba(42, 157, 143, 0.15)',
                color: 'var(--teal)',
                border: '1px solid var(--teal)',
              }}
            >
              {askingAngelo ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" aria-hidden="true" />
                  Angelo is thinking...
                </>
              ) : (
                <>
                  <MessageCircle className="w-3.5 h-3.5" aria-hidden="true" />
                  Ask Angelo about this step
                </>
              )}
            </button>
            {angeloError && (
              <p className="mt-2 text-xs" style={{ color: 'var(--accent-red-text)' }}>
                {angeloError}
              </p>
            )}
          </div>
        )}

        {/* Angelo's Response */}
        {angeloResponse && (
          <motion.div
            initial={{ y: 10 }}
            animate={{ y: 0 }}
            className="mt-3 p-3 rounded-lg"
            style={{
              background: 'rgba(42, 157, 143, 0.1)',
              border: '1px solid var(--teal)',
            }}
          >
            <div className="flex items-start gap-2">
              <div
                className="w-6 h-6 rounded-full flex items-center justify-center shrink-0 text-[10px] font-bold"
                style={{ background: 'var(--teal)', color: 'var(--bg)' }}
              >
                AT
              </div>
              <div>
                <p className="text-xs font-medium mb-1" style={{ color: 'var(--teal)' }}>
                  Angelo says:
                </p>
                <p className="text-sm" style={{ color: 'var(--text)' }}>
                  {angeloResponse}
                </p>
              </div>
            </div>
          </motion.div>
        )}
      </div>
    </motion.div>
  )
}

export default function StepSolution({ steps, questionText }: StepSolutionProps) {
  // Shared across all steps in this solution - a 429 on one step means
  // every other step's button should reflect the same exhausted quota
  // rather than letting the student trigger the same rejection again.
  const [remainingHints, setRemainingHints] = useState<RemainingHints>(null)

  if (!steps || steps.length === 0) {
    return null
  }

  return (
    <motion.div
      initial={{ y: 20 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.4 }}
      className="mt-4 p-4 rounded-lg"
      style={{
        background: 'var(--surface2)',
        border: '1px solid var(--border-custom)',
      }}
    >
      <h4
        className="text-sm font-semibold mb-4"
        style={{ color: 'var(--text)' }}
      >
        Step-by-step solution
      </h4>

      <div className="space-y-4">
        {steps.map((step, index) => (
          <StepRow
            key={step.stepNumber}
            step={step}
            index={index}
            questionText={questionText}
            remainingHints={remainingHints}
            onRemainingHintsChange={setRemainingHints}
          />
        ))}
      </div>
    </motion.div>
  )
}
