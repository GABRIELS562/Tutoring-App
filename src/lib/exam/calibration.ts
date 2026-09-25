/**
 * What a student claims about a question, and what that claim is worth once
 * you see how they actually did.
 *
 * The claim is not only a setting for how much help to show. Compared with
 * the outcome it is the most useful signal in the app: a student who says
 * "I've got this" and is wrong has a blind spot. They will not check that
 * work, will not ask about it, and will lose those marks in the real exam
 * without ever knowing why. Nothing else here can find that, because
 * nothing else asks first.
 */

export type Familiarity = 'new' | 'shaky' | 'confident'

/** How much to show before the attempt. */
export type Scaffold = 'teach' | 'nudge' | 'none'

export const SCAFFOLD: Record<Familiarity, Scaffold> = {
  new: 'teach',
  shaky: 'nudge',
  confident: 'none',
}

export type Calibration =
  | 'mastered'
  | 'slipped'
  | 'blind-spot'
  | 'underconfident'
  | 'honest-gap'

/**
 * Exam questions are not all or nothing, so this reads the mark fraction
 * rather than a bare right/wrong - but only FULL marks counts as mastery.
 * Telling a student who scored 1 of 2 that they have mastered it and there
 * is nothing more to do is exactly the wrong message: the missing mark is
 * the whole point.
 */
export function calibrationOf(
  familiarity: Familiarity,
  earned: number,
  available: number
): Calibration {
  const fraction = available > 0 ? earned / available : 0
  const full = fraction === 1

  if (familiarity === 'confident') {
    if (full) return 'mastered'
    // Partly there: they did know it, and lost marks on precision or on not
    // writing enough down. A different problem from not knowing it.
    return fraction >= 0.5 ? 'slipped' : 'blind-spot'
  }
  if (familiarity === 'new') return fraction >= 0.5 ? 'underconfident' : 'honest-gap'
  return full ? 'mastered' : 'honest-gap'
}

/**
 * Honesty has to be the winning strategy, or students will claim "new to me"
 * on everything to farm worked solutions. So a correct answer is worth more
 * when it was claimed, and being wrong is never punished - only the
 * miscalibration is surfaced, and only as information.
 */
export function xpFor(calibration: Calibration, earned: number): number {
  const base = earned * 10
  switch (calibration) {
    case 'mastered':
      return Math.round(base * 1.5)
    case 'slipped':
      return Math.round(base * 1.2)
    case 'underconfident':
      return base
    case 'blind-spot':
      // No penalty. Finding a blind spot is worth something in itself.
      return Math.round(base * 0.5) + 5
    case 'honest-gap':
      return base + 5
  }
}

/**
 * How a calibration result is presented. The words themselves live in
 * src/messages/{en,af}.json under `exam` - an Afrikaans learner sits an
 * Afrikaans paper and must be marked in Afrikaans - so this table carries
 * only the message key and the tone that drives the colour.
 */
export interface CalibrationCopy {
  /** Key into the `exam` message namespace; `${key}Detail` is the body. */
  key: 'mastered' | 'slipped' | 'blindSpot' | 'underconfident' | 'honestGap'
  tone: 'good' | 'warn' | 'info'
}

export const CALIBRATION_COPY: Record<Calibration, CalibrationCopy> = {
  mastered: { key: 'mastered', tone: 'good' },
  slipped: { key: 'slipped', tone: 'warn' },
  'blind-spot': { key: 'blindSpot', tone: 'warn' },
  underconfident: { key: 'underconfident', tone: 'info' },
  'honest-gap': { key: 'honestGap', tone: 'info' },
}

/**
 * Marks earned, given which mark points the student satisfied, identified by
 * their POSITION in the scheme.
 *
 * Position, not descriptor: a memo routinely awards two marks with the same
 * wording - question 1.1.1 gives 'answers' twice, once for each root of
 * (2x-1)(x+5)=0 - and 9 of the 105 items across the two papers do this, 37
 * marks in all. Matching on the descriptor string made those indivisible:
 * ticking one root ticked both, ticking the second unticked both, and a
 * student who got the question right scored zero.
 */
export function marksEarned(
  scheme: { value: number }[],
  satisfied: readonly number[]
): number {
  return scheme
    .filter((_, index) => satisfied.includes(index))
    .reduce((sum, point) => sum + point.value, 0)
}
