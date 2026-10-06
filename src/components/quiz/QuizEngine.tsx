'use client'

import { useEffect, useRef, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Trophy, RefreshCw, BookOpen, ArrowRight, Loader2, Heart } from 'lucide-react'
import Link from 'next/link'
import QuestionCard from './QuestionCard'
import { useTranslations } from 'next-intl'
import { useMotionSafe } from '@/hooks/useMotionSafe'
import type { QuestionWithDetails } from '@/db/queries/questions'
import { recordAnswer, completeQuiz } from '@/app/(app)/topics/[slug]/practice/actions'
import { XP_PER_CORRECT_ANSWER, MAX_HEARTS } from '@/lib/game-rules'
import { demoQuestions } from '@/content/demo-questions'

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

export default function QuizEngine({
  topicSlug,
  grade: _grade,
  userId,
  difficulty,
  initialQuestions,
  isDemo,
  hearts,
  isPremium = false,
}: QuizEngineProps) {
  const { transition, variant } = useMotionSafe()
  const t = useTranslations('quiz')
  const tPractice = useTranslations('practice')
  // Real questions from the database win. Mock questions are only ever
  // shown in demo mode (no DATABASE_URL) - with a real, configured
  // database and zero questions, we show an empty state instead.
  const hasRealQuestions = Boolean(initialQuestions && initialQuestions.length > 0)
  const usingDemoQuestions = !hasRealQuestions && isDemo
  /**
   * Demo questions are filtered here because nothing else can filter them.
   * With no DATABASE_URL the page never calls getQuestionsByTopic(), so
   * `difficulty` never reaches a query and the Easy/Medium/Hard buttons
   * had no effect at all in demo mode - they changed the URL and the
   * same five questions stayed on screen.
   *
   * An empty result is left empty rather than falling back to the full
   * set: the demo fixture has no difficulty-3 questions, and showing easy
   * ones under "Hard" would misrepresent the feature. The empty state
   * below says so honestly, which is what a real database with no
   * questions at that level would also show.
   */
  const demoForDifficulty =
    difficulty === undefined
      ? demoQuestions
      : demoQuestions.filter((q) => q.difficulty === difficulty)
  const questionsToUse = hasRealQuestions
    ? initialQuestions!
    : usingDemoQuestions
      ? demoForDifficulty
      : []

  const [questions, setQuestions] = useState<QuestionWithDetails[]>(questionsToUse)
  const [currentIndex, setCurrentIndex] = useState(0)
  /**
   * AnimatePresence unmounts the old card when the question changes, which
   * destroys the button the student just pressed - so focus fell back to
   * <body> after EVERY question and a keyboard or screen-reader user had
   * to navigate down from the top of the page again.
   *
   * Focus moves to the new question instead. Skipped on first render, so
   * arriving on the page does not yank focus away from the skip link.
   */
  const questionRef = useRef<HTMLDivElement>(null)
  const isFirstQuestion = useRef(true)

  useEffect(() => {
    if (isFirstQuestion.current) {
      isFirstQuestion.current = false
      return
    }
    questionRef.current?.focus()
  }, [currentIndex])
  const [answers, setAnswers] = useState<boolean[]>([])
  const [score, setScore] = useState(0)
  const [complete, setComplete] = useState(false)
  const loading = false // No async loading needed with fallback
  const [totalXpEarned, setTotalXpEarned] = useState(0)
  // Blocking only takes effect once the student tries to move past the
  // question that used their last heart - they still get to see that
  // question's feedback/step solution first.
  const [blockedOnHearts, setBlockedOnHearts] = useState(false)
  // Set when the last recordAnswer/completeQuiz call failed to persist;
  // the answer/XP already reflected in local state was NOT counted
  // server-side, so we show an inline retry instead of pretending it
  // saved. Holds what to retry (a question answer, or the final
  // completeQuiz call).
  const [saveError, setSaveError] = useState<{ retry: () => void } | null>(null)
  /**
   * True while this question's answer is still in flight.
   *
   * Without it the Next button appeared the instant the card flipped to
   * "answered", so a student on a slow connection could answer Q1, press
   * Next, answer Q2, and only THEN have Q1's save fail - putting the "not
   * saved, retry" banner and the Next block on Q2, a question that had
   * saved perfectly well. Blocking until the save settles keeps the error
   * attached to the question it belongs to.
   */
  const [isSaving, setIsSaving] = useState(false)

  // grade is accepted for future grade-scoped question fetching (already
  // applied server-side by the caller via getQuestionsByTopic). difficulty
  // is no longer in that category - it now filters the demo question set,
  // which is the only question set nothing else can filter.
  void _grade

  // Progress isn't persisted for demo mode, for mock/placeholder
  // questions (no real question/topic to attach it to), or for the
  // demo-user fallback id (defense in depth if isDemo and userId were
  // ever to disagree - the server actions derive the real id from the
  // session regardless, but there is nothing to save for 'demo-user').
  const shouldPersist = !isDemo && !usingDemoQuestions && userId !== 'demo-user'

  const wrongCount = answers.filter((a) => a === false).length
  const heartsRemaining = Math.max(0, (hearts ?? MAX_HEARTS) - wrongCount)
  const outOfHearts = !isPremium && heartsRemaining <= 0

  // XP is display-only here, summed from what the server actually
  // awarded (recordAnswer's xpEarned) - never assumed client-side. In
  // demo mode / for mock questions there is no server award to sum, so
  // we show an optimistic client-only total instead (it's never
  // persisted either way).
  // Sends WHICH OPTION was chosen, not whether it was right. The server
  // reads the answer key; the client's own verdict is used for the
  // immediate UI only and is never what gets persisted.
  const persistAnswer = async (questionId: string, selectedLetter: string) => {
    try {
      const result = await recordAnswer(questionId, selectedLetter)

      if (!result.ok) {
        if (result.error === 'out_of_hearts') {
          setBlockedOnHearts(true)
        } else {
          setSaveError({ retry: () => persistAnswer(questionId, selectedLetter) })
        }
        return
      }

      setSaveError(null)
      if ('xpEarned' in result && result.xpEarned) {
        setTotalXpEarned((xp) => xp + result.xpEarned)
      }
    } catch (error) {
      console.error('Failed to record answer:', error)
      setSaveError({ retry: () => persistAnswer(questionId, selectedLetter) })
    }
  }

  const handleAnswer = async (selectedLetter: string, correct: boolean) => {
    const newAnswers = [...answers, correct]
    setAnswers(newAnswers)

    if (correct) {
      setScore(score + 1)
    }

    if (!shouldPersist) {
      // Demo/mock questions: nothing to save, so show an optimistic
      // client-only XP total.
      if (correct) {
        setTotalXpEarned((xp) => xp + XP_PER_CORRECT_ANSWER)
      }
      return
    }

    setIsSaving(true)
    try {
      await persistAnswer(questions[currentIndex].id, selectedLetter)
    } finally {
      setIsSaving(false)
    }
  }

  const persistCompleteQuiz = async () => {
    try {
      const result = await completeQuiz()
      if (!result.ok) {
        setSaveError({ retry: persistCompleteQuiz })
        return
      }
      setSaveError(null)
    } catch (error) {
      console.error('Failed to save streak:', error)
      setSaveError({ retry: persistCompleteQuiz })
    }
  }

  const handleNext = async () => {
    // Defense in depth: the Next button is already disabled while
    // saveError is set (QuestionCard's nextDisabled prop), but guard
    // here too in case it's ever reached another way (e.g. a
    // programmatic call). The unsaved answer must be retried
    // successfully - or the save error cleared by a successful retry -
    // before the student can move on.
    if (saveError || isSaving) {
      return
    }

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
      await persistCompleteQuiz()
    }
  }

  const handleRetry = () => {
    setCurrentIndex(0)
    setAnswers([])
    setScore(0)
    setComplete(false)
    setTotalXpEarned(0)
    setBlockedOnHearts(false)
    setSaveError(null)
    // Shuffle questions
    setQuestions([...questions].sort(() => Math.random() - 0.5))
  }

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <Loader2 className="w-8 h-8 animate-spin mb-4" style={{ color: 'var(--accent-red-text)' }} />
        <p style={{ color: 'var(--muted-custom)' }}>{t('loadingQuestions')}</p>
      </div>
    )
  }

  if (questions.length === 0) {
    return (
      <div className="text-center py-20">
        <p className="text-lg mb-4" style={{ color: 'var(--text)' }}>
          {t('noQuestionsYet')}
        </p>
        <Link
          href={`/topics/${topicSlug}`}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-lg"
          style={{ background: 'var(--accent-red)', color: 'white' }}
        >
          <BookOpen className="w-4 h-4" />
          {tPractice('backToNotes')}
        </Link>
      </div>
    )
  }

  if (blockedOnHearts && !complete) {
    return (
      <div className="text-center py-20">
        <p className="text-lg font-semibold mb-2" style={{ color: 'var(--text)' }}>
          {t('outOfHearts')}
        </p>
        <p className="text-sm mb-4" style={{ color: 'var(--muted-custom)' }}>
          {t('outOfHeartsMessage')}
        </p>
        <Link
          href={`/topics/${topicSlug}`}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-lg"
          style={{ background: 'var(--accent-red)', color: 'white' }}
        >
          <BookOpen className="w-4 h-4" />
          {tPractice('backToNotes')}
        </Link>
      </div>
    )
  }

  if (complete) {
    const accuracy = Math.round((score / questions.length) * 100)

    return (
      <motion.div
        // Scale only, never fade - see the note in QuestionCard. The results
        // screen carries the score and the XP the student just earned; it
        // must not be invisible if the animation stalls.
        initial={variant({ scale: 0.95 }, { scale: 1 })}
        animate={{ scale: 1 }}
        transition={transition({})}
        className="max-w-md mx-auto text-center py-8"
      >
        {/* Trophy Icon */}
        <motion.div
          initial={variant({ scale: 0 }, { scale: 1 })}
          animate={{ scale: 1 }}
          transition={transition({ type: 'spring', delay: 0.2 })}
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
          {accuracy >= 80 ? t('excellentWork') : accuracy >= 60 ? t('goodEffort') : t('keepPracticing')}
        </h2>
        <p className="text-4xl font-bold mb-4" style={{ color: 'var(--text)' }}>
          {score} / {questions.length}
        </p>

        {/* XP Earned */}
        <motion.div
          initial={variant({ y: 20 }, { y: 0 })}
          animate={{ y: 0 }}
          transition={transition({ delay: 0.4 })}
          className="mb-6"
        >
          <p className="text-sm mb-1" style={{ color: 'var(--muted-custom)' }}>
            {t('xpEarned')}
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
                : 'rgba(220, 30, 46, 0.2)',
            // Text lane. The low-accuracy branch carried the fill red, so
            // the one message a struggling student gets was the least
            // readable thing on the screen.
            color: accuracy >= 80
              ? 'var(--teal)'
              : accuracy >= 60
                ? 'var(--gold)'
                : 'var(--accent-red-text)',
          }}
        >
          {t('accuracyPercent', { percent: accuracy })}
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
            {t('tryAgain')}
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
            {tPractice('backToNotes')}
          </Link>

          <Link
            href="/subjects/maths"
            className="w-full flex items-center justify-center gap-2 px-5 py-3 rounded-lg font-semibold transition-all"
            style={{
              background: 'transparent',
              color: 'var(--accent-red-text)',
            }}
          >
            {t('nextTopic')}
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </motion.div>
    )
  }

  // Named because the reduced-motion path has to start the bar AT this
  // width rather than animate to it, and the two must not drift apart.
  const progressWidth = `${((currentIndex + 1) / questions.length) * 100}%`

  return (
    <div>
      {/* Progress Bar */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium" style={{ color: 'var(--text)' }}>
            {t('questionOfTotal', { current: currentIndex + 1, total: questions.length })}
          </span>
          <span className="flex items-center gap-2 text-sm" style={{ color: 'var(--muted-custom)' }}>
            <span>{t('scoreOf', { score, total: answers.length })}</span>
            {isPremium ? (
              <span className="flex items-center gap-1" aria-label={t('unlimitedHeartsLabel')}>
                <Heart className="w-3.5 h-3.5" style={{ color: 'var(--accent-red-text)' }} />
                <span>{t('unlimited')}</span>
              </span>
            ) : (
              <span className="flex items-center gap-1" aria-label={t('heartsRemainingLabel', { count: heartsRemaining })}>
                <Heart className="w-3.5 h-3.5" style={{ color: 'var(--accent-red-text)' }} />
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
            initial={variant({ width: 0 }, { width: progressWidth })}
            animate={{ width: progressWidth }}
            transition={transition({ duration: 0.3 })}
          />
        </div>
      </div>

      {/* Save error (inline, non-blocking) */}
      {saveError && (
        <div
          className="mb-4 flex items-center justify-between gap-3 rounded-lg px-3 py-2 text-sm"
          style={{
            background: 'rgba(230, 57, 70, 0.1)',
            border: '1px solid var(--accent-red)',
            color: 'var(--accent-red-text)',
          }}
        >
          <span>{t('notSavedRetry')}</span>
          <button
            onClick={() => saveError.retry()}
            className="font-semibold underline"
          >
            {t('retryButton')}
          </button>
        </div>
      )}

      {/* Announced on its own, because the card itself is replaced rather
          than updated and a screen reader has no other signal that the
          question changed. */}
      <div aria-live="polite" className="sr-only">
        {t('questionOfTotal', { current: currentIndex + 1, total: questions.length })}
      </div>

      {/* Question Card */}
      <div ref={questionRef} tabIndex={-1} className="outline-none">
      <AnimatePresence mode="wait">
        <QuestionCard
          key={questions[currentIndex].id}
          question={questions[currentIndex]}
          onAnswer={handleAnswer}
          onNext={handleNext}
          nextDisabled={Boolean(saveError) || isSaving}
        />
      </AnimatePresence>
      </div>
    </div>
  )
}
