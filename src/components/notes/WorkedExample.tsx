'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronDown, ChevronUp } from 'lucide-react'
import MathRenderer from '@/components/math/MathRenderer'
import type { WorkedStep } from '@/types'

type WorkedExampleProps = {
  title: string
  question: string
  steps: WorkedStep[]
  answer: string
}

export default function WorkedExample({
  title,
  question,
  steps,
  answer,
}: WorkedExampleProps) {
  const [showSolution, setShowSolution] = useState(false)
  const [visibleSteps, setVisibleSteps] = useState(0)

  const handleShowSolution = () => {
    if (!showSolution) {
      setShowSolution(true)
      setVisibleSteps(1)
    } else {
      setShowSolution(false)
      setVisibleSteps(0)
    }
  }

  const handleNextStep = () => {
    if (visibleSteps < steps.length) {
      setVisibleSteps(visibleSteps + 1)
    }
  }

  return (
    <div
      className="rounded-lg p-4 my-4"
      style={{
        background: 'var(--surface2)',
        border: '1px solid var(--border-custom)',
      }}
    >
      {/* Title */}
      <h4
        className="text-sm font-semibold mb-3"
        style={{ color: 'var(--accent-red)' }}
      >
        Worked Example: {title}
      </h4>

      {/* Question */}
      <div
        className="p-3 rounded-lg mb-4"
        style={{ background: 'var(--surface)' }}
      >
        <p className="text-sm font-medium mb-1" style={{ color: 'var(--muted-custom)' }}>
          Question:
        </p>
        <div style={{ color: 'var(--text)' }}>
          <MathRenderer content={question} />
        </div>
      </div>

      {/* Show Solution Button */}
      <button
        onClick={handleShowSolution}
        className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all mb-4"
        style={{
          background: showSolution ? 'var(--surface)' : 'var(--accent-red)',
          color: showSolution ? 'var(--text)' : 'white',
        }}
      >
        {showSolution ? (
          <>
            <ChevronUp className="w-4 h-4" />
            Hide solution
          </>
        ) : (
          <>
            <ChevronDown className="w-4 h-4" />
            Show solution
          </>
        )}
      </button>

      {/* Steps */}
      <AnimatePresence>
        {showSolution && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
          >
            <div className="space-y-3">
              {steps.slice(0, visibleSteps).map((step, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
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
                  <div className="flex-1">
                    <p
                      className="text-sm mb-2"
                      style={{ color: 'var(--text)' }}
                    >
                      {step.instruction}
                    </p>
                    <div
                      className="p-3 rounded font-mono text-sm overflow-x-auto"
                      style={{
                        background: 'var(--bg)',
                        border: '1px solid var(--border-custom)',
                      }}
                    >
                      <MathRenderer content={step.working} />
                    </div>
                  </div>
                </motion.div>
              ))}

              {/* Show Next Step Button */}
              {visibleSteps < steps.length && (
                <button
                  onClick={handleNextStep}
                  className="ml-10 px-3 py-1.5 rounded text-sm font-medium transition-all"
                  style={{
                    background: 'var(--surface)',
                    color: 'var(--accent-red)',
                    border: '1px solid var(--accent-red)',
                  }}
                >
                  Show next step
                </button>
              )}

              {/* Final Answer */}
              {visibleSteps >= steps.length && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                  className="p-3 rounded-lg mt-4"
                  style={{
                    background: 'rgba(42, 157, 143, 0.15)',
                    border: '1px solid var(--teal)',
                  }}
                >
                  <p
                    className="text-sm font-semibold mb-1"
                    style={{ color: 'var(--teal)' }}
                  >
                    Answer:
                  </p>
                  <div style={{ color: 'var(--text)' }}>
                    <MathRenderer content={answer} />
                  </div>
                </motion.div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
