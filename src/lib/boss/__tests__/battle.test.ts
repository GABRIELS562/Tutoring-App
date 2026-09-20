import { describe, it, expect } from 'vitest'
import {
  battleReducer,
  createBattleState,
  comboMultiplierFor,
  getCurrentQuestion,
  getCurrentStep,
  INITIAL_SHIELDS,
  type BattleQuestion,
  type BattleState,
} from '../battle'

function makeQuestion(overrides: Partial<BattleQuestion> = {}): BattleQuestion {
  return {
    id: 'q1',
    questionText: 'Simplify $\\sin 210°$',
    marks: 3,
    options: [
      { id: 'a1', optionLetter: 'A', optionText: 'wrong', isCorrect: false },
      { id: 'a2', optionLetter: 'B', optionText: 'right', isCorrect: true },
    ],
    steps: [
      { id: 's1', stepNumber: 1, instruction: 'step 1', hint: null, correctAnswer: 'x', explanation: null },
      { id: 's2', stepNumber: 2, instruction: 'step 2', hint: null, correctAnswer: 'y', explanation: null },
      { id: 's3', stepNumber: 3, instruction: 'step 3', hint: null, correctAnswer: 'z', explanation: null },
    ],
    ...overrides,
  }
}

function readyToBattle(state: BattleState, readiness: BattleState['readiness'] = 'kind_of'): BattleState {
  let next = battleReducer(state, { type: 'SET_READINESS', readiness: readiness! })
  next = battleReducer(next, { type: 'START_BATTLE' })
  return next
}

describe('createBattleState', () => {
  it('sets boss HP to the sum of question marks and starts with 3 shields', () => {
    const state = createBattleState([makeQuestion({ marks: 2 }), makeQuestion({ id: 'q2', marks: 4 })])

    expect(state.bossMaxHp).toBe(6)
    expect(state.bossHp).toBe(6)
    expect(state.shields).toBe(INITIAL_SHIELDS)
    expect(state.phase).toBe('intro')
  })
})

describe('readiness and starting the battle', () => {
  it('records readiness and moves from intro to mcq on START_BATTLE', () => {
    const initial = createBattleState([makeQuestion()])
    const withReadiness = battleReducer(initial, { type: 'SET_READINESS', readiness: 'got_this' })
    expect(withReadiness.readiness).toBe('got_this')
    expect(withReadiness.phase).toBe('intro')

    const started = battleReducer(withReadiness, { type: 'START_BATTLE' })
    expect(started.phase).toBe('mcq')
  })

  it('refuses to start without readiness set', () => {
    const initial = createBattleState([makeQuestion()])
    const started = battleReducer(initial, { type: 'START_BATTLE' })
    expect(started.phase).toBe('intro')
  })
})

describe('correct MCQ answer', () => {
  it('deals full marks damage and increments combo', () => {
    const state = readyToBattle(createBattleState([makeQuestion({ marks: 3 }), makeQuestion({ id: 'q2', marks: 3 })]))
    const next = battleReducer(state, { type: 'SELECT_MCQ_OPTION', letter: 'B', correct: true })

    expect(next.bossHp).toBe(3) // 6 - 3
    expect(next.lastDamage).toBe(3)
    expect(next.combo).toBe(1)
    expect(next.comboBest).toBe(1)
    expect(next.phase).toBe('feedback')
    expect(next.xp).toBeGreaterThan(0)
  })

  it('goes to review steps (no extra damage) when readiness is not_sure', () => {
    const state = readyToBattle(
      createBattleState([makeQuestion({ marks: 3 }), makeQuestion({ id: 'q2', marks: 3 })]),
      'not_sure'
    )
    const answered = battleReducer(state, { type: 'SELECT_MCQ_OPTION', letter: 'B', correct: true })

    expect(answered.phase).toBe('steps')
    expect(answered.isReviewOnly).toBe(true)
    expect(answered.bossHp).toBe(3)

    // Self-marking "yes" during review deals no further damage.
    const reviewed = battleReducer(answered, { type: 'STEP_SELF_MARK', knew: true })
    expect(reviewed.bossHp).toBe(3)
    expect(reviewed.stepResults[0]).toBe('knew_it')
  })
})

describe('wrong MCQ answer', () => {
  it('loses a shield, deals no damage, and enters the steps phase', () => {
    const state = readyToBattle(createBattleState([makeQuestion({ marks: 4 })]))
    const next = battleReducer(state, { type: 'SELECT_MCQ_OPTION', letter: 'A', correct: false })

    expect(next.shields).toBe(INITIAL_SHIELDS - 1)
    expect(next.bossHp).toBe(4)
    expect(next.combo).toBe(0)
    expect(next.phase).toBe('steps')
    expect(next.isReviewOnly).toBe(false)
  })

  it('defaults to short reveal mode when readiness is got_this', () => {
    const state = readyToBattle(createBattleState([makeQuestion()]), 'got_this')
    const next = battleReducer(state, { type: 'SELECT_MCQ_OPTION', letter: 'A', correct: false })
    expect(next.revealMode).toBe('short')

    const shown = battleReducer(next, { type: 'SHOW_STEPS' })
    expect(shown.revealMode).toBe('full')
  })

  it('defaults to full reveal mode when readiness is kind_of or not_sure', () => {
    const kindOf = readyToBattle(createBattleState([makeQuestion()]), 'kind_of')
    const kindOfAnswered = battleReducer(kindOf, { type: 'SELECT_MCQ_OPTION', letter: 'A', correct: false })
    expect(kindOfAnswered.revealMode).toBe('full')
  })

  it('retreats immediately when the wrong answer drops shields to 0', () => {
    let state = readyToBattle(createBattleState([makeQuestion(), makeQuestion({ id: 'q2' }), makeQuestion({ id: 'q3' }), makeQuestion({ id: 'q4' })]))
    state = battleReducer(state, { type: 'SELECT_MCQ_OPTION', letter: 'A', correct: false })
    state = battleReducer(state, { type: 'NEXT_ROUND' }) // can't advance mid-steps
    expect(state.phase).toBe('steps')
  })
})

describe('step self-mark damage split', () => {
  it('splits marks across steps, remainder on the last step', () => {
    // 5 marks over 3 steps -> 1, 1, 3
    let state = readyToBattle(createBattleState([makeQuestion({ marks: 5 })]))
    state = battleReducer(state, { type: 'SELECT_MCQ_OPTION', letter: 'A', correct: false }) // wrong -> steps, hp still 5

    state = battleReducer(state, { type: 'STEP_SELF_MARK', knew: true })
    expect(state.lastDamage).toBe(1)
    expect(state.bossHp).toBe(4)

    state = battleReducer(state, { type: 'STEP_SELF_MARK', knew: true })
    expect(state.lastDamage).toBe(1)
    expect(state.bossHp).toBe(3)

    state = battleReducer(state, { type: 'STEP_SELF_MARK', knew: true })
    expect(state.lastDamage).toBe(3) // 1 + remainder(2)
    expect(state.bossHp).toBe(0)
    expect(state.phase).toBe('victory')
  })

  it('deals no damage and no shield loss when the student says they did not know', () => {
    let state = readyToBattle(createBattleState([makeQuestion({ marks: 6 })]))
    state = battleReducer(state, { type: 'SELECT_MCQ_OPTION', letter: 'A', correct: false })
    const shieldsAfterWrong = state.shields

    state = battleReducer(state, { type: 'STEP_SELF_MARK', knew: false })
    expect(state.bossHp).toBe(6)
    expect(state.shields).toBe(shieldsAfterWrong)
    expect(state.stepResults[0]).toBe('didnt_know')
  })
})

describe('combo thresholds', () => {
  it('applies 1.5x XP at 3 in a row and 2x at 5 in a row', () => {
    const questions = Array.from({ length: 5 }, (_, i) => makeQuestion({ id: `q${i}`, marks: 2 }))
    let state = readyToBattle(createBattleState(questions))

    const xpGains: number[] = []
    for (let i = 0; i < 5; i++) {
      const before = state.xp
      state = battleReducer(state, { type: 'SELECT_MCQ_OPTION', letter: 'B', correct: true })
      xpGains.push(state.xp - before)
      state = battleReducer(state, { type: 'NEXT_ROUND' })
    }

    // marks=2 each: 1x -> 20, 1x -> 20, 1.5x -> 30, 1.5x -> 30, 2x -> 40
    expect(xpGains).toEqual([20, 20, 30, 30, 40])
    expect(comboMultiplierFor(1)).toBe(1)
    expect(comboMultiplierFor(3)).toBe(1.5)
    expect(comboMultiplierFor(5)).toBe(2)
  })

  it('resets combo on a wrong answer', () => {
    let state = readyToBattle(createBattleState([makeQuestion({ id: 'q1' }), makeQuestion({ id: 'q2' })]))
    state = battleReducer(state, { type: 'SELECT_MCQ_OPTION', letter: 'B', correct: true })
    expect(state.combo).toBe(1)
    state = battleReducer(state, { type: 'NEXT_ROUND' })
    state = battleReducer(state, { type: 'SELECT_MCQ_OPTION', letter: 'A', correct: false })
    expect(state.combo).toBe(0)
  })
})

describe('Ask Angelo', () => {
  it('costs 1 shield', () => {
    const state = readyToBattle(createBattleState([makeQuestion()]))
    const next = battleReducer(state, { type: 'ASK_ANGELO' })
    expect(next.shields).toBe(INITIAL_SHIELDS - 1)
  })

  it('refuses (no-op) at 0 shields', () => {
    let state = readyToBattle(createBattleState([makeQuestion()]))
    state = battleReducer(state, { type: 'ASK_ANGELO' })
    state = battleReducer(state, { type: 'ASK_ANGELO' })
    state = battleReducer(state, { type: 'ASK_ANGELO' })
    expect(state.shields).toBe(0)
    expect(state.phase).toBe('retreat')

    const refused = battleReducer(state, { type: 'ASK_ANGELO' })
    expect(refused).toBe(state)
    expect(refused.shields).toBe(0)
  })

  it('triggers retreat when it drops shields to 0', () => {
    let state = readyToBattle(createBattleState([makeQuestion()]))
    state = battleReducer(state, { type: 'ASK_ANGELO' })
    state = battleReducer(state, { type: 'ASK_ANGELO' })
    expect(state.phase).toBe('mcq')
    state = battleReducer(state, { type: 'ASK_ANGELO' })
    expect(state.shields).toBe(0)
    expect(state.phase).toBe('retreat')
  })
})

describe('video shield', () => {
  it('is granted once and does not stack on repeated grants', () => {
    let state = createBattleState([makeQuestion()])
    state = battleReducer(state, { type: 'GRANT_VIDEO_SHIELD' })
    expect(state.shields).toBe(INITIAL_SHIELDS + 1)
    expect(state.videoShieldGranted).toBe(true)

    state = battleReducer(state, { type: 'GRANT_VIDEO_SHIELD' })
    expect(state.shields).toBe(INITIAL_SHIELDS + 1)
  })
})

describe('retreat', () => {
  it('keeps XP earned so far and remembers remaining boss HP', () => {
    let state = readyToBattle(createBattleState([makeQuestion({ marks: 3 }), makeQuestion({ id: 'q2', marks: 3 })]))
    state = battleReducer(state, { type: 'SELECT_MCQ_OPTION', letter: 'B', correct: true })
    const xpEarned = state.xp
    const hpBeforeRetreat = state.bossHp

    state = battleReducer(state, { type: 'NEXT_ROUND' })
    state = battleReducer(state, { type: 'RETREAT' })

    expect(state.phase).toBe('retreat')
    expect(state.xp).toBe(xpEarned)
    expect(state.bossHp).toBe(hpBeforeRetreat)
  })

  it('is a no-op from intro and from a finished battle', () => {
    const initial = createBattleState([makeQuestion()])
    expect(battleReducer(initial, { type: 'RETREAT' }).phase).toBe('intro')
  })

  it('ends the battle as a retreat when questions run out without defeating the boss', () => {
    let state = readyToBattle(createBattleState([makeQuestion({ marks: 4 })]))
    state = battleReducer(state, { type: 'SELECT_MCQ_OPTION', letter: 'A', correct: false })
    // Self-mark "didn't know" on every step -> 0 damage dealt, boss survives.
    for (let i = 0; i < 3; i++) {
      state = battleReducer(state, { type: 'STEP_SELF_MARK', knew: false })
    }
    expect(state.bossHp).toBe(4)
    state = battleReducer(state, { type: 'NEXT_ROUND' })
    expect(state.phase).toBe('retreat')
  })
})

describe('victory', () => {
  it('triggers when boss HP reaches 0 or below', () => {
    let state = readyToBattle(createBattleState([makeQuestion({ marks: 3 })]))
    state = battleReducer(state, { type: 'SELECT_MCQ_OPTION', letter: 'B', correct: true })
    expect(state.bossHp).toBe(0)
    expect(state.phase).toBe('victory')
  })
})

describe('selectors', () => {
  it('getCurrentQuestion / getCurrentStep return null past the end', () => {
    const state = createBattleState([])
    expect(getCurrentQuestion(state)).toBeNull()
    expect(getCurrentStep(state)).toBeNull()
  })
})
