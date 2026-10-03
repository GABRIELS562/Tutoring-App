import { eq, sql } from 'drizzle-orm'
import { db } from '@/db'
import { users } from '@/db/schema'

export type CompleteModuleResult = {
  xpEarned: number
  newBadges: string[]
  alreadyCompleted: boolean
}

export type CompleteModuleInput = {
  userId: string
  moduleId: string
  /** Badge this module unlocks, if any. */
  badgeId?: string
  /** XP for the module itself. */
  moduleXp: number
  /** Extra XP the badge carries. */
  badgeXp: number
  /** Every module id, to decide whether this completes the set. */
  allModuleIds: readonly string[]
  /** The badge and bonus for finishing all of them. */
  completionBadgeId: string
  completionBonusXp: number
}

/**
 * Records an AI Skills module completion, once.
 *
 * The route used to do this as a plain read-modify-write through the
 * Supabase client: SELECT the arrays and xp, compute, UPDATE. Two requests
 * racing - a double-click, or a resent request - both read a list that did
 * not yet contain the module, both took the "first completion" branch, and
 * the second UPDATE overwrote the first. The visible damage was a
 * duplicated badge id and, when two DIFFERENT modules finished at once, one
 * of them silently vanishing along with its XP.
 *
 * This is the same shape as saveExamAttempt(): one transaction, the user
 * row locked with SELECT ... FOR UPDATE so the second caller waits and then
 * re-reads a list that already contains the module, and XP applied as an
 * atomic `xp + n` rather than a value computed from a stale read.
 *
 * Returns null if the write could not be made, so the caller can tell a
 * failure apart from "already done" - which the old code could not.
 */
export async function completeAiModule(
  input: CompleteModuleInput
): Promise<CompleteModuleResult | null> {
  try {
    return await db.transaction(async (tx) => {
      const rows = await tx
        .select({
          modules: users.aiModulesCompleted,
          badges: users.badges,
        })
        .from(users)
        .where(eq(users.id, input.userId))
        .for('update')
        .limit(1)

      const existing = rows[0]
      if (!existing) return null

      const modules = existing.modules ?? []
      const earned = existing.badges ?? []

      if (modules.includes(input.moduleId)) {
        return { xpEarned: 0, newBadges: [], alreadyCompleted: true }
      }

      const updatedModules = [...modules, input.moduleId]
      const newBadges: string[] = []
      let xpEarned = input.moduleXp

      if (input.badgeId && !earned.includes(input.badgeId)) {
        newBadges.push(input.badgeId)
        xpEarned += input.badgeXp
      }

      const finishedAll = input.allModuleIds.every((id) => updatedModules.includes(id))
      if (finishedAll && !earned.includes(input.completionBadgeId)) {
        newBadges.push(input.completionBadgeId)
        xpEarned += input.completionBonusXp
      }

      await tx
        .update(users)
        .set({
          aiModulesCompleted: updatedModules,
          // Deduped defensively: the lock makes a duplicate impossible, and
          // a badge appearing twice in a student's profile is exactly the
          // symptom the race used to produce.
          badges: [...new Set([...earned, ...newBadges])],
          xp: sql`${users.xp} + ${xpEarned}`,
        })
        .where(eq(users.id, input.userId))

      return { xpEarned, newBadges, alreadyCompleted: false }
    })
  } catch (error) {
    console.error('Error completing AI module:', error)
    return null
  }
}
