import { db } from '@/db'
import { examAttempts, users } from '@/db/schema'
import { and, eq, sql } from 'drizzle-orm'
import type { Calibration, Familiarity } from '@/lib/exam/calibration'

export type ExamAttemptRecord = {
  itemId: string
  paperKey: string
  familiarity: Familiarity
  calibration: Calibration
  marksEarned: number
  marksAvailable: number
  xpEarned: number
  attempts: number
}

export type SaveExamAttemptInput = {
  userId: string
  paperKey: string
  itemId: string
  familiarity: Familiarity
  calibration: Calibration
  marksEarned: number
  marksAvailable: number
  /** What this attempt would be worth if it is the first one. */
  xpIfFirst: number
}

/**
 * Persists one exam answer and, on the FIRST attempt at that item, applies
 * its XP to users.xp - both inside one transaction with the row locked, so
 * two concurrent submissions for the same (user, item) cannot both read
 * "no attempt yet" and both award XP.
 *
 * Same two-step upsert-and-lock as saveProgress() in questions.ts, relying
 * on exam_attempts_user_item_unique:
 *   1. INSERT ... ON CONFLICT DO NOTHING - only truly inserts on the first
 *      attempt; a concurrent loser's insert becomes a no-op, not a
 *      duplicate row.
 *   2. SELECT ... FOR UPDATE - the second transaction blocks here until the
 *      first commits, then re-reads a row whose attempts is already 1, so
 *      its own award correctly comes out 0.
 *
 * Re-attempts update the record (a student who comes back and now gets it
 * right should see that) but earn nothing further. Awarding again would
 * make replaying one question the fastest way to farm XP, and the exam
 * game's whole premise is that honesty is the winning strategy - see
 * xpFor() in lib/exam/calibration.ts.
 */
export async function saveExamAttempt(
  input: SaveExamAttemptInput
): Promise<{ xpEarned: number; firstAttempt: boolean } | null> {
  try {
    return await db.transaction(async (tx) => {
      await tx
        .insert(examAttempts)
        .values({
          userId: input.userId,
          paperKey: input.paperKey,
          itemId: input.itemId,
          familiarity: input.familiarity,
          calibration: input.calibration,
          marksEarned: input.marksEarned,
          marksAvailable: input.marksAvailable,
          xpEarned: 0,
          attempts: 0,
        })
        .onConflictDoNothing({
          target: [examAttempts.userId, examAttempts.itemId],
        })

      const rows = await tx
        .select()
        .from(examAttempts)
        .where(
          and(eq(examAttempts.userId, input.userId), eq(examAttempts.itemId, input.itemId))
        )
        .for('update')
        .limit(1)

      const existing = rows[0]
      if (!existing) {
        // Unreachable - the insert above guarantees a row - but fail safe
        // rather than throw inside a transaction callback.
        return { xpEarned: 0, firstAttempt: false }
      }

      const firstAttempt = existing.attempts === 0
      const xpToAward = firstAttempt ? input.xpIfFirst : 0

      await tx
        .update(examAttempts)
        .set({
          paperKey: input.paperKey,
          familiarity: input.familiarity,
          calibration: input.calibration,
          marksEarned: input.marksEarned,
          marksAvailable: input.marksAvailable,
          attempts: sql`${examAttempts.attempts} + 1`,
          attemptedAt: new Date(),
          xpEarned: xpToAward > 0
            ? sql`${examAttempts.xpEarned} + ${xpToAward}`
            : examAttempts.xpEarned,
        })
        .where(eq(examAttempts.id, existing.id))

      if (xpToAward > 0) {
        await tx
          .update(users)
          .set({ xp: sql`${users.xp} + ${xpToAward}` })
          .where(eq(users.id, input.userId))
      }

      return { xpEarned: xpToAward, firstAttempt }
    })
  } catch (error) {
    console.error('Error saving exam attempt:', error)
    return null
  }
}

/**
 * Every attempt this student has made on one paper, so the exam page can
 * rehydrate instead of showing a completed paper as untouched.
 *
 * Returns [] rather than throwing when the database is unreachable: a
 * student who cannot load their history should still be able to sit the
 * paper. They lose the rehydration, not the exam.
 */
export async function getExamAttemptsForPaper(
  userId: string,
  paperKey: string
): Promise<ExamAttemptRecord[]> {
  try {
    const rows = await db
      .select()
      .from(examAttempts)
      .where(and(eq(examAttempts.userId, userId), eq(examAttempts.paperKey, paperKey)))

    return rows.map((row) => ({
      itemId: row.itemId,
      paperKey: row.paperKey,
      familiarity: row.familiarity as Familiarity,
      calibration: row.calibration as Calibration,
      marksEarned: row.marksEarned,
      marksAvailable: row.marksAvailable,
      xpEarned: row.xpEarned,
      attempts: row.attempts,
    }))
  } catch (error) {
    console.error('Error loading exam attempts:', error)
    return []
  }
}

export type ExamPaperSummary = {
  paperKey: string
  itemsAttempted: number
  marksEarned: number
  marksAvailable: number
  xpEarned: number
  /** How many of this paper's answered questions landed in each calibration. */
  blindSpots: number
  mastered: number
}

/**
 * One row per paper the student has touched, for the progress page.
 *
 * blindSpots is surfaced separately from the mark total because it is the
 * number that should change what a student does next: questions they were
 * confident about and got wrong are the ones they will not revisit on their
 * own.
 */
export async function getExamSummary(userId: string): Promise<ExamPaperSummary[]> {
  try {
    const rows = await db
      .select({
        paperKey: examAttempts.paperKey,
        itemsAttempted: sql<number>`count(*)`,
        marksEarned: sql<number>`coalesce(sum(${examAttempts.marksEarned}), 0)`,
        marksAvailable: sql<number>`coalesce(sum(${examAttempts.marksAvailable}), 0)`,
        xpEarned: sql<number>`coalesce(sum(${examAttempts.xpEarned}), 0)`,
        blindSpots: sql<number>`count(*) filter (where ${examAttempts.calibration} = 'blind-spot')`,
        mastered: sql<number>`count(*) filter (where ${examAttempts.calibration} = 'mastered')`,
      })
      .from(examAttempts)
      .where(eq(examAttempts.userId, userId))
      .groupBy(examAttempts.paperKey)

    return rows.map((row) => ({
      paperKey: row.paperKey,
      itemsAttempted: Number(row.itemsAttempted) || 0,
      marksEarned: Number(row.marksEarned) || 0,
      marksAvailable: Number(row.marksAvailable) || 0,
      xpEarned: Number(row.xpEarned) || 0,
      blindSpots: Number(row.blindSpots) || 0,
      mastered: Number(row.mastered) || 0,
    }))
  } catch (error) {
    console.error('Error loading exam summary:', error)
    return []
  }
}
