'use client'

import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useTranslations } from 'next-intl'
import { ArrowRight, Check, HelpCircle, ListChecks, Loader2, MessageCircle, X as XIcon } from 'lucide-react'
import MathRenderer from '@/components/math/MathRenderer'
import { asMath } from '@/lib/boss/math-text'
import type { BattleQuestion, RevealMode, StepResult } from '@/lib/boss/battle'

type LocalStage = 'instruction' | 'revealed' | 'explained'

type StepsSheetProps = {
  question: BattleQuestion
  stepIndex: number
  stepResults: readonly StepResult[]
  revealMode: RevealMode
  isReviewOnly: boolean
  shields: number
  onSelfMark: (knew: boolean) => void
  onShowSteps: () => void
  /** Dispatches the ASK_ANGELO reducer action (shield cost, no-ops at 0). */
  onSpendShieldForHint: () => void
  onContinue: () => void
}

/** Phase 2 - slides up from the bottom over the battle screen. Handles both
 * the readiness='got_this' short-answer reveal and the full step-by-step
 * self-marking flow (see docs at the top of src/lib/boss/battle.ts for the
 * damage rules this UI drives). */
export default function StepsSheet({
  question,
  stepIndex,
  stepResults,
  revealMode,
  isReviewOnly,
  shields,
  onSelfMark,
  onShowSteps,
  onSpendShieldForHint,
  onContinue,
}: StepsSheetProps) {
  const t = useTranslations('boss')
  const [stage, setStage] = useState<LocalStage>('instruction')
  const [confirmAngelo, setConfirmAngelo] = useState(false)
  const [askingAngelo, setAskingAngelo] = useState(false)
  const [angeloResponse, setAngeloResponse] = useState<string | null>(null)
  const [angeloError, setAngeloError] = useState<string | null>(null)

  const totalSteps = question.steps.length
  const done = stepIndex >= totalSteps
  const currentStep = question.steps[stepIndex]
  const lastStep = question.steps[totalSteps - 1]

  useEffect(() => {
    setStage('instruction')
    setAngeloResponse(null)
    setAngeloError(null)
  }, [stepIndex])

  const handleAskAngelo = async () => {
    setConfirmAngelo(false)
    onSpendShieldForHint()
    setAskingAngelo(true)
    setAngeloError(null)

    try {
      const response = await fetch('/api/ai-hint', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          mode: 'step_hint',
          questionText: question.questionText,
          stepNumber: currentStep?.stepNumber,
          hint: currentStep?.hint ?? undefined,
        }),
      })
      const data = await response.json()

      if (response.status === 429) {
        setAngeloError(data.message || t('dailyHintLimitReached'))
        return
      }
      if (!response.ok) {
        throw new Error(data.error || 'Failed to get help')
      }
      setAngeloResponse(data.hint)
    } catch (error) {
      setAngeloError(t('askAngeloError'))
      console.error('Ask Angelo (boss battle) error:', error)
    } finally {
      setAskingAngelo(false)
    }
  }

  return (
    <motion.div
      initial={{ y: '100%' }}
      animate={{ y: 0 }}
      exit={{ y: '100%' }}
      transition={{ type: 'spring', damping: 28, stiffness: 260 }}
      className="fixed inset-x-0 bottom-0 z-40 max-h-[85vh] overflow-y-auto rounded-t-2xl p-4 pb-[calc(1rem+env(safe-area-inset-bottom,0px))]"
      style={{ background: 'var(--surface)', border: '1px solid var(--border-custom)', borderBottom: 'none' }}
    >
      <div className="max-w-lg mx-auto">
        <div className="flex items-center gap-2 mb-4">
          <ListChecks className="w-4 h-4" style={{ color: 'var(--teal)' }} aria-hidden="true" />
          <h2 className="text-sm font-bold" style={{ color: 'var(--text)' }}>
            {isReviewOnly ? t('reviewTitle') : t('stepByStepTitle')}
          </h2>
        </div>

        {revealMode === 'short' && !done ? (
          <div>
            <p className="text-sm mb-3" style={{ color: 'var(--muted-custom)' }}>
              {t('shortAnswerIntro')}
            </p>
            <div
              className="p-3 rounded-lg font-mono text-sm mb-4"
              style={{ background: 'var(--bg)', border: '1px solid var(--border-custom)' }}
            >
              <MathRenderer content={asMath(lastStep.correctAnswer)} />
            </div>
            <button
              type="button"
              onClick={onShowSteps}
              className="w-full px-4 py-2.5 rounded-lg text-sm font-semibold"
              style={{ background: 'var(--surface2)', color: 'var(--text)', border: '1px solid var(--border-custom)' }}
            >
              {t('showMeTheSteps')}
            </button>
          </div>
        ) : done ? (
          <div className="text-center py-4">
            <p className="text-sm mb-4" style={{ color: 'var(--text)' }}>
              {t('allStepsDone')}
            </p>
            <button
              type="button"
              onClick={onContinue}
              className="w-full flex items-center justify-center gap-2 px-5 py-3 rounded-lg font-semibold text-white"
              style={{ background: 'var(--accent-red)' }}
            >
              {t('continue')}
              <ArrowRight className="w-4 h-4" aria-hidden="true" />
            </button>
          </div>
        ) : (
          <div>
            <p className="text-xs font-medium mb-2" style={{ color: 'var(--muted-custom)' }}>
              {t('stepOf', { current: stepIndex + 1, total: totalSteps })}
            </p>
            <p className="text-sm mb-4" style={{ color: 'var(--text)' }}>
              <MathRenderer content={asMath(currentStep.instruction)} />
            </p>

            {stage === 'instruction' && (
              <button
                type="button"
                onClick={() => setStage('revealed')}
                className="w-full px-4 py-3 rounded-lg text-sm font-semibold text-white"
                style={{ background: 'var(--accent-red)' }}
              >
                {t('iKnowThis')}
              </button>
            )}

            {stage !== 'instruction' && (
              <div>
                <div
                  className="p-3 rounded-lg font-mono text-sm mb-3"
                  style={{ background: 'var(--bg)', border: '1px solid var(--border-custom)' }}
                >
                  <MathRenderer content={asMath(currentStep.correctAnswer)} />
                </div>

                {stage === 'revealed' && (
                  <div>
                    <p className="text-sm font-medium mb-2" style={{ color: 'var(--text)' }}>
                      {t('didYouHaveThis')}
                    </p>
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        type="button"
                        onClick={() => onSelfMark(true)}
                        className="flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-lg text-sm font-semibold"
                        style={{ background: 'rgba(42, 157, 143, 0.2)', color: 'var(--teal)', border: '2px solid var(--teal)' }}
                      >
                        <Check className="w-4 h-4" aria-hidden="true" />
                        {t('yesIHadThis')}
                      </button>
                      <button
                        type="button"
                        onClick={() => setStage('explained')}
                        className="flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-lg text-sm font-semibold"
                        style={{ background: 'rgba(230, 57, 70, 0.15)', color: 'var(--accent-red)', border: '2px solid var(--accent-red)' }}
                      >
                        <XIcon className="w-4 h-4" aria-hidden="true" />
                        {t('noIDidNot')}
                      </button>
                    </div>
                  </div>
                )}

                {stage === 'explained' && (
                  <div>
                    <p className="text-xs mb-3" style={{ color: 'var(--muted-custom)' }}>
                      <MathRenderer
                        content={asMath(currentStep.explanation || currentStep.hint || t('noExplanationAvailable'))}
                      />
                    </p>
                    <button
                      type="button"
                      onClick={() => onSelfMark(false)}
                      className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg text-sm font-semibold text-white"
                      style={{ background: 'var(--accent-red)' }}
                    >
                      {t('continue')}
                      <ArrowRight className="w-4 h-4" aria-hidden="true" />
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* Ask Angelo */}
            {!angeloResponse && (
              <div className="mt-4">
                <button
                  type="button"
                  onClick={() => setConfirmAngelo(true)}
                  disabled={askingAngelo || shields <= 0}
                  className="flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-medium disabled:opacity-40"
                  style={{ background: 'rgba(45, 212, 191, 0.12)', color: 'var(--teal)', border: '1px solid var(--teal)' }}
                >
                  {askingAngelo ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin" aria-hidden="true" />
                  ) : (
                    <MessageCircle className="w-3.5 h-3.5" aria-hidden="true" />
                  )}
                  {t('askAngeloCost')}
                </button>
                {angeloError && (
                  <p className="mt-2 text-xs" style={{ color: 'var(--accent-red)' }}>
                    {angeloError}
                  </p>
                )}
              </div>
            )}

            {angeloResponse && (
              <div
                className="mt-4 p-3 rounded-lg text-sm"
                style={{ background: 'rgba(45, 212, 191, 0.1)', border: '1px solid var(--teal)', color: 'var(--text)' }}
              >
                {angeloResponse}
              </div>
            )}
          </div>
        )}
      </div>

      <AnimatePresence>
        {confirmAngelo && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
          >
            <button
              type="button"
              aria-label={t('cancel')}
              className="absolute inset-0"
              style={{ background: 'rgba(0,0,0,0.7)' }}
              onClick={() => setConfirmAngelo(false)}
            />
            <div
              role="alertdialog"
              aria-modal="true"
              aria-label={t('confirmAskAngeloTitle')}
              className="relative w-full max-w-xs rounded-xl p-5"
              style={{ background: 'var(--surface)', border: '1px solid var(--border-custom)' }}
            >
              <div className="flex items-center gap-2 mb-2">
                <HelpCircle className="w-5 h-5" style={{ color: 'var(--teal)' }} aria-hidden="true" />
                <h2 className="text-base font-bold" style={{ color: 'var(--text)' }}>
                  {t('confirmAskAngeloTitle')}
                </h2>
              </div>
              <p className="text-sm mb-4" style={{ color: 'var(--muted-custom)' }}>
                {t('confirmAskAngeloBody')}
              </p>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setConfirmAngelo(false)}
                  className="flex-1 px-4 py-2 rounded-lg text-sm font-medium"
                  style={{ background: 'var(--surface2)', color: 'var(--text)' }}
                >
                  {t('cancel')}
                </button>
                <button
                  type="button"
                  onClick={handleAskAngelo}
                  className="flex-1 px-4 py-2 rounded-lg text-sm font-semibold text-white"
                  style={{ background: 'var(--teal)' }}
                >
                  {t('confirmAskAngeloAction')}
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}
