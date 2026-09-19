'use server'

import { requireUser } from '@/lib/auth/require-user'
import { isDemoMode } from '@/db'
import { saveProgress, updateUserXP, decrementHearts } from '@/db/queries/questions'

export type ActionResult = { ok: true; demo?: true } | { ok: false; error: string }

/**
 * Persists a single answer: session user required (never trusts a
 * client-supplied userId), then saveProgress() + decrementHearts() on a
 * wrong answer. No-ops (after auth) in demo mode - there is no
 * database to write to (db is a throwing Proxy without DATABASE_URL).
 */
export async function recordAnswer(questionId: string, correct: boolean): Promise<ActionResult> {
  const user = await requireUser()

  if (isDemoMode) {
    return { ok: true, demo: true }
  }

  await saveProgress(user.id, questionId, correct)

  if (!correct) {
    await decrementHearts(user.id)
  }

  return { ok: true }
}

/**
 * Persists the XP earned for a completed quiz: session user required,
 * then exactly one updateUserXP() call (streak/hearts-refill logic
 * lives there). No-ops (after auth) in demo mode.
 */
export async function completeQuiz(totalXp: number): Promise<ActionResult> {
  const user = await requireUser()

  if (isDemoMode) {
    return { ok: true, demo: true }
  }

  await updateUserXP(user.id, totalXp)

  return { ok: true }
}
