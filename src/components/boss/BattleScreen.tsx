'use client'

import { useState, type CSSProperties } from 'react'
import { motion } from 'framer-motion'
import { Flag, Swords } from 'lucide-react'
import { useTranslations } from 'next-intl'
import MathRenderer from '@/components/math/MathRenderer'
import { ACCENT_TEXT_LIGHT, ACCENT_TEXT_DARK } from '@/lib/color/contrast'
import { useMotionSafe } from '@/hooks/useMotionSafe'
import BossFigure, { type BossVisualState } from './BossFigure'
import HpBar from './HpBar'
import ShieldsAndCombo from './ShieldsAndCombo'
import DamageNumber from './DamageNumber'
import type { Boss } from '@/content/bosses'
import type { BattleQuestion } from '@/lib/boss/battle'

type BattleScreenProps = {
  boss: Boss
  bossName: string
  bossVisualState: BossVisualState
  hp: number
  maxHp: number
  shields: number
  combo: number
  question: BattleQuestion
  questionNumber: number
  totalQuestions: number
  isFeedbackPhase: boolean
  mcqSelectedLetter: string | null
  mcqCorrect: boolean | null
  lastDamage: number | null
  damageKey: number
  onSelectOption: (letter: string, correct: boolean) => void
  onNextRound: () => void
  onRetreat: () => void
}

export default function BattleScreen({
  boss,
  bossName,
  bossVisualState,
  hp,
  maxHp,
  shields,
  combo,
  question,
  questionNumber,
  totalQuestions,
  isFeedbackPhase,
  mcqSelectedLetter,
  mcqCorrect,
  lastDamage,
  damageKey,
  onSelectOption,
  onNextRound,
  onRetreat,
}: BattleScreenProps) {
  const t = useTranslations('boss')
  const { transition, variant } = useMotionSafe()
  const [confirmRetreat, setConfirmRetreat] = useState(false)

  const handleOptionClick = (letter: string, correct: boolean) => {
    if (isFeedbackPhase) return
    onSelectOption(letter, correct)
  }

  return (
    <div className="max-w-lg mx-auto px-4 py-4">
      {/* Boss + HP */}
      <div className="flex items-center gap-3 mb-2">
        <div className="w-16 h-16 shrink-0">
          <BossFigure variant={boss.svgVariant} accent={boss.accent} state={bossVisualState} />
        </div>
        <div className="flex-1 min-w-0">
          <HpBar bossName={bossName} hp={hp} maxHp={maxHp} accent={boss.accent} />
        </div>
      </div>
      <DamageNumber damageKey={damageKey} damage={lastDamage} />

      <div className="mb-4">
        <ShieldsAndCombo shields={shields} combo={combo} />
      </div>

      {/* Question progress */}
      <div className="flex items-center justify-between mb-3">
        <span className="text-xs font-medium" style={{ color: 'var(--muted-custom)' }}>
          {t('roundOf', { current: questionNumber, total: totalQuestions })}
        </span>
        <button
          type="button"
          onClick={() => setConfirmRetreat(true)}
          className="flex items-center justify-center gap-1 min-h-11 min-w-11 px-3 py-2 -my-2 -mr-2 text-xs font-medium"
          style={{ color: 'var(--muted-custom)' }}
        >
          <Flag className="w-3.5 h-3.5" aria-hidden="true" />
          {t('retreat')}
        </button>
      </div>

      {/* Question Card */}
      <motion.div
        key={question.id}
        // Slide only, never fade - and that applies to the reduced-motion
        // branch too, which used to be opacity-only. This wraps the question
        // and every option, it remounts on `key` every single round, and a
        // stalled animation would leave the student looking at a boss and an
        // HP bar with nothing to answer. Reduced motion is handled by
        // collapsing the transition to zero, not by hiding the content.
        initial={variant({ y: 12 }, { y: 0 })}
        animate={{ y: 0 }}
        transition={transition({ duration: 0.25 })}
        className="rounded-xl p-4"
        style={{ background: 'var(--surface)', border: '1px solid var(--border-custom)' }}
      >
        <div className="flex items-center gap-2 mb-3">
          <span
            className="px-2 py-0.5 rounded-full text-xs font-bold"
            style={{ background: boss.accent, color: boss.onAccent === 'light' ? ACCENT_TEXT_LIGHT : ACCENT_TEXT_DARK }}
          >
            {t('worthMarks', { marks: question.marks })}
          </span>
        </div>

        <div className="text-base mb-4" style={{ color: 'var(--text)' }}>
          <MathRenderer content={question.questionText} />
        </div>

        <div className="grid grid-cols-1 gap-2.5">
          {question.options.map((option) => {
            const letter = option.optionLetter || ''
            const answered = mcqSelectedLetter !== null
            let style: CSSProperties = {
              background: 'var(--surface2)',
              border: '1px solid var(--border-custom)',
              color: 'var(--text)',
            }
            if (answered) {
              if (option.isCorrect) {
                style = { background: 'rgba(42, 157, 143, 0.2)', border: '2px solid var(--teal)', color: 'var(--teal)' }
              } else if (letter === mcqSelectedLetter) {
                style = { background: 'rgba(230, 57, 70, 0.2)', border: '2px solid var(--accent-red)', color: 'var(--accent-red)' }
              } else {
                style = { ...style, opacity: 0.55 }
              }
            }

            return (
              <button
                key={option.id}
                type="button"
                disabled={answered}
                onClick={() => handleOptionClick(letter, option.isCorrect || false)}
                className="flex items-start gap-3 p-3.5 rounded-lg text-left transition-all min-h-[3rem]"
                style={style}
              >
                <span
                  className="flex-shrink-0 w-7 h-7 rounded-md flex items-center justify-center font-bold text-xs"
                  style={{ background: 'var(--bg)', color: 'inherit' }}
                >
                  {letter}
                </span>
                <span className="flex-1 text-sm pt-0.5">
                  <MathRenderer content={option.optionText} />
                </span>
              </button>
            )
          })}
        </div>

        {isFeedbackPhase && (
          <motion.div
            // Carries the damage line and the only control that advances the
            // battle, so it must not depend on an animation to be seen.
            initial={variant({ y: 8 }, { y: 0 })}
            animate={{ y: 0 }}
            transition={transition({ duration: 0.25 })}
            className="mt-4 flex items-center justify-between gap-3 rounded-lg p-3"
            style={{ background: 'rgba(42, 157, 143, 0.1)', border: '1px solid var(--teal)' }}
          >
            <p className="text-sm font-semibold" style={{ color: 'var(--teal)' }}>
              {t('correctHit', { damage: question.marks })}
            </p>
            <button
              type="button"
              onClick={onNextRound}
              className="flex items-center gap-1.5 px-4 py-2 rounded-lg font-semibold text-white text-sm"
              style={{ background: 'var(--accent-red)' }}
            >
              <Swords className="w-4 h-4" aria-hidden="true" />
              {t('nextRound')}
            </button>
          </motion.div>
        )}

        {mcqCorrect === false && (
          <p className="mt-3 text-xs" style={{ color: 'var(--accent-red)' }}>
            {t('wrongAnswerHitBack')}
          </p>
        )}
      </motion.div>

      {confirmRetreat && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <button
            type="button"
            aria-label={t('cancel')}
            className="absolute inset-0"
            style={{ background: 'rgba(0,0,0,0.7)' }}
            onClick={() => setConfirmRetreat(false)}
          />
          <div
            role="alertdialog"
            aria-modal="true"
            aria-label={t('confirmRetreatTitle')}
            className="relative w-full max-w-xs rounded-xl p-5"
            style={{ background: 'var(--surface)', border: '1px solid var(--border-custom)' }}
          >
            <h2 className="text-base font-bold mb-2" style={{ color: 'var(--text)' }}>
              {t('confirmRetreatTitle')}
            </h2>
            <p className="text-sm mb-4" style={{ color: 'var(--muted-custom)' }}>
              {t('confirmRetreatBody')}
            </p>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setConfirmRetreat(false)}
                className="flex-1 min-h-11 min-w-11 px-4 py-2 rounded-lg text-sm font-medium"
                style={{ background: 'var(--surface2)', color: 'var(--text)' }}
              >
                {t('cancel')}
              </button>
              <button
                type="button"
                onClick={onRetreat}
                className="flex-1 min-h-11 min-w-11 px-4 py-2 rounded-lg text-sm font-semibold text-white"
                style={{ background: 'var(--accent-red)' }}
              >
                {t('retreat')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
