'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { ArrowRight, MessageCircle, Loader2 } from 'lucide-react'
import MathRenderer from '@/components/math/MathRenderer'
import StepSolution from '@/components/math/StepSolution'

type Option = {
  id: string
  optionLetter: string | null
  optionText: string
  isCorrect: boolean | null
}

type Step = {
  id: string
  stepNumber: number
  instruction: string
  hint: string | null
  correctAnswer: string
  explanation: string | null
}

type QuestionCardProps = {
  question: {
    id: string
    topicName: string
    questionText: string
    difficulty: number | null
    options: Option[]
    steps: Step[]
  }
  onAnswer: (selectedLetter: string, correct: boolean) => void
  onNext: () => void
}

export default function QuestionCard({
  question,
  onAnswer,
  onNext,
}: QuestionCardProps) {
  const [selectedLetter, setSelectedLetter] = useState<string | null>(null)
  const [answered, setAnswered] = useState(false)
  const [askingAngelo, setAskingAngelo] = useState(false)
  const [angeloResponse, setAngeloResponse] = useState<string | null>(null)
  const [angeloError, setAngeloError] = useState<string | null>(null)

  // Check if the selected answer was incorrect
  const wasIncorrect = answered && selectedLetter &&
    question.options.find(o => o.optionLetter === selectedLetter)?.isCorrect === false

  const handleAskAngelo = async () => {
    setAskingAngelo(true)
    setAngeloError(null)

    try {
      const response = await fetch('/api/ai-hint', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          mode: 'wrong_answer',
          questionText: question.questionText,
          selectedAnswer: selectedLetter,
          correctAnswer: question.options.find(o => o.isCorrect)?.optionLetter,
          topicName: question.topicName,
        }),
      })

      const data = await response.json()

      if (response.status === 429) {
        setAngeloError(data.message || 'Daily hint limit reached. Upgrade to Premium for unlimited hints!')
        return
      }

      if (!response.ok) {
        throw new Error(data.error || 'Failed to get help')
      }

      setAngeloResponse(data.hint)
    } catch (error) {
      setAngeloError('Something went wrong. Please try again.')
      console.error('Ask Angelo error:', error)
    } finally {
      setAskingAngelo(false)
    }
  }

  const handleOptionClick = (option: Option) => {
    if (answered) return

    const letter = option.optionLetter || ''
    setSelectedLetter(letter)
    setAnswered(true)
    onAnswer(letter, option.isCorrect || false)
  }

  const getOptionStyle = (option: Option) => {
    if (!answered) {
      return {
        background: 'var(--surface2)',
        border: '1px solid var(--border-custom)',
        color: 'var(--text)',
      }
    }

    if (option.isCorrect) {
      return {
        background: 'rgba(42, 157, 143, 0.2)',
        border: '2px solid var(--teal)',
        color: 'var(--teal)',
      }
    }

    if (option.optionLetter === selectedLetter && !option.isCorrect) {
      return {
        background: 'rgba(230, 57, 70, 0.2)',
        border: '2px solid var(--accent-red)',
        color: 'var(--accent-red)',
      }
    }

    return {
      background: 'var(--surface2)',
      border: '1px solid var(--border-custom)',
      color: 'var(--muted-custom)',
      opacity: 0.6,
    }
  }

  const getDifficultyStars = (difficulty: number | null) => {
    const d = difficulty || 1
    return '★'.repeat(d) + '☆'.repeat(3 - d)
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="rounded-xl p-5 md:p-6"
      style={{ background: 'var(--surface)', border: '1px solid var(--border-custom)' }}
    >
      {/* Topic Tag */}
      <div className="flex items-center gap-2 mb-4">
        <span
          className="px-2.5 py-1 rounded-full text-xs font-medium text-white"
          style={{ background: 'var(--accent-red)' }}
        >
          {question.topicName}
        </span>
        <span
          className="text-xs"
          style={{ color: 'var(--gold)' }}
        >
          {getDifficultyStars(question.difficulty)}
        </span>
      </div>

      {/* Question Text */}
      <div className="mb-6">
        <div className="text-base md:text-lg" style={{ color: 'var(--text)' }}>
          <MathRenderer content={question.questionText} />
        </div>
      </div>

      {/* Options Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-4">
        {question.options.map((option) => (
          <button
            key={option.id}
            onClick={() => handleOptionClick(option)}
            disabled={answered}
            className="flex items-start gap-3 p-4 rounded-lg text-left transition-all"
            style={getOptionStyle(option)}
          >
            {/* Letter Badge */}
            <span
              className="flex-shrink-0 w-8 h-8 rounded-lg flex items-center justify-center font-bold text-sm"
              style={{
                background: answered && option.isCorrect
                  ? 'var(--teal)'
                  : answered && option.optionLetter === selectedLetter && !option.isCorrect
                    ? 'var(--accent-red)'
                    : 'var(--surface)',
                color: answered && (option.isCorrect || option.optionLetter === selectedLetter)
                  ? 'white'
                  : 'var(--text)',
              }}
            >
              {option.optionLetter}
            </span>

            {/* Option Text */}
            <span className="flex-1 text-sm pt-1">
              <MathRenderer content={option.optionText} />
            </span>
          </button>
        ))}
      </div>

      {/* Step Solution (shown after answer) */}
      {answered && question.steps && question.steps.length > 0 && (
        <StepSolution steps={question.steps} />
      )}

      {/* Ask Angelo Button (shown after incorrect answer) */}
      {wasIncorrect && !angeloResponse && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.3 }}
          className="mt-4"
        >
          <button
            onClick={handleAskAngelo}
            disabled={askingAngelo}
            className="flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-all hover:opacity-90 disabled:opacity-50"
            style={{
              background: 'rgba(42, 157, 143, 0.15)',
              color: 'var(--teal)',
              border: '1px solid var(--teal)',
            }}
          >
            {askingAngelo ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Angelo is thinking...
              </>
            ) : (
              <>
                <MessageCircle className="w-4 h-4" />
                Ask Angelo why I got this wrong
              </>
            )}
          </button>
          {angeloError && (
            <p className="mt-2 text-sm" style={{ color: 'var(--accent-red)' }}>
              {angeloError}
            </p>
          )}
        </motion.div>
      )}

      {/* Angelo's Response */}
      {angeloResponse && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-4 p-4 rounded-lg"
          style={{
            background: 'rgba(42, 157, 143, 0.1)',
            border: '1px solid var(--teal)',
          }}
        >
          <div className="flex items-start gap-3">
            <div
              className="w-8 h-8 rounded-full flex items-center justify-center shrink-0 text-xs font-bold text-white"
              style={{ background: 'var(--teal)' }}
            >
              AT
            </div>
            <div>
              <p className="text-sm font-medium mb-1" style={{ color: 'var(--teal)' }}>
                Angelo says:
              </p>
              <p className="text-sm" style={{ color: 'var(--text)' }}>
                {angeloResponse}
              </p>
            </div>
          </div>
        </motion.div>
      )}

      {/* Next Button (shown after answer) */}
      {answered && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.5 }}
          className="mt-6 flex justify-end"
        >
          <button
            onClick={onNext}
            className="flex items-center gap-2 px-5 py-2.5 rounded-lg font-semibold text-white transition-all hover:opacity-90"
            style={{ background: 'var(--accent-red)' }}
          >
            Next question
            <ArrowRight className="w-4 h-4" />
          </button>
        </motion.div>
      )}
    </motion.div>
  )
}
