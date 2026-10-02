'use client'

import { useState, useEffect } from 'react'
import { Star, ArrowRight, ArrowLeft, Trophy, Loader2, Check, Sparkles, Target } from 'lucide-react'
import { useTranslations, useLocale } from 'next-intl'
import { promptScenarios, PROMPT_CHALLENGE_XP_PER_STAR } from '@/content/ai-skills'
import type { PromptEvaluationResult } from '@/types'

const STORAGE_KEY = 'angelo_prompt_challenge_attempts'

const techniqueNames: Record<string, string> = {
  'chain-of-thought': 'Chain of Thought',
  'few-shot': 'Few-Shot Prompting',
  'role-prompting': 'Role Prompting',
  'structured-output': 'Structured Output',
  'tree-of-thoughts': 'Tree of Thoughts',
  'prompt-chaining': 'Prompt Chaining',
  'meta-prompting': 'Meta Prompting',
  'negative-constraints': 'Negative Constraints',
  'iterative-refinement': 'Iterative Refinement',
  'combined': 'Combined Techniques',
}

interface PromptChallengeGameProps {
  userId: string
  onComplete?: (totalScore: number, challengesCompleted: number) => void
}

interface ChallengeAttempt {
  scenarioId: string
  studentPrompt: string
  evaluation: PromptEvaluationResult
  xpEarned: number
}

type ChallengeFilter = 'all' | 'basic' | 'advanced'

export default function PromptChallengeGame({ userId, onComplete }: PromptChallengeGameProps) {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [userPrompt, setUserPrompt] = useState('')
  const [isEvaluating, setIsEvaluating] = useState(false)
  const [evaluation, setEvaluation] = useState<PromptEvaluationResult | null>(null)
  const [attempts, setAttempts] = useState<ChallengeAttempt[]>([])
  const [showResults, setShowResults] = useState(false)
  const t = useTranslations('aiSkills')
  const af = useLocale() === 'af'
  const localised = (en: string, afText?: string) => (af && afText ? afText : en)
  const [submitError, setSubmitError] = useState<string | null>(null)
  const [filter, setFilter] = useState<ChallengeFilter>('all')
  const [isHydrated, setIsHydrated] = useState(false)

  // Load attempts from localStorage on mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem(`${STORAGE_KEY}_${userId}`)
        if (saved) {
          const parsed = JSON.parse(saved)
          if (Array.isArray(parsed)) {
            setAttempts(parsed)
          }
        }
      } catch (e) {
        console.error('Failed to load saved attempts:', e)
      }
      setIsHydrated(true)
    }
  }, [userId])

  // Persist attempts to localStorage when they change
  useEffect(() => {
    if (isHydrated && typeof window !== 'undefined') {
      try {
        localStorage.setItem(`${STORAGE_KEY}_${userId}`, JSON.stringify(attempts))
      } catch (e) {
        console.error('Failed to save attempts:', e)
      }
    }
  }, [attempts, userId, isHydrated])

  // Filter scenarios based on selected filter
  const filteredScenarios = promptScenarios.filter(s => {
    if (filter === 'all') return true
    return s.difficulty === filter
  })

  const currentScenario = filteredScenarios[currentIndex] || promptScenarios[0]
  const hasAttemptedCurrent = attempts.some(a => a.scenarioId === currentScenario.id)

  // Calculate total score and XP
  const totalXP = attempts.reduce((sum, a) => sum + a.xpEarned, 0)
  const avgScore = attempts.length > 0
    ? attempts.reduce((sum, a) => sum + a.evaluation.score, 0) / attempts.length
    : 0

  const handleSubmit = async () => {
    if (!userPrompt.trim() || isEvaluating) return

    setIsEvaluating(true)
    setSubmitError(null)

    try {
      const res = await fetch('/api/ai-hint', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          mode: 'prompt_evaluation',
          challengeId: currentScenario.id,
          scenarioContext: currentScenario.context,
          scenarioTask: currentScenario.task,
          studentPrompt: userPrompt,
          difficulty: currentScenario.difficulty,
          technique: currentScenario.technique,
        }),
      })

      const data = await res.json()

      if (!res.ok) {
        // 429 is the daily free-tier AI quota and 503 is Claude being
        // unavailable - both are ordinary, expected outcomes, not edge
        // cases. The catch below only console.error'd them, so the button
        // went from "Evaluating your prompt..." straight back to
        // "Submit for Evaluation" and the student was told nothing.
        setSubmitError(res.status === 429 ? t('quotaReached') : t('evaluationFailed'))
        return
      }

      // The server persists the attempt (with its own server-computed
      // score) as part of this same request now - see the prompt_evaluation
      // branch of /api/ai-hint. `data.attempt` carries the saved id, final
      // xpEarned (including any badge bonus) and newBadges when Supabase is
      // configured; it's absent in demo mode.
      const evalResult: PromptEvaluationResult = data.evaluation
      const xpEarned: number = data.attempt?.xpEarned ?? evalResult.score * PROMPT_CHALLENGE_XP_PER_STAR

      setEvaluation(evalResult)

      // Save attempt locally
      const newAttempt: ChallengeAttempt = {
        scenarioId: currentScenario.id,
        studentPrompt: userPrompt,
        evaluation: evalResult,
        xpEarned,
      }

      setAttempts(prev => [...prev.filter(a => a.scenarioId !== currentScenario.id), newAttempt])
    } catch (error) {
      console.error('Evaluation error:', error)
      setSubmitError(t('evaluationFailed'))
    } finally {
      setIsEvaluating(false)
    }
  }

  const handleNext = () => {
    if (currentIndex < filteredScenarios.length - 1) {
      setCurrentIndex(currentIndex + 1)
      setUserPrompt('')
      setEvaluation(null)
    } else {
      setShowResults(true)
      onComplete?.(avgScore, attempts.length)
    }
  }

  const handlePrev = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1)
      setUserPrompt('')
      setEvaluation(null)
    }
  }

  const handleFilterChange = (newFilter: ChallengeFilter) => {
    setFilter(newFilter)
    setCurrentIndex(0)
    setUserPrompt('')
    setEvaluation(null)
  }

  const handleTryAgain = () => {
    setUserPrompt('')
    setEvaluation(null)
  }

  // Load previous attempt if exists
  useEffect(() => {
    const prevAttempt = attempts.find(a => a.scenarioId === currentScenario.id)
    if (prevAttempt) {
      setUserPrompt(prevAttempt.studentPrompt)
      setEvaluation(prevAttempt.evaluation)
    }
  }, [currentIndex, attempts, currentScenario.id])

  if (showResults) {
    return (
      <div className="max-w-2xl mx-auto p-6 space-y-6">
        <div className="rounded-2xl p-8 text-center space-y-6 bg-ai-purple-glow border border-ai-purple">
          <Trophy className="w-16 h-16 mx-auto text-ai-purple" />
          <h2 className="text-2xl font-bold text-primary-text">
            {t('challengeComplete')}
          </h2>

          <div className="flex justify-center gap-8">
            <div className="text-center">
              <p className="text-3xl font-bold text-ai-purple">{attempts.length}</p>
              <p className="text-sm text-muted-custom">{t('scenarios')}</p>
            </div>
            <div className="text-center">
              <p className="text-3xl font-bold text-gold">{totalXP}</p>
              <p className="text-sm text-muted-custom">{t('xpEarned')}</p>
            </div>
            <div className="text-center">
              <div className="flex items-center justify-center gap-1">
                <span className="text-3xl font-bold text-ai-purple">{avgScore.toFixed(1)}</span>
                <Star className="w-6 h-6 text-gold fill-gold" />
              </div>
              <p className="text-sm text-muted-custom">{t('average')}</p>
            </div>
          </div>

          {avgScore >= 4 && (
            <p className="text-teal font-medium">
              {t('readyForCertificate')}
            </p>
          )}

          <button
            onClick={() => setShowResults(false)}
            className="px-6 py-3 rounded-lg font-medium bg-ai-purple text-white"
          >
            {t('reviewChallenges')}
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Filter Tabs */}
      <div className="flex gap-2">
        {(['all', 'basic', 'advanced'] as ChallengeFilter[]).map((f) => (
          <button
            key={f}
            onClick={() => handleFilterChange(f)}
            aria-pressed={filter === f}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              filter === f ? 'bg-ai-purple text-white' : 'bg-surface2 text-muted-custom'
            }`}
          >
            {f === 'all' ? `${t('all')} (${promptScenarios.length})` :
             f === 'basic' ? `${t('basic')} (${promptScenarios.filter(s => s.difficulty !== 'advanced').length})` :
             `${t('advanced')} (${promptScenarios.filter(s => s.difficulty === 'advanced').length})`}
          </button>
        ))}
      </div>

      {/* Progress Bar */}
      <div className="flex items-center justify-between">
        <span className="text-sm text-muted-custom">
          {t('challengeOf', { current: currentIndex + 1, total: filteredScenarios.length })}
        </span>
        <div className="flex items-center gap-2">
          <span className="text-sm text-gold">{totalXP} XP</span>
          <div className="flex gap-1">
            {filteredScenarios.map((scenario, i) => (
              <div
                key={scenario.id}
                className={`w-2 h-2 rounded-full transition-colors ${
                  attempts.some(a => a.scenarioId === scenario.id)
                    ? 'bg-ai-purple'
                    : i === currentIndex
                    ? 'bg-muted-custom'
                    : 'bg-surface2'
                }`}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Scenario Card */}
      <div className="rounded-xl p-6 space-y-4 bg-surface border border-custom">
        <div className="space-y-3">
          {/* Difficulty and Technique Badges */}
          <div className="flex flex-wrap gap-2">
            {currentScenario.difficulty === 'advanced' ? (
              <span className="text-xs px-2.5 py-1 rounded-full font-medium flex items-center gap-1 bg-ai-purple-glow text-ai-purple">
                <Sparkles className="w-3 h-3" />
                {t('advanced')}
              </span>
            ) : (
              <span className="text-xs px-2.5 py-1 rounded-full font-medium bg-surface2 text-muted-custom">
                {t('basic')}
              </span>
            )}
            {currentScenario.technique && (
              <span className="text-xs px-2.5 py-1 rounded-full font-medium flex items-center gap-1 bg-ai-success-glow text-ai-success">
                <Target className="w-3 h-3" />
                {techniqueNames[currentScenario.technique] || currentScenario.technique}
              </span>
            )}
          </div>

          <h3 className="text-lg font-semibold text-primary-text">{t('scenario')}</h3>
          <p className="text-sm text-muted-custom">
            {localised(currentScenario.context, currentScenario.contextAf)}
          </p>
        </div>

        <div className="p-4 rounded-lg bg-ai-purple-glow border border-ai-purple">
          <p className="text-sm font-medium text-ai-purple">{t('yourTask')}</p>
          <p className="text-sm mt-1 text-primary-text">
            {localised(currentScenario.task, currentScenario.taskAf)}
          </p>
        </div>

        {/* Input */}
        {!evaluation && (
          <div className="space-y-3">
            {/* A placeholder is not an accessible name - it disappears on
                first keystroke and screen readers announce only "edit text". */}
            <textarea
              value={userPrompt}
              onChange={(e) => setUserPrompt(e.target.value)}
              aria-label={t('writePromptHere')}
              placeholder={t('writePromptHere')}
              className="w-full h-32 px-4 py-3 rounded-lg text-sm resize-none focus:outline-none focus:ring-2 focus:ring-ai-purple bg-surface2 border border-custom text-primary-text"
              disabled={isEvaluating}
            />

            <button
              onClick={handleSubmit}
              disabled={!userPrompt.trim() || isEvaluating}
              className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-lg font-medium transition-all disabled:opacity-50 bg-ai-purple text-white"
            >
              {isEvaluating ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  {t('evaluating')}
                </>
              ) : (
                t('submitForEvaluation')
              )}
            </button>

            {submitError && (
              <p role="alert" className="text-sm" style={{ color: 'var(--accent-red-text)' }}>
                {submitError}
              </p>
            )}
          </div>
        )}

        {/* Evaluation Results */}
        {evaluation && (
          <div className="space-y-4">
            {/* Score */}
            <div className="flex items-center justify-between p-4 rounded-lg bg-surface2">
              <div className="flex items-center gap-3">
                <div className="flex">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star
                      key={star}
                      className={`w-6 h-6 ${
                        star <= evaluation.score
                          ? 'text-gold fill-gold'
                          : 'text-muted-custom'
                      }`}
                    />
                  ))}
                </div>
                <span className="font-bold text-lg text-primary-text">
                  {evaluation.score}/5
                </span>
              </div>
              <span className="text-sm font-medium text-gold">
                +{evaluation.score * PROMPT_CHALLENGE_XP_PER_STAR} XP
              </span>
            </div>

            {/* Feedback */}
            <div className="space-y-3">
              <div className="p-3 rounded-lg bg-ai-success-glow">
                <p className="text-xs font-medium mb-1 text-ai-success">{t('whatWorked')}</p>
                <p className="text-sm text-primary-text">
                  {evaluation.what_worked}
                </p>
              </div>

              <div className="p-3 rounded-lg bg-ai-purple-glow">
                <p className="text-xs font-medium mb-1 text-ai-purple">{t('toImprove')}</p>
                <p className="text-sm text-primary-text">
                  {evaluation.what_to_improve}
                </p>
              </div>

              <div className="p-3 rounded-lg bg-surface2">
                <p className="text-xs font-medium mb-1 text-muted-custom">{t('betterVersion')}</p>
                <p className="text-sm italic text-primary-text">
                  &quot;{evaluation.improved_prompt}&quot;
                </p>
              </div>
            </div>

            {/* Encouragement */}
            <p className="text-sm text-center text-ai-purple font-medium">
              {evaluation.encouragement}
            </p>

            {/* Actions */}
            <div className="flex gap-3">
              <button
                onClick={handleTryAgain}
                className="flex-1 px-4 py-2.5 rounded-lg font-medium transition-all bg-surface2 text-primary-text"
              >{t('tryAgain')}</button>
              <button
                onClick={handleNext}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg font-medium transition-all bg-ai-purple text-white"
              >
                {currentIndex < filteredScenarios.length - 1 ? (
                  <>{t('nextChallenge')}<ArrowRight className="w-4 h-4" />
                  </>
                ) : (
                  <>
                    <Check className="w-4 h-4" />{t('finish')}</>
                )}
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Navigation */}
      <div className="flex justify-between">
        <button
          onClick={handlePrev}
          disabled={currentIndex === 0}
          className="flex items-center gap-2 px-4 py-2 rounded-lg transition-all disabled:opacity-30 text-muted-custom"
        >
          <ArrowLeft className="w-4 h-4" />{t('previous')}</button>

        <button
          onClick={handleNext}
          disabled={!hasAttemptedCurrent}
          className="flex items-center gap-2 px-4 py-2 rounded-lg transition-all disabled:opacity-30 text-muted-custom"
        >{t('skip')}<ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  )
}
