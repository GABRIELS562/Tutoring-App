'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Trophy, RefreshCw, BookOpen, ArrowRight, Loader2, Heart } from 'lucide-react'
import Link from 'next/link'
import QuestionCard from './QuestionCard'
import type { QuestionWithDetails } from '@/db/queries/questions'
import { recordAnswer, completeQuiz } from '@/app/(app)/topics/[slug]/practice/actions'

type QuizEngineProps = {
  topicSlug: string
  grade: number
  userId: string
  difficulty?: number
  initialQuestions?: QuestionWithDetails[]
  /** True only when the database is unconfigured (no DATABASE_URL). */
  isDemo: boolean
  /** Remaining hearts for this session, from the session user. */
  hearts?: number
  /** Premium users have unlimited hearts. */
  isPremium?: boolean
}

// Mock questions for demo when database isn't connected
const mockQuestions: QuestionWithDetails[] = [
  {
    id: '1',
    topicId: 'trig-1',
    topicSlug: 'trig-gr11',
    topicName: 'Trigonometry',
    source: 'angelo',
    year: 2024,
    examType: 'custom',
    questionText: 'Simplify $\\sin 210°$',
    marks: 2,
    difficulty: 1,
    hasDiagram: false,
    diagramUrl: null,
    isMultipleChoice: true,
    options: [
      { id: 'a1', optionLetter: 'A', optionText: '$\\frac{1}{2}$', isCorrect: false },
      { id: 'a2', optionLetter: 'B', optionText: '$-\\frac{1}{2}$', isCorrect: true },
      { id: 'a3', optionLetter: 'C', optionText: '$\\frac{\\sqrt{3}}{2}$', isCorrect: false },
      { id: 'a4', optionLetter: 'D', optionText: '$-\\frac{\\sqrt{3}}{2}$', isCorrect: false },
    ],
    steps: [
      { id: 's1', stepNumber: 1, instruction: 'Identify the quadrant: 210° is in Quadrant III (180° < 210° < 270°)', hint: 'CAST diagram: only Tangent is positive in Q3', correctAnswer: '210° = 180° + 30°', explanation: 'We express 210° as 180° + 30° to use reduction formulae' },
      { id: 's2', stepNumber: 2, instruction: 'Apply the reduction formula for sin(180° + θ)', hint: 'In Q3, sine is negative', correctAnswer: '\\sin(180° + 30°) = -\\sin 30°', explanation: null },
      { id: 's3', stepNumber: 3, instruction: 'Evaluate sin 30° using special angles', hint: 'Remember the special angles table', correctAnswer: '-\\sin 30° = -\\frac{1}{2}', explanation: 'sin 30° = 1/2 from the special angles table' },
    ],
  },
  {
    id: '2',
    topicId: 'trig-1',
    topicSlug: 'trig-gr11',
    topicName: 'Trigonometry',
    source: 'angelo',
    year: 2024,
    examType: 'custom',
    questionText: 'If $\\sin\\theta = \\frac{3}{5}$ and $\\theta \\in [90°, 180°]$, find $\\cos\\theta$.',
    marks: 3,
    difficulty: 2,
    hasDiagram: false,
    diagramUrl: null,
    isMultipleChoice: true,
    options: [
      { id: 'b1', optionLetter: 'A', optionText: '$\\frac{4}{5}$', isCorrect: false },
      { id: 'b2', optionLetter: 'B', optionText: '$-\\frac{4}{5}$', isCorrect: true },
      { id: 'b3', optionLetter: 'C', optionText: '$\\frac{3}{5}$', isCorrect: false },
      { id: 'b4', optionLetter: 'D', optionText: '$-\\frac{3}{5}$', isCorrect: false },
    ],
    steps: [
      { id: 's1', stepNumber: 1, instruction: 'Use the identity sin²θ + cos²θ = 1', hint: 'This is the fundamental Pythagorean identity', correctAnswer: '\\cos^2\\theta = 1 - \\sin^2\\theta', explanation: null },
      { id: 's2', stepNumber: 2, instruction: 'Substitute sin θ = 3/5', hint: null, correctAnswer: '\\cos^2\\theta = 1 - \\left(\\frac{3}{5}\\right)^2 = 1 - \\frac{9}{25} = \\frac{16}{25}', explanation: null },
      { id: 's3', stepNumber: 3, instruction: 'Take the square root and determine the sign', hint: 'θ is in Q2, so cosine is negative', correctAnswer: '\\cos\\theta = -\\frac{4}{5}', explanation: 'Since θ ∈ [90°, 180°] (Quadrant II), cos θ is negative' },
    ],
  },
  {
    id: '3',
    topicId: 'trig-1',
    topicSlug: 'trig-gr11',
    topicName: 'Trigonometry',
    source: 'nsc_dbe',
    year: 2023,
    examType: 'november',
    questionText: 'Solve for $x$ if $2\\sin x - 1 = 0$ and $x \\in [0°, 360°]$.',
    marks: 4,
    difficulty: 2,
    hasDiagram: false,
    diagramUrl: null,
    isMultipleChoice: true,
    options: [
      { id: 'c1', optionLetter: 'A', optionText: '$x = 30°$ only', isCorrect: false },
      { id: 'c2', optionLetter: 'B', optionText: '$x = 30°$ or $x = 150°$', isCorrect: true },
      { id: 'c3', optionLetter: 'C', optionText: '$x = 60°$ or $x = 120°$', isCorrect: false },
      { id: 'c4', optionLetter: 'D', optionText: '$x = 150°$ only', isCorrect: false },
    ],
    steps: [
      { id: 's1', stepNumber: 1, instruction: 'Isolate sin x', hint: null, correctAnswer: '2\\sin x = 1 \\implies \\sin x = \\frac{1}{2}', explanation: null },
      { id: 's2', stepNumber: 2, instruction: 'Find the reference angle', hint: 'What angle has sin = 1/2?', correctAnswer: '\\alpha = 30°', explanation: 'sin 30° = 1/2 from special angles' },
      { id: 's3', stepNumber: 3, instruction: 'Since sin x > 0, x is in Q1 or Q2', hint: 'Use CAST diagram', correctAnswer: 'x = 30° \\text{ (Q1)} \\quad \\text{or} \\quad x = 180° - 30° = 150° \\text{ (Q2)}', explanation: null },
    ],
  },
  {
    id: '4',
    topicId: 'trig-1',
    topicSlug: 'trig-gr11',
    topicName: 'Trigonometry',
    source: 'angelo',
    year: 2024,
    examType: 'custom',
    questionText: 'Calculate the area of triangle ABC if AB = 8 cm, BC = 6 cm, and $\\hat{B} = 60°$.',
    marks: 3,
    difficulty: 1,
    hasDiagram: false,
    diagramUrl: null,
    isMultipleChoice: true,
    options: [
      { id: 'd1', optionLetter: 'A', optionText: '$24$ cm²', isCorrect: false },
      { id: 'd2', optionLetter: 'B', optionText: '$12\\sqrt{3}$ cm²', isCorrect: true },
      { id: 'd3', optionLetter: 'C', optionText: '$24\\sqrt{3}$ cm²', isCorrect: false },
      { id: 'd4', optionLetter: 'D', optionText: '$48$ cm²', isCorrect: false },
    ],
    steps: [
      { id: 's1', stepNumber: 1, instruction: 'Identify this as a SAS problem - use the Area Rule', hint: 'Two sides and the included angle', correctAnswer: '\\text{Area} = \\frac{1}{2}ab\\sin C', explanation: null },
      { id: 's2', stepNumber: 2, instruction: 'Substitute the values', hint: null, correctAnswer: '\\text{Area} = \\frac{1}{2} \\times 8 \\times 6 \\times \\sin 60°', explanation: null },
      { id: 's3', stepNumber: 3, instruction: 'Calculate using sin 60° = √3/2', hint: 'Special angle value', correctAnswer: '\\text{Area} = \\frac{1}{2} \\times 8 \\times 6 \\times \\frac{\\sqrt{3}}{2} = 12\\sqrt{3} \\text{ cm}^2', explanation: '≈ 20.78 cm²' },
    ],
  },
  {
    id: '5',
    topicId: 'trig-1',
    topicSlug: 'trig-gr11',
    topicName: 'Trigonometry',
    source: 'kzn',
    year: 2023,
    examType: 'trial',
    questionText: 'Prove that $\\tan\\theta = \\frac{\\sin\\theta}{\\cos\\theta}$ is equivalent to which identity?',
    marks: 2,
    difficulty: 1,
    hasDiagram: false,
    diagramUrl: null,
    isMultipleChoice: true,
    options: [
      { id: 'e1', optionLetter: 'A', optionText: '$\\sin^2\\theta + \\cos^2\\theta = 1$', isCorrect: false },
      { id: 'e2', optionLetter: 'B', optionText: '$\\frac{\\sin\\theta}{\\cos\\theta} = \\frac{\\text{opp}}{\\text{adj}}$', isCorrect: true },
      { id: 'e3', optionLetter: 'C', optionText: '$\\tan\\theta = \\sin\\theta \\cdot \\cos\\theta$', isCorrect: false },
      { id: 'e4', optionLetter: 'D', optionText: '$\\tan^2\\theta = \\sin^2\\theta - \\cos^2\\theta$', isCorrect: false },
    ],
    steps: [
      { id: 's1', stepNumber: 1, instruction: 'Recall the definitions of sin and cos', hint: 'SOH CAH TOA', correctAnswer: '\\sin\\theta = \\frac{\\text{opp}}{\\text{hyp}}, \\quad \\cos\\theta = \\frac{\\text{adj}}{\\text{hyp}}', explanation: null },
      { id: 's2', stepNumber: 2, instruction: 'Divide sin θ by cos θ', hint: 'When dividing fractions, multiply by the reciprocal', correctAnswer: '\\frac{\\sin\\theta}{\\cos\\theta} = \\frac{\\text{opp}/\\text{hyp}}{\\text{adj}/\\text{hyp}} = \\frac{\\text{opp}}{\\text{adj}}', explanation: 'The hypotenuse cancels out' },
      { id: 's3', stepNumber: 3, instruction: 'Recognize this as tan θ', hint: 'TOA = Tan Opposite Adjacent', correctAnswer: '\\tan\\theta = \\frac{\\text{opp}}{\\text{adj}}', explanation: 'This confirms the quotient identity' },
    ],
  },
]

export default function QuizEngine({
  topicSlug,
  grade: _grade,
  userId,
  difficulty: _difficulty,
  initialQuestions,
  isDemo,
  hearts,
  isPremium = false,
}: QuizEngineProps) {
  // Real questions from the database win. Mock questions are only ever
  // shown in demo mode (no DATABASE_URL) - with a real, configured
  // database and zero questions, we show an empty state instead.
  const hasRealQuestions = Boolean(initialQuestions && initialQuestions.length > 0)
  const usingMockQuestions = !hasRealQuestions && isDemo
  const questionsToUse = hasRealQuestions ? initialQuestions! : usingMockQuestions ? mockQuestions : []

  const [questions, setQuestions] = useState<QuestionWithDetails[]>(questionsToUse)
  const [currentIndex, setCurrentIndex] = useState(0)
  const [answers, setAnswers] = useState<boolean[]>([])
  const [score, setScore] = useState(0)
  const [complete, setComplete] = useState(false)
  const loading = false // No async loading needed with fallback
  const [totalXpEarned, setTotalXpEarned] = useState(0)
  // Blocking only takes effect once the student tries to move past the
  // question that used their last heart - they still get to see that
  // question's feedback/step solution first.
  const [blockedOnHearts, setBlockedOnHearts] = useState(false)

  // These props are accepted for future difficulty-aware retry logic
  // and grade-scoped question fetching (already applied server-side by
  // the caller via getQuestionsByTopic).
  void _grade
  void _difficulty

  // Progress isn't persisted for demo mode, for mock/placeholder
  // questions (no real question/topic to attach it to), or for the
  // demo-user fallback id (defense in depth if isDemo and userId were
  // ever to disagree - the server actions derive the real id from the
  // session regardless, but there is nothing to save for 'demo-user').
  const shouldPersist = !isDemo && !usingMockQuestions && userId !== 'demo-user'

  const wrongCount = answers.filter((a) => a === false).length
  const heartsRemaining = Math.max(0, (hearts ?? 5) - wrongCount)
  const outOfHearts = !isPremium && heartsRemaining <= 0

  const handleAnswer = async (selectedLetter: string, correct: boolean) => {
    const newAnswers = [...answers, correct]
    setAnswers(newAnswers)

    if (correct) {
      setScore(score + 1)
      setTotalXpEarned(totalXpEarned + 10)
    }

    if (shouldPersist) {
      try {
        await recordAnswer(questions[currentIndex].id, correct)
      } catch (error) {
        console.error('Failed to record answer:', error)
      }
    }
  }

  const handleNext = async () => {
    if (outOfHearts) {
      setBlockedOnHearts(true)
      return
    }

    if (currentIndex < questions.length - 1) {
      setCurrentIndex(currentIndex + 1)
      return
    }

    setComplete(true)

    if (shouldPersist) {
      try {
        await completeQuiz(totalXpEarned)
      } catch (error) {
        console.error('Failed to save XP:', error)
      }
    }
  }

  const handleRetry = () => {
    setCurrentIndex(0)
    setAnswers([])
    setScore(0)
    setComplete(false)
    setTotalXpEarned(0)
    setBlockedOnHearts(false)
    // Shuffle questions
    setQuestions([...questions].sort(() => Math.random() - 0.5))
  }

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <Loader2 className="w-8 h-8 animate-spin mb-4" style={{ color: 'var(--accent-red)' }} />
        <p style={{ color: 'var(--muted-custom)' }}>Loading questions...</p>
      </div>
    )
  }

  if (questions.length === 0) {
    return (
      <div className="text-center py-20">
        <p className="text-lg mb-4" style={{ color: 'var(--text)' }}>
          No questions yet for this topic.
        </p>
        <Link
          href={`/topics/${topicSlug}`}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-lg"
          style={{ background: 'var(--accent-red)', color: 'white' }}
        >
          <BookOpen className="w-4 h-4" />
          Back to notes
        </Link>
      </div>
    )
  }

  if (blockedOnHearts && !complete) {
    return (
      <div className="text-center py-20">
        <p className="text-lg font-semibold mb-2" style={{ color: 'var(--text)' }}>
          Out of hearts
        </p>
        <p className="text-sm mb-4" style={{ color: 'var(--muted-custom)' }}>
          Come back tomorrow for a fresh set of hearts, or go Premium for unlimited practice.
        </p>
        <Link
          href={`/topics/${topicSlug}`}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-lg"
          style={{ background: 'var(--accent-red)', color: 'white' }}
        >
          <BookOpen className="w-4 h-4" />
          Back to notes
        </Link>
      </div>
    )
  }

  if (complete) {
    const accuracy = Math.round((score / questions.length) * 100)

    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="max-w-md mx-auto text-center py-8"
      >
        {/* Trophy Icon */}
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: 'spring', delay: 0.2 }}
          className="w-20 h-20 rounded-full mx-auto mb-6 flex items-center justify-center"
          style={{
            background: accuracy >= 80 ? 'rgba(244, 162, 97, 0.2)' : 'rgba(42, 157, 143, 0.2)',
          }}
        >
          <Trophy
            className="w-10 h-10"
            style={{ color: accuracy >= 80 ? 'var(--gold)' : 'var(--teal)' }}
          />
        </motion.div>

        {/* Score */}
        <h2 className="text-2xl font-bold mb-2" style={{ color: 'var(--text)' }}>
          {accuracy >= 80 ? 'Excellent work!' : accuracy >= 60 ? 'Good effort!' : 'Keep practicing!'}
        </h2>
        <p className="text-4xl font-bold mb-4" style={{ color: 'var(--text)' }}>
          {score} / {questions.length}
        </p>

        {/* XP Earned */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="mb-6"
        >
          <p className="text-sm mb-1" style={{ color: 'var(--muted-custom)' }}>
            XP Earned
          </p>
          <p
            className="text-3xl font-bold"
            style={{ color: 'var(--gold)' }}
          >
            +{totalXpEarned}
          </p>
        </motion.div>

        {/* Accuracy */}
        <div
          className="inline-block px-4 py-2 rounded-full mb-8"
          style={{
            background: accuracy >= 80
              ? 'rgba(42, 157, 143, 0.2)'
              : accuracy >= 60
                ? 'rgba(244, 162, 97, 0.2)'
                : 'rgba(230, 57, 70, 0.2)',
            color: accuracy >= 80
              ? 'var(--teal)'
              : accuracy >= 60
                ? 'var(--gold)'
                : 'var(--accent-red)',
          }}
        >
          {accuracy}% accuracy
        </div>

        {/* Action Buttons */}
        <div className="space-y-3">
          <button
            onClick={handleRetry}
            className="w-full flex items-center justify-center gap-2 px-5 py-3 rounded-lg font-semibold transition-all"
            style={{
              background: 'var(--accent-red)',
              color: 'white',
            }}
          >
            <RefreshCw className="w-4 h-4" />
            Try again
          </button>

          <Link
            href={`/topics/${topicSlug}`}
            className="w-full flex items-center justify-center gap-2 px-5 py-3 rounded-lg font-semibold transition-all"
            style={{
              background: 'var(--surface2)',
              color: 'var(--text)',
              border: '1px solid var(--border-custom)',
            }}
          >
            <BookOpen className="w-4 h-4" />
            Back to notes
          </Link>

          <Link
            href="/subjects/maths"
            className="w-full flex items-center justify-center gap-2 px-5 py-3 rounded-lg font-semibold transition-all"
            style={{
              background: 'transparent',
              color: 'var(--accent-red)',
            }}
          >
            Next topic
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </motion.div>
    )
  }

  return (
    <div>
      {/* Progress Bar */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium" style={{ color: 'var(--text)' }}>
            Question {currentIndex + 1} of {questions.length}
          </span>
          <span className="flex items-center gap-2 text-sm" style={{ color: 'var(--muted-custom)' }}>
            <span>Score: {score}/{answers.length}</span>
            {isPremium ? (
              <span className="flex items-center gap-1" aria-label="Unlimited hearts (Premium)">
                <Heart className="w-3.5 h-3.5" style={{ color: 'var(--accent-red)' }} />
                <span>Unlimited</span>
              </span>
            ) : (
              <span className="flex items-center gap-1" aria-label={`${heartsRemaining} hearts remaining`}>
                <Heart className="w-3.5 h-3.5" style={{ color: 'var(--accent-red)' }} />
                <span>{heartsRemaining}</span>
              </span>
            )}
          </span>
        </div>
        <div
          className="h-2 rounded-full overflow-hidden"
          style={{ background: 'var(--surface2)' }}
        >
          <motion.div
            className="h-full rounded-full"
            style={{ background: 'var(--accent-red)' }}
            initial={{ width: 0 }}
            animate={{ width: `${((currentIndex + 1) / questions.length) * 100}%` }}
            transition={{ duration: 0.3 }}
          />
        </div>
      </div>

      {/* Question Card */}
      <AnimatePresence mode="wait">
        <QuestionCard
          key={questions[currentIndex].id}
          question={questions[currentIndex]}
          onAnswer={handleAnswer}
          onNext={handleNext}
        />
      </AnimatePresence>
    </div>
  )
}
