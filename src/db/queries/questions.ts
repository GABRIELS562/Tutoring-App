import { db } from '@/db'
import { questions, questionOptions, steps, topics, studentProgress, users } from '@/db/schema'
import { eq, and, or, gt, sql, inArray } from 'drizzle-orm'
import { todaySast, yesterdaySast } from '@/lib/dates'
import { XP_PER_CORRECT_ANSWER, MAX_HEARTS } from '@/lib/game-rules'

export type QuestionWithDetails = {
  id: string
  topicId: string | null
  topicSlug: string
  topicName: string
  source: string | null
  year: number | null
  examType: string | null
  questionText: string
  marks: number | null
  difficulty: number | null
  hasDiagram: boolean | null
  diagramUrl: string | null
  isMultipleChoice: boolean | null
  options: {
    id: string
    optionLetter: string | null
    optionText: string
    isCorrect: boolean | null
  }[]
  steps: {
    id: string
    stepNumber: number
    instruction: string
    hint: string | null
    correctAnswer: string
    explanation: string | null
  }[]
}

export async function getQuestionsByTopic(
  topicSlug: string,
  difficulty?: number
): Promise<QuestionWithDetails[]> {
  try {
    // Build the where conditions
    const conditions = [
      eq(topics.slug, topicSlug),
      eq(questions.isApproved, true)
    ]

    if (difficulty) {
      conditions.push(eq(questions.difficulty, difficulty))
    }

    // Get questions for the topic
    const questionRows = await db
      .select({
        id: questions.id,
        topicId: questions.topicId,
        topicSlug: topics.slug,
        topicName: topics.name,
        source: questions.source,
        year: questions.year,
        examType: questions.examType,
        questionText: questions.questionText,
        marks: questions.marks,
        difficulty: questions.difficulty,
        hasDiagram: questions.hasDiagram,
        diagramUrl: questions.diagramUrl,
        isMultipleChoice: questions.isMultipleChoice,
      })
      .from(questions)
      .innerJoin(topics, eq(questions.topicId, topics.id))
      .where(and(...conditions))
      .orderBy(sql`RANDOM()`)
      .limit(10)

    // Get options and steps for each question
    // Two queries for the whole batch, not two per question. This used to
    // fan out to 2N round trips - up to 20 for a 10-question quiz - on the
    // most frequently hit path in the app.
    const questionIds = questionRows.map((q) => q.id)
    const [optionRows, stepRows] = await Promise.all([
      db
        .select()
        .from(questionOptions)
        .where(inArray(questionOptions.questionId, questionIds))
        .orderBy(questionOptions.optionLetter),
      db
        .select()
        .from(steps)
        .where(inArray(steps.questionId, questionIds))
        .orderBy(steps.stepNumber),
    ])

    const optionsByQuestion = new Map<string, typeof optionRows>()
    for (const option of optionRows) {
      const list = optionsByQuestion.get(option.questionId!) ?? []
      list.push(option)
      optionsByQuestion.set(option.questionId!, list)
    }

    const stepsByQuestion = new Map<string, typeof stepRows>()
    for (const step of stepRows) {
      const list = stepsByQuestion.get(step.questionId!) ?? []
      list.push(step)
      stepsByQuestion.set(step.questionId!, list)
    }

    const questionsWithDetails: QuestionWithDetails[] = questionRows.map((q) => ({
      ...q,
      options: (optionsByQuestion.get(q.id) ?? []).map((o) => ({
        id: o.id,
        optionLetter: o.optionLetter,
        optionText: o.optionText,
        isCorrect: o.isCorrect,
      })),
      steps: (stepsByQuestion.get(q.id) ?? []).map((st) => ({
        id: st.id,
        stepNumber: st.stepNumber,
        instruction: st.instruction,
        hint: st.hint,
        correctAnswer: st.correctAnswer,
        explanation: st.explanation,
      })),
    }))

    return questionsWithDetails
  } catch (error) {
    console.error('Error fetching questions:', error)
    return []
  }
}

/**
 * Persists one answer AND, when it earns XP, atomically applies that
 * XP to users.xp - all inside one transaction with the student_progress
 * row locked for its duration, so two concurrent submissions for the
 * same (user, question) can't both read "not yet correct" and both
 * award XP.
 *
 * Two-step upsert-and-lock, relying on the
 * student_progress_user_question_unique index (schema.ts /
 * supabase/migrations/0001_rls.sql):
 *   1. INSERT ... ON CONFLICT (user_id, question_id) DO NOTHING - only
 *      ever actually inserts on this question's first-ever attempt.
 *      Two concurrent first attempts both try this; the loser's insert
 *      becomes a no-op instead of a duplicate row.
 *   2. SELECT ... FOR UPDATE on that (now guaranteed to exist) row -
 *      this is what serializes concurrent submissions: the second
 *      transaction blocks here until the first commits, then re-reads
 *      the row it just committed (status already 'correct'), so its
 *      own xpToAward correctly comes out 0.
 * A question already marked 'correct' from a prior (non-concurrent)
 * attempt earns nothing on a repeat correct answer either, by the same
 * status check - so replaying the same question can't farm XP.
 */
/**
 * The body of saveProgress, taking the transaction rather than opening one,
 * so a caller that must do more work atomically can join it.
 */
type Tx = Parameters<Parameters<typeof db.transaction>[0]>[0]

async function saveProgressWithin(
  tx: Tx,
  userId: string,
  questionId: string,
  correct: boolean
): Promise<{ xpEarned: number }> {
  {
    {
      await tx
        .insert(studentProgress)
        .values({ userId, questionId })
        .onConflictDoNothing({
          target: [studentProgress.userId, studentProgress.questionId],
        })

      const rows = await tx
        .select()
        .from(studentProgress)
        .where(
          and(
            eq(studentProgress.userId, userId),
            eq(studentProgress.questionId, questionId)
          )
        )
        .for('update')
        .limit(1)

      const existing = rows[0]
      if (!existing) {
        // Should be unreachable - the insert above guarantees a row -
        // but fail safe rather than throw inside a transaction callback.
        return { xpEarned: 0 }
      }

      const wasAlreadyCorrect = existing.status === 'correct'
      const xpToAward = correct && !wasAlreadyCorrect ? XP_PER_CORRECT_ANSWER : 0

      await tx
        .update(studentProgress)
        .set({
          status: correct ? 'correct' : 'incorrect',
          attempts: sql`${studentProgress.attempts} + 1`,
          lastAttemptedAt: new Date(),
          xpEarned: xpToAward > 0
            ? sql`${studentProgress.xpEarned} + ${xpToAward}`
            : studentProgress.xpEarned,
        })
        .where(eq(studentProgress.id, existing.id))

      if (xpToAward > 0) {
        await tx
          .update(users)
          .set({ xp: sql`${users.xp} + ${xpToAward}` })
          .where(eq(users.id, userId))
      }

      return { xpEarned: xpToAward }
    }
  }
}

export async function saveProgress(
  userId: string,
  questionId: string,
  correct: boolean
): Promise<{ xpEarned: number } | null> {
  try {
    return await db.transaction((tx) => saveProgressWithin(tx, userId, questionId, correct))
  } catch (error) {
    console.error('Error saving progress:', error)
    return null
  }
}

/**
 * A wrong answer: spend a heart AND record the attempt, or do neither.
 *
 * These used to be two independent statements in recordAnswer. The heart was
 * decremented first, so when the progress write then failed the action
 * returned a save error with the heart already gone - and QuizEngine's
 * retry button called recordAnswer again, spending a SECOND heart for one
 * wrong answer. The client's heart count is derived from its own answer
 * history, so it never showed the loss; the student simply ran out earlier
 * than the screen said they should, or found hearts missing next session.
 *
 * Inside one transaction a failed save rolls the heart back, which makes the
 * retry safe: it costs exactly one heart however many times it is attempted.
 */
export async function recordWrongAnswer(
  userId: string,
  questionId: string
): Promise<
  | { ok: true; xpEarned: number; hearts: number }
  | { ok: false; reason: 'blocked' | 'error' }
> {
  try {
    return await db.transaction(async (tx) => {
      const gate = await tx
        .update(users)
        .set({ hearts: sql`GREATEST(${users.hearts} - 1, 0)` })
        .where(and(eq(users.id, userId), or(eq(users.isPremium, true), gt(users.hearts, 0))))
        .returning({ hearts: users.hearts })

      const row = gate[0]
      if (!row) {
        return { ok: false as const, reason: 'blocked' as const }
      }
      if (row.hearts === null) {
        return { ok: false as const, reason: 'error' as const }
      }

      const progress = await saveProgressWithin(tx, userId, questionId, false)
      return { ok: true as const, xpEarned: progress.xpEarned, hearts: row.hearts }
    })
  } catch (error) {
    console.error('Error recording wrong answer:', error)
    return { ok: false, reason: 'error' }
  }
}

/**
 * Applies the once-per-SAST-day rollover: advances the streak and
 * refills hearts to MAX_HEARTS. Idempotent within a day - once
 * lastActiveDate is today, a repeat call the same day is a no-op that
 * just reports the current values.
 *
 * Called from the TOP of recordAnswer(), BEFORE the hearts gate - this
 * is what the refill deadlock fix depends on: a student at 0 hearts
 * would otherwise never reach completeQuiz() (every recordAnswer call
 * is blocked by the hearts gate first), so the refill has to happen on
 * the very first interaction of the new day, not only at quiz
 * completion. completeQuiz() also calls this (it owns the "streak/day
 * rollover" bookkeeping); in the normal flow it will already be a
 * no-op there, since recordAnswer's call earlier in the same session
 * already rolled the day over - this is a harmless safety net, not a
 * second source of truth.
 *
 * Deliberately read-then-write, not a single atomic SQL statement:
 * incrementing vs. resetting the streak needs the previous
 * lastActiveDate, which a plain conditional UPDATE can express but a
 * RETURNING clause can't easily report back in one round trip. Two
 * simultaneous *first* interactions of the day (same user, two
 * devices) could theoretically under-count the streak by one - a
 * low-stakes cosmetic race, unlike XP or hearts (both land on the same
 * value, MAX_HEARTS, regardless of how many callers race here).
 */
export async function applyDayRollover(userId: string): Promise<{ newStreak: number; hearts: number } | null> {
  try {
    const userRows = await db
      .select()
      .from(users)
      .where(eq(users.id, userId))
      .limit(1)

    if (userRows.length === 0) {
      return null
    }

    const user = userRows[0]
    // SAST (Africa/Johannesburg), not the server's UTC day - a student
    // active at, say, 23:30 UTC is at 01:30 the next SAST day, and
    // should already be on a new day. lastActiveDate is stored as the
    // SAST 'YYYY-MM-DD' string this same helper produced, so a plain
    // string comparison is enough - no Date parsing needed.
    const today = todaySast()
    const yesterday = yesterdaySast()
    const lastActive = user.lastActiveDate

    if (lastActive === today) {
      // Already rolled over today - nothing to do.
      return { newStreak: user.streakCount || 0, hearts: user.hearts ?? MAX_HEARTS }
    }

    const newStreak = lastActive === yesterday ? (user.streakCount || 0) + 1 : 1

    await db
      .update(users)
      .set({ streakCount: newStreak, lastActiveDate: today, hearts: MAX_HEARTS })
      .where(eq(users.id, userId))

    return { newStreak, hearts: MAX_HEARTS }
  } catch (error) {
    console.error('Error applying day rollover:', error)
    return null
  }
}

export type HeartsGateResult =
  | { ok: true; hearts: number }
  | { ok: false; reason: 'blocked' | 'error' }

/**
 * Atomically gates AND decrements hearts for a wrong answer in one
 * statement: `WHERE id = $1 AND (is_premium OR hearts > 0)`. Zero rows
 * updated means the gate failed (blocked) - there is nothing left to
 * decrement, and nothing was written. GREATEST(...) floors at 0 for
 * the decrement itself; two concurrent wrong answers (e.g. two tabs)
 * can't both pass a separate read-then-decrement and drive hearts
 * negative or double-decrement past 0.
 *
 * Only for wrong answers - a correct answer never consumes a heart, so
 * recordAnswer() uses a plain read (getUserById) for that gate instead
 * of this one; there's no decrement to race against.
 */
export async function decrementHeartsIfAllowed(userId: string): Promise<HeartsGateResult> {
  try {
    const result = await db
      .update(users)
      .set({ hearts: sql`GREATEST(${users.hearts} - 1, 0)` })
      .where(and(eq(users.id, userId), or(eq(users.isPremium, true), gt(users.hearts, 0))))
      .returning({ hearts: users.hearts })

    const row = result[0]
    if (!row) {
      return { ok: false, reason: 'blocked' }
    }
    if (row.hearts === null) {
      return { ok: false, reason: 'error' }
    }

    return { ok: true, hearts: row.hearts }
  } catch (error) {
    console.error('Error decrementing hearts:', error)
    return { ok: false, reason: 'error' }
  }
}
