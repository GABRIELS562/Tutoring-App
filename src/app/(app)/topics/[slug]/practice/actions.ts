'use server'

import { z } from 'zod'
import { requireUser } from '@/lib/auth/require-user'
import { isDemoMode } from '@/db'
import { saveProgress, decrementHearts, touchStreak } from '@/db/queries/questions'
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
 * Gates on hearts server-side: a non-premium user at 0 hearts can't
 * save an answer or earn XP, regardless of what the client thinks its
 * local heart count is (defends against a stale/tampered client).
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

  // One query for both hearts and premium status.
  const userRow = await getUserById(user.id)
  if (!userRow) {
    return { ok: false, error: SAVE_ERROR }
  }

  const hearts = userRow.hearts ?? 0
  const isPremium = userRow.isPremium ?? false
  if (hearts <= 0 && !isPremium) {
    return { ok: false, error: OUT_OF_HEARTS_ERROR }
  }

  const progressResult = await saveProgress(user.id, parsedQuestionId.data, correct)
  if (!progressResult) {
    return { ok: false, error: SAVE_ERROR }
  }

  if (!correct) {
    const heartsResult = await decrementHearts(user.id)
    if (!heartsResult) {
      return { ok: false, error: SAVE_ERROR }
    }
  }

  return { ok: true, xpEarned: progressResult.xpEarned }
}

/**
 * Advances the session user's streak (and refills hearts on a day
 * rollover) once a quiz completes. Takes no XP argument - XP was
 * already applied per-answer by recordAnswer()/saveProgress(); this
 * only handles the streak/day-rollover bookkeeping.
 */
export async function completeQuiz(): Promise<CompleteQuizResult> {
  const user = await requireUser()

  if (isDemoMode) {
    return { ok: true, demo: true }
  }

  const result = await touchStreak(user.id)
  if (!result) {
    return { ok: false, error: SAVE_ERROR }
  }

  return { ok: true }
}
