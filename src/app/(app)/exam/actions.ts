'use server'

import { z } from 'zod'
import { requireUser } from '@/lib/auth/require-user'
import { isDemoMode } from '@/db'
import { itemInPaper } from '@/content/exam'
import { calibrationOf, marksEarned, xpFor, type Calibration } from '@/lib/exam/calibration'
import { saveExamAttempt } from '@/db/queries/exam'
import { applyDayRollover } from '@/db/queries/questions'

const SAVE_ERROR = 'Could not save your answer'

/**
 * What the client is allowed to send: which question, what it claimed
 * beforehand, and which mark points it ticked. Notably NOT the marks
 * earned and NOT the XP - both are recomputed here from the mark scheme
 * in src/content/exam, exactly as practice never trusts a client-supplied
 * XP amount.
 */
const attemptSchema = z.object({
  paperKey: z.string().min(1).max(64),
  itemId: z.string().min(1).max(128),
  familiarity: z.enum(['new', 'shaky', 'confident']),
  satisfied: z.array(z.number().int().nonnegative()).max(64),
})

export type RecordExamAttemptResult =
  | { ok: true; demo: true }
  | { ok: true; xpEarned: number; marksEarned: number; calibration: Calibration }
  | { ok: false; error: string }

/**
 * Persists one exam answer.
 *
 * The marks are derived here, never accepted. `satisfied` arrives as
 * positions in the mark scheme - positions, not descriptors, because a memo
 * routinely awards two marks with identical wording (see marksEarned() in
 * lib/exam/calibration.ts).
 *
 * The normalisation below is belt-and-braces, not the protection: marksEarned
 * scores by filtering the SCHEME on index, so a repeated position is already
 * counted once and an out-of-range one already matches nothing. It is kept
 * because whether a client can inflate its own score should not rest on an
 * incidental property of a helper's implementation - and the tests assert the
 * behaviour at this boundary, so they hold whichever layer provides it.
 */
export async function recordExamAttempt(
  input: z.input<typeof attemptSchema>
): Promise<RecordExamAttemptResult> {
  const parsed = attemptSchema.safeParse(input)
  if (!parsed.success) {
    return { ok: false, error: 'Invalid attempt' }
  }

  const { paperKey, itemId, familiarity, satisfied } = parsed.data

  const user = await requireUser()

  // The question is resolved from static content, so an unknown or
  // mismatched (paper, item) pair is rejected before any write - and
  // before the demo-mode shortcut, so a bad id is reported the same way
  // in both modes rather than silently succeeding in demo.
  const item = itemInPaper(paperKey, itemId)
  if (!item) {
    return { ok: false, error: 'Unknown question' }
  }

  const ticked = [...new Set(satisfied)].filter((index) => index < item.markScheme.length)

  const earned = marksEarned(item.markScheme, ticked)
  const calibration = calibrationOf(familiarity, earned, item.marks)
  const xpIfFirst = xpFor(calibration, earned)

  if (isDemoMode) {
    return { ok: true, demo: true }
  }

  // Best effort, and before the save: a student sitting a paper on a new
  // day should have their streak advanced and hearts refilled whether or
  // not this particular answer persists. A failure here must not lose the
  // answer, so its result is not checked - unlike practice, the exam game
  // does not spend hearts, so nothing here gates the attempt.
  await applyDayRollover(user.id)

  const saved = await saveExamAttempt({
    userId: user.id,
    paperKey,
    itemId,
    familiarity,
    calibration,
    marksEarned: earned,
    marksAvailable: item.marks,
    xpIfFirst,
  })

  if (!saved) {
    return { ok: false, error: SAVE_ERROR }
  }

  return { ok: true, xpEarned: saved.xpEarned, marksEarned: earned, calibration }
}
