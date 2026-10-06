import { and, eq, sql } from 'drizzle-orm'
import { db } from '@/db'
import { promptChallengeAttempts, users } from '@/db/schema'

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

export type PromptChallengeResult = {
  attemptId: string
  xpEarned: number
  newBadges: string[]
  totalChallengesCompleted: number
}

export type PromptChallengeInput = {
  userId: string
  challengeId: string
  studentPrompt: string
  /** 1-5, as graded by the model. */
  score: number
  feedback: string
  improvedPrompt: string
  /** XP per star on a first completion. */
  xpPerStar: number
  /** Badge for a perfect score, if the student does not already hold it. */
  masterBadgeId: string
  masterBadgeXp: number
}

/**
 * Records a prompt-engineering attempt and awards its XP, once, atomically.
 *
 * The route used to do this as three separate Supabase calls: INSERT the
 * attempt, SELECT the user's xp/badges, UPDATE them back. Every failure
 * after the first was swallowed - a failed SELECT returned early reporting
 * the XP as earned, and a failed UPDATE only logged - so the route replied
 * `persisted: true` and the student saw badge confetti for XP that was
 * never applied. The write that mattered had silently not happened.
 *
 * It was also the same lost-update race completeAiModule() above was
 * written to fix: xp was read, incremented in JavaScript, and written
 * back, so two attempts finishing together both read the same starting
 * value and the second overwrote the first.
 *
 * This is one transaction. The user row is locked first, so a second
 * caller waits rather than racing; the attempt row and the XP move
 * together or not at all; and XP is applied as `xp + n` rather than a
 * value computed from a stale read. Returning null on failure is the
 * point - it lets the caller say `persisted: false` instead of
 * celebrating.
 */
export async function recordPromptChallengeAttempt(
  input: PromptChallengeInput
): Promise<PromptChallengeResult | null> {
  try {
    return await db.transaction(async (tx) => {
      const userRows = await tx
        .select({
          xp: users.xp,
          badges: users.badges,
          completed: users.promptChallengesCompleted,
        })
        .from(users)
        .where(eq(users.id, input.userId))
        .for('update')
        .limit(1)

      const user = userRows[0]
      if (!user) return null

      const earnedBadges = user.badges ?? []
      const completed = user.completed ?? 0

      const existingRows = await tx
        .select({ id: promptChallengeAttempts.id, score: promptChallengeAttempts.aiScore })
        .from(promptChallengeAttempts)
        .where(
          and(
            eq(promptChallengeAttempts.userId, input.userId),
            eq(promptChallengeAttempts.challengeId, input.challengeId)
          )
        )
        .limit(1)

      const existing = existingRows[0]

      // A repeat attempt. The best prompt wins, but XP and badges are
      // awarded once, on first completion - so nothing touches the user
      // row here.
      if (existing) {
        if (input.score > (existing.score ?? 0)) {
          await tx
            .update(promptChallengeAttempts)
            .set({
              studentPrompt: input.studentPrompt,
              aiScore: input.score,
              aiFeedback: input.feedback,
              improvedPrompt: input.improvedPrompt,
            })
            .where(eq(promptChallengeAttempts.id, existing.id))
        }

        return {
          attemptId: existing.id,
          xpEarned: 0,
          newBadges: [],
          totalChallengesCompleted: completed,
        }
      }

      const newBadges: string[] = []
      let xpEarned = input.score * input.xpPerStar

      if (input.score === 5 && !earnedBadges.includes(input.masterBadgeId)) {
        newBadges.push(input.masterBadgeId)
        xpEarned += input.masterBadgeXp
      }

      const insertedRows = await tx
        .insert(promptChallengeAttempts)
        .values({
          userId: input.userId,
          challengeId: input.challengeId,
          studentPrompt: input.studentPrompt,
          aiScore: input.score,
          aiFeedback: input.feedback,
          improvedPrompt: input.improvedPrompt,
          xpEarned,
        })
        .returning({ id: promptChallengeAttempts.id })

      const inserted = insertedRows[0]
      if (!inserted) return null

      await tx
        .update(users)
        .set({
          xp: sql`${users.xp} + ${xpEarned}`,
          badges: [...new Set([...earnedBadges, ...newBadges])],
          promptChallengesCompleted: sql`${users.promptChallengesCompleted} + 1`,
        })
        .where(eq(users.id, input.userId))

      return {
        attemptId: inserted.id,
        xpEarned,
        newBadges,
        totalChallengesCompleted: completed + 1,
      }
    })
  } catch (error) {
    console.error('Error recording prompt challenge attempt:', error)
    return null
  }
}
