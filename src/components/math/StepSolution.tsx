'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { HelpCircle, ChevronDown, ChevronUp } from 'lucide-react'
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
}

function StepRow({ step, index }: { step: Step; index: number }) {
  const [showHint, setShowHint] = useState(false)

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
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
            <HelpCircle className="w-3.5 h-3.5" />
            {showHint ? 'Hide hint' : 'Show hint'}
            {showHint ? (
              <ChevronUp className="w-3 h-3" />
            ) : (
              <ChevronDown className="w-3 h-3" />
            )}
          </button>
        )}

        {/* Hint Text */}
        <AnimatePresence>
          {showHint && step.hint && (
            <motion.p
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
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
      </div>
    </motion.div>
  )
}

export default function StepSolution({ steps }: StepSolutionProps) {
  if (!steps || steps.length === 0) {
    return null
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
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
          <StepRow key={step.stepNumber} step={step} index={index} />
        ))}
      </div>
    </motion.div>
  )
}
