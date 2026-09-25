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

export interface CalibrationCopy {
  label: string
  detail: string
  tone: 'good' | 'warn' | 'info'
}

export const CALIBRATION_COPY: Record<Calibration, CalibrationCopy> = {
  mastered: {
    label: 'Mastered',
    detail: 'You said you had this, and you did. Nothing more to do here.',
    tone: 'good',
  },
  slipped: {
    label: 'Marks left behind',
    detail:
      'You knew this one - you just did not get all of it down. Losing part marks on a question you can do is the cheapest kind of mark to win back.',
    tone: 'warn',
  },
  'blind-spot': {
    label: 'Blind spot',
    detail:
      'You were sure about this one and it did not come out. That is the kind of mark that goes missing in the real exam, because there is no reason to go back and check it. Worth drilling.',
    tone: 'warn',
  },
  underconfident: {
    label: 'You knew more than you thought',
    detail:
      'You said this was new to you and then got it. Back yourself next time - claiming it is worth more.',
    tone: 'info',
  },
  'honest-gap': {
    label: 'Honest gap',
    detail: 'You said you were not sure, and you were right. This is what practice is for.',
    tone: 'info',
  },
}

/** Marks earned, given which descriptors the student satisfied. */
export function marksEarned(
  scheme: { descriptor: string; value: number }[],
  satisfied: string[]
): number {
  return scheme
    .filter((point) => satisfied.includes(point.descriptor))
    .reduce((sum, point) => sum + point.value, 0)
}
