'use client'

import { useEffect, useReducer, useRef, useState } from 'react'
import { useTranslations } from 'next-intl'
import { BookOpen } from 'lucide-react'
import Link from 'next/link'
import Topbar from '@/components/layout/Topbar'
import { useLocaleCookie } from '@/hooks/useLocaleCookie'
import { getBossForTopic } from '@/content/bosses'
import type { QuestionWithDetails } from '@/db/queries/questions'
import { recordAnswer } from '@/app/(app)/topics/[slug]/practice/actions'
import { battleReducer, createBattleState, getCurrentQuestion } from '@/lib/boss/battle'
import { toBattleQuestions } from '@/lib/boss/convert'
import { getSavedBossHp, saveBossHp, clearSavedBossHp } from '@/lib/boss/storage'
import type { BossVisualState } from './BossFigure'
import IntroScreen from './IntroScreen'
import BattleScreen from './BattleScreen'
import StepsSheet from './StepsSheet'
import VictoryScreen from './VictoryScreen'
import RetreatScreen from './RetreatScreen'

type BossVideo = {
  videoId: string
  videoIdAf?: string
  title?: string
  titleAf?: string
} | null

type BossBattleClientProps = {
  topicSlug: string
  topicName: string
  questions: QuestionWithDetails[]
  isDemo: boolean
  video: BossVideo
}

/** Top-level wrapper: owns nothing but an "attempt" counter, so "Battle
 * again" can fully reset the session by remounting BossBattleSession under
 * a fresh key rather than needing a RESET action in the (deliberately
 * minimal) reducer. */
export default function BossBattleClient({ topicSlug, topicName, questions, isDemo, video }: BossBattleClientProps) {
  const t = useTranslations('boss')
  const [attempt, setAttempt] = useState(0)

  if (questions.length === 0) {
    return (
      <div className="min-h-screen" style={{ background: 'var(--bg)' }}>
        <Topbar title={t('title')} subtitle={topicName} />
        <div className="max-w-md mx-auto px-4 py-16 text-center">
          <p className="text-lg font-semibold mb-2" style={{ color: 'var(--text)' }}>
            {t('bossSleeping')}
          </p>
          <p className="text-sm mb-6" style={{ color: 'var(--muted-custom)' }}>
            {t('bossSleepingBody')}
          </p>
          <Link
            href={`/topics/${topicSlug}`}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg font-medium text-white"
            style={{ background: 'var(--accent-red)' }}
          >
            <BookOpen className="w-4 h-4" aria-hidden="true" />
            {t('backToNotes')}
          </Link>
        </div>
      </div>
    )
  }

  return (
    <BossBattleSession
      key={attempt}
      topicSlug={topicSlug}
      topicName={topicName}
      questions={questions}
      isDemo={isDemo}
      video={video}
      onRestart={() => setAttempt((a) => a + 1)}
    />
  )
}

type BossBattleSessionProps = BossBattleClientProps & { onRestart: () => void }

function BossBattleSession({ topicSlug, topicName, questions, isDemo, video, onRestart }: BossBattleSessionProps) {
  const t = useTranslations('boss')
  const locale = useLocaleCookie()
  const boss = getBossForTopic(topicSlug)
  const bossName = locale === 'af' ? boss.nameAf : boss.name
  const bossTagline = locale === 'af' ? boss.taglineAf : boss.tagline
  const localizedVideo =
    video && (locale === 'af' && video.videoIdAf ? video.videoIdAf : video.videoId)
      ? {
          videoId: (locale === 'af' && video.videoIdAf ? video.videoIdAf : video.videoId) as string,
          title: locale === 'af' && video.titleAf ? video.titleAf : video.title,
        }
      : null

  const [state, dispatch] = useReducer(
    battleReducer,
    questions,
    (qs) => createBattleState(toBattleQuestions(qs))
  )

  // --- Resume a boss weakened by a previous retreat. Dispatched from an
  // effect (not read into the reducer's lazy init) so the server-rendered
  // and first-client-render state are always identical - the restored HP
  // only ever matters once the student is past the intro screen, which
  // can't happen before this effect has already run. ---
  useEffect(() => {
    const saved = getSavedBossHp(topicSlug)
    if (saved !== null) dispatch({ type: 'RESTORE_HP', hp: saved })
  }, [topicSlug])

  // --- Elapsed timer (display only - never gates gameplay) ---
  const [elapsedSeconds, setElapsedSeconds] = useState(0)
  const battleActive = state.phase === 'mcq' || state.phase === 'feedback' || state.phase === 'steps'
  useEffect(() => {
    if (!battleActive) return
    const interval = setInterval(() => setElapsedSeconds((s) => s + 1), 1000)
    return () => clearInterval(interval)
  }, [battleActive])

  // --- Boss "hit" pulse + floating damage number + accessible live region,
  // all reactively derived from bossHp actually decreasing (the one true
  // signal for "damage was dealt"), not duplicated from action handlers. ---
  const [bossVisualState, setBossVisualState] = useState<BossVisualState>('idle')
  const [damageKey, setDamageKey] = useState(0)
  const [announcement, setAnnouncement] = useState('')
  const prevHpRef = useRef(state.bossHp)
  const prevShieldsRef = useRef(state.shields)

  useEffect(() => {
    if (state.bossHp < prevHpRef.current) {
      setDamageKey((k) => k + 1)
      setBossVisualState('hit')
      setAnnouncement(t('announceDamage', { damage: prevHpRef.current - state.bossHp, hp: state.bossHp }))
      const timer = setTimeout(() => setBossVisualState('idle'), 500)
      prevHpRef.current = state.bossHp
      return () => clearTimeout(timer)
    }
    prevHpRef.current = state.bossHp
  }, [state.bossHp, t])

  useEffect(() => {
    if (state.shields < prevShieldsRef.current) {
      setAnnouncement(t('announceShieldLost', { shields: state.shields }))
    } else if (state.shields > prevShieldsRef.current) {
      setAnnouncement(t('announceShieldGained', { shields: state.shields }))
    }
    prevShieldsRef.current = state.shields
  }, [state.shields, t])

  // --- Persistence: boss HP survives a retreat, clears on victory. Demo
  // and real mode both use localStorage for this prototype (see
  // src/lib/boss/storage.ts) - guarded so it only ever fires once per
  // battle end, not on every re-render while the end screen is showing. ---
  const persistedRef = useRef(false)
  useEffect(() => {
    if (persistedRef.current) return
    if (state.phase === 'victory') {
      clearSavedBossHp(topicSlug)
      persistedRef.current = true
    } else if (state.phase === 'retreat') {
      saveBossHp(topicSlug, state.bossHp)
      persistedRef.current = true
    }
  }, [state.phase, state.bossHp, topicSlug])

  // --- Real-mode persistence of the MCQ result via the existing, reviewed
  // server action (recordAnswer). Demo mode / mock questions never call
  // this - there is no real question id to attach it to. The boss
  // battle's own XP/HP numbers stay purely client-side either way; this
  // call exists only so a real question's correct/wrong tally (streaks,
  // hearts elsewhere in the app) stays in sync with what the student
  // actually did here, per question, once. ---
  const persistedQuestionIds = useRef(new Set<string>())
  const persistMcqResult = (questionId: string, correct: boolean) => {
    if (isDemo) return
    if (persistedQuestionIds.current.has(questionId)) return
    persistedQuestionIds.current.add(questionId)
    recordAnswer(questionId, correct).catch((error) => {
      console.error('Boss battle: failed to record answer', error)
    })
  }

  const handleSelectOption = (letter: string, correct: boolean) => {
    const question = getCurrentQuestion(state)
    dispatch({ type: 'SELECT_MCQ_OPTION', letter, correct })
    if (question) persistMcqResult(question.id, correct)
  }

  const questionCount = state.questions.length

  return (
    <div className="min-h-screen pb-24" style={{ background: 'var(--bg)' }}>
      <Topbar title={bossName} subtitle={`${topicName} • ${t('title')}`} />

      <div aria-live="polite" className="sr-only">
        {announcement}
      </div>

      {state.phase === 'intro' && (
        <IntroScreen
          boss={boss}
          bossName={bossName}
          bossTagline={bossTagline}
          readiness={state.readiness}
          onSelectReadiness={(readiness) => dispatch({ type: 'SET_READINESS', readiness })}
          onStart={() => dispatch({ type: 'START_BATTLE' })}
          video={localizedVideo}
          videoShieldGranted={state.videoShieldGranted}
          onGrantVideoShield={() => dispatch({ type: 'GRANT_VIDEO_SHIELD' })}
          shields={state.shields}
          questionCount={questionCount}
          totalMarks={state.bossMaxHp}
          currentHp={state.bossHp}
        />
      )}

      {(state.phase === 'mcq' || state.phase === 'feedback' || state.phase === 'steps') && getCurrentQuestion(state) && (
        <BattleScreen
          boss={boss}
          bossName={bossName}
          bossVisualState={bossVisualState}
          hp={state.bossHp}
          maxHp={state.bossMaxHp}
          shields={state.shields}
          combo={state.combo}
          question={getCurrentQuestion(state)!}
          questionNumber={state.currentQuestionIndex + 1}
          totalQuestions={questionCount}
          isFeedbackPhase={state.phase === 'feedback'}
          mcqSelectedLetter={state.mcqSelectedLetter}
          mcqCorrect={state.mcqCorrect}
          lastDamage={state.lastDamage}
          damageKey={damageKey}
          onSelectOption={handleSelectOption}
          onNextRound={() => dispatch({ type: 'NEXT_ROUND' })}
          onRetreat={() => dispatch({ type: 'RETREAT' })}
        />
      )}

      {state.phase === 'steps' && getCurrentQuestion(state) && (
        <StepsSheet
          question={getCurrentQuestion(state)!}
          stepIndex={state.currentStepIndex}
          stepResults={state.stepResults}
          revealMode={state.revealMode}
          isReviewOnly={state.isReviewOnly}
          shields={state.shields}
          onSelfMark={(knew) => dispatch({ type: 'STEP_SELF_MARK', knew })}
          onShowSteps={() => dispatch({ type: 'SHOW_STEPS' })}
          onSpendShieldForHint={() => dispatch({ type: 'ASK_ANGELO' })}
          onContinue={() => dispatch({ type: 'NEXT_ROUND' })}
        />
      )}

      {state.phase === 'victory' && (
        <VictoryScreen
          boss={boss}
          bossName={bossName}
          topicSlug={topicSlug}
          marksDealt={state.marksDealt}
          totalMarks={state.bossMaxHp}
          xp={state.xp}
          comboBest={state.comboBest}
          elapsedSeconds={elapsedSeconds}
          onPlayAgain={onRestart}
        />
      )}

      {state.phase === 'retreat' && (
        <RetreatScreen
          boss={boss}
          bossName={bossName}
          topicSlug={topicSlug}
          xp={state.xp}
          marksDealt={state.marksDealt}
          totalMarks={state.bossMaxHp}
          remainingHp={state.bossHp}
          onTryAgain={onRestart}
        />
      )}
    </div>
  )
}
