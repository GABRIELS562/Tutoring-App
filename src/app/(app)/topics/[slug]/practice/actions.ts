'use server'

import { z } from 'zod'
import { requireUser } from '@/lib/auth/require-user'
import { isDemoMode } from '@/db'
import { saveProgress, recordWrongAnswer, applyDayRollover } from '@/db/queries/questions'
import { getUserById } from '@/db/queries/users'

const SAVE_ERROR = 'Could not save your answer'
const OUT_OF_HEARTS_ERROR = 'out_of_hearts'

const questionIdSchema = z.string().uuid()

export type RecordAnswerResult =
  | { ok: true; demo: true }
  | { ok: true; xpEarned: number }
  | { ok: false; error: string }

export type CompleteQuizResult =
  | { ok: true; demo: true }
  | { ok: true }
  | { ok: false; error: string }

/**
 * Persists a single answer: session user required (never trusts a
 * client-supplied userId or XP amount - XP is computed and applied
 * server-side, inside saveProgress()). No-ops (after auth) in demo
 * mode - there is no database to write to (db is a throwing Proxy
 * without DATABASE_URL).
 *
 * Refills hearts on a new SAST day BEFORE any hearts gate - this is
 * the only path a student at 0 hearts can ever reach (completeQuiz()
 * is unreachable once recordAnswer starts blocking them), so the
 * refill has to happen here, not only at quiz completion.
 *
 * Gates on hearts server-side, regardless of what the client's local
 * heart count says (defends against a stale/tampered client):
 *  - Correct answers never consume a heart, so a plain read is enough.
 *  - Wrong answers gate-and-decrement atomically in one statement
 *    (recordWrongAnswer) - no progress is saved when it's
 *    blocked.
 */
export async function recordAnswer(questionId: string, correct: boolean): Promise<RecordAnswerResult> {
  const parsedQuestionId = questionIdSchema.safeParse(questionId)
  if (!parsedQuestionId.success) {
    return { ok: false, error: 'Invalid question id' }
  }

  const user = await requireUser()

  if (isDemoMode) {
    return { ok: true, demo: true }
  }

  const rollover = await applyDayRollover(user.id)
  if (!rollover) {
    return { ok: false, error: SAVE_ERROR }
  }

  if (correct) {
    const userRow = await getUserById(user.id)
    if (!userRow) {
      return { ok: false, error: SAVE_ERROR }
    }

    const hearts = userRow.hearts ?? 0
    const isPremium = userRow.isPremium ?? false
    if (hearts <= 0 && !isPremium) {
      return { ok: false, error: OUT_OF_HEARTS_ERROR }
    }

    const progressResult = await saveProgress(user.id, parsedQuestionId.data, true)
    if (!progressResult) {
      return { ok: false, error: SAVE_ERROR }
    }

    return { ok: true, xpEarned: progressResult.xpEarned }
  }

  // One transaction: spend the heart and record the attempt together, or do
  // neither. Two separate statements meant a failed save left the heart
  // already gone, and the retry button then spent another one for the same
  // wrong answer.
  const wrongResult = await recordWrongAnswer(user.id, parsedQuestionId.data)
  if (!wrongResult.ok) {
    return {
      ok: false,
      error: wrongResult.reason === 'blocked' ? OUT_OF_HEARTS_ERROR : SAVE_ERROR,
    }
  }

  return { ok: true, xpEarned: wrongResult.xpEarned }
}

/**
 * Advances the session user's streak (and refills hearts, as a
 * best-effort safety net - see applyDayRollover()) once a quiz
 * completes. Takes no XP argument - XP was already applied per-answer
 * by recordAnswer()/saveProgress().
 */
export async function completeQuiz(): Promise<CompleteQuizResult> {
  const user = await requireUser()

  if (isDemoMode) {
    return { ok: true, demo: true }
  }

  const result = await applyDayRollover(user.id)
  if (!result) {
    return { ok: false, error: SAVE_ERROR }
  }

  return { ok: true }
}
