/**
 * Boss Battle — pure state reducer.
 *
 * This is the entire rules engine for the boss battle minigame. It has no
 * dependency on React, the DOM, Date.now(), or localStorage, so every rule
 * (damage, shields, combo, readiness-driven reveal depth, retreat, victory)
 * is deterministic and unit-testable without mocking time or the browser.
 * Timers, animations, and persistence are all handled by the calling
 * component (BossBattleClient and friends) — this file only ever answers
 * "given this state and this action, what is the next state?".
 *
 * Damage model
 * ------------
 * Boss HP = sum of `marks` across the battle's questions. Each question can
 * deal at most its own `marks` in damage, split across two possible routes:
 *
 *  - A correct MCQ answer deals the full `marks` for that question immediately.
 *  - A wrong MCQ answer deals 0 immediately and drops a shield; the student
 *    then works through Phase 2 (step-by-step), where marking "I had this"
 *    on a step deals marks/steps (remainder on the last step) — so working
 *    every step correctly after a wrong MCQ still recovers the full marks
 *    for that question.
 *
 * When readiness is 'not_sure', Phase 2 also runs after a *correct* MCQ —
 * but purely as review (`isReviewOnly`): the marks are already fully dealt,
 * so self-marking a review step never deals additional damage.
 */

import { XP_PER_CORRECT_ANSWER } from '@/lib/game-rules'

export type Readiness = 'not_sure' | 'kind_of' | 'got_this'

export type BattlePhase = 'intro' | 'mcq' | 'feedback' | 'steps' | 'victory' | 'retreat'

export type StepResult = 'pending' | 'knew_it' | 'didnt_know'

export type RevealMode = 'short' | 'full'

export interface BattleQuestionOption {
  id: string
  optionLetter: string | null
  optionText: string
  isCorrect: boolean | null
}

export interface BattleQuestionStep {
  id: string
  stepNumber: number
  instruction: string
  hint: string | null
  correctAnswer: string
  explanation: string | null
}

export interface BattleQuestion {
  id: string
  questionText: string
  marks: number
  options: BattleQuestionOption[]
  steps: BattleQuestionStep[]
}

export interface BattleState {
  readonly questions: readonly BattleQuestion[]
  readonly bossMaxHp: number
  readonly bossHp: number
  readonly shields: number
  readonly readiness: Readiness | null
  readonly videoShieldGranted: boolean
  readonly phase: BattlePhase
  readonly currentQuestionIndex: number
  readonly currentStepIndex: number
  /** True when Phase 2 is pure review after an already-correct MCQ
   * (readiness === 'not_sure') — self-marking a step never deals damage. */
  readonly isReviewOnly: boolean
  readonly revealMode: RevealMode
  readonly mcqSelectedLetter: string | null
  readonly mcqCorrect: boolean | null
  readonly stepResults: readonly StepResult[]
  readonly combo: number
  readonly comboBest: number
  readonly xp: number
  readonly marksDealt: number
  /** Damage dealt by the most recent action — drives the floating "-5"
   * number. null before any damage has been dealt this battle. */
  readonly lastDamage: number | null
}

export type BattleAction =
  | { type: 'SET_READINESS'; readiness: Readiness }
  | { type: 'GRANT_VIDEO_SHIELD' }
  | { type: 'START_BATTLE' }
  | { type: 'SELECT_MCQ_OPTION'; letter: string; correct: boolean }
  | { type: 'STEP_SELF_MARK'; knew: boolean }
  | { type: 'SHOW_STEPS' }
  | { type: 'ASK_ANGELO' }
  | { type: 'NEXT_ROUND' }
  | { type: 'RETREAT' }

export const INITIAL_SHIELDS = 3
export const VIDEO_SHIELD_BONUS = 1
/** Consecutive correct MCQs needed for each combo multiplier tier. */
export const COMBO_TIER_1_STREAK = 3
export const COMBO_TIER_2_STREAK = 5
export const COMBO_TIER_1_MULTIPLIER = 1.5
export const COMBO_TIER_2_MULTIPLIER = 2

export function comboMultiplierFor(combo: number): number {
  if (combo >= COMBO_TIER_2_STREAK) return COMBO_TIER_2_MULTIPLIER
  if (combo >= COMBO_TIER_1_STREAK) return COMBO_TIER_1_MULTIPLIER
  return 1
}

function xpForDamage(damage: number, combo: number): number {
  return Math.round(damage * XP_PER_CORRECT_ANSWER * comboMultiplierFor(combo))
}

function applyDamage(
  state: BattleState,
  rawDamage: number
): { bossHp: number; marksDealt: number; lastDamage: number } {
  const bossHp = Math.max(0, state.bossHp - rawDamage)
  const marksDealt = Math.min(state.bossMaxHp, state.marksDealt + rawDamage)
  return { bossHp, marksDealt, lastDamage: rawDamage }
}

export function createBattleState(questions: BattleQuestion[]): BattleState {
  const bossMaxHp = questions.reduce((sum, q) => sum + q.marks, 0)
  return {
    questions,
    bossMaxHp,
    bossHp: bossMaxHp,
    shields: INITIAL_SHIELDS,
    readiness: null,
    videoShieldGranted: false,
    phase: 'intro',
    currentQuestionIndex: 0,
    currentStepIndex: 0,
    isReviewOnly: false,
    revealMode: 'full',
    mcqSelectedLetter: null,
    mcqCorrect: null,
    stepResults: [],
    combo: 0,
    comboBest: 0,
    xp: 0,
    marksDealt: 0,
    lastDamage: null,
  }
}

export function getCurrentQuestion(state: BattleState): BattleQuestion | null {
  return state.questions[state.currentQuestionIndex] ?? null
}

export function getCurrentStep(state: BattleState): BattleQuestionStep | null {
  const question = getCurrentQuestion(state)
  if (!question) return null
  return question.steps[state.currentStepIndex] ?? null
}

function handleSelectMcqOption(
  state: BattleState,
  action: Extract<BattleAction, { type: 'SELECT_MCQ_OPTION' }>
): BattleState {
  if (state.phase !== 'mcq') return state
  const question = getCurrentQuestion(state)
  if (!question) return state

  if (action.correct) {
    const combo = state.combo + 1
    const comboBest = Math.max(state.comboBest, combo)
    const damage = question.marks
    const { bossHp, marksDealt, lastDamage } = applyDamage(state, damage)
    const xp = state.xp + xpForDamage(damage, combo)
    const victorious = bossHp <= 0
    const enterReview = !victorious && state.readiness === 'not_sure'

    return {
      ...state,
      mcqSelectedLetter: action.letter,
      mcqCorrect: true,
      bossHp,
      marksDealt,
      lastDamage,
      combo,
      comboBest,
      xp,
      phase: victorious ? 'victory' : enterReview ? 'steps' : 'feedback',
      isReviewOnly: enterReview,
      currentStepIndex: 0,
      stepResults: enterReview ? question.steps.map(() => 'pending' as const) : [],
      revealMode: 'full',
    }
  }

  const shields = Math.max(0, state.shields - 1)
  const outOfShields = shields === 0

  return {
    ...state,
    mcqSelectedLetter: action.letter,
    mcqCorrect: false,
    combo: 0,
    shields,
    lastDamage: 0,
    phase: outOfShields ? 'retreat' : 'steps',
    isReviewOnly: false,
    currentStepIndex: 0,
    stepResults: outOfShields ? [] : question.steps.map(() => 'pending' as const),
    revealMode: state.readiness === 'got_this' ? 'short' : 'full',
  }
}

function handleStepSelfMark(
  state: BattleState,
  action: Extract<BattleAction, { type: 'STEP_SELF_MARK' }>
): BattleState {
  if (state.phase !== 'steps') return state
  const question = getCurrentQuestion(state)
  if (!question) return state

  const totalSteps = question.steps.length
  if (state.currentStepIndex >= totalSteps) return state

  const isLastStep = state.currentStepIndex === totalSteps - 1
  let bossHp = state.bossHp
  let marksDealt = state.marksDealt
  let lastDamage = 0
  let xp = state.xp

  if (!state.isReviewOnly && action.knew) {
    const perStep = Math.floor(question.marks / totalSteps)
    const remainder = question.marks - perStep * totalSteps
    const damage = perStep + (isLastStep ? remainder : 0)
    const applied = applyDamage(state, damage)
    bossHp = applied.bossHp
    marksDealt = applied.marksDealt
    lastDamage = applied.lastDamage
    xp = state.xp + xpForDamage(damage, state.combo)
  }

  const stepResults = state.stepResults.map((result, index) =>
    index === state.currentStepIndex ? (action.knew ? 'knew_it' : 'didnt_know') : result
  )
  const victorious = bossHp <= 0

  return {
    ...state,
    bossHp,
    marksDealt,
    lastDamage,
    xp,
    stepResults,
    currentStepIndex: state.currentStepIndex + 1,
    phase: victorious ? 'victory' : state.phase,
  }
}

function handleNextRound(state: BattleState): BattleState {
  if (state.phase !== 'feedback' && state.phase !== 'steps') return state

  const question = getCurrentQuestion(state)
  const stepsRemain = state.phase === 'steps' && state.currentStepIndex < (question?.steps.length ?? 0)
  if (stepsRemain) return state

  const nextIndex = state.currentQuestionIndex + 1
  if (nextIndex >= state.questions.length) {
    // Ran out of questions without defeating the boss (some review/step
    // was self-marked "didn't know") — this ends the battle the same way
    // a retreat does: XP earned so far is kept and remaining HP stands.
    return { ...state, phase: 'retreat' }
  }

  return {
    ...state,
    currentQuestionIndex: nextIndex,
    currentStepIndex: 0,
    isReviewOnly: false,
    revealMode: 'full',
    mcqSelectedLetter: null,
    mcqCorrect: null,
    stepResults: [],
    lastDamage: null,
    phase: 'mcq',
  }
}

export function battleReducer(state: BattleState, action: BattleAction): BattleState {
  switch (action.type) {
    case 'SET_READINESS':
      if (state.phase !== 'intro') return state
      return { ...state, readiness: action.readiness }

    case 'GRANT_VIDEO_SHIELD':
      if (state.videoShieldGranted) return state
      return { ...state, shields: state.shields + VIDEO_SHIELD_BONUS, videoShieldGranted: true }

    case 'START_BATTLE':
      if (state.phase !== 'intro' || !state.readiness) return state
      return { ...state, phase: 'mcq' }

    case 'SELECT_MCQ_OPTION':
      return handleSelectMcqOption(state, action)

    case 'STEP_SELF_MARK':
      return handleStepSelfMark(state, action)

    case 'SHOW_STEPS':
      if (state.phase !== 'steps') return state
      return { ...state, revealMode: 'full' }

    case 'ASK_ANGELO': {
      if (state.shields <= 0) return state
      const shields = state.shields - 1
      return { ...state, shields, phase: shields === 0 ? 'retreat' : state.phase }
    }

    case 'NEXT_ROUND':
      return handleNextRound(state)

    case 'RETREAT':
      if (state.phase === 'victory' || state.phase === 'retreat' || state.phase === 'intro') return state
      return { ...state, phase: 'retreat' }

    default:
      return state
  }
}
