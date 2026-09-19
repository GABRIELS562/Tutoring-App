import { db } from '@/db'
import { questions, questionOptions, steps, topics, studentProgress, users } from '@/db/schema'
import { eq, and, sql } from 'drizzle-orm'
import { todaySast, yesterdaySast } from '@/lib/dates'

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
    const questionsWithDetails: QuestionWithDetails[] = await Promise.all(
      questionRows.map(async (q) => {
        const [optionRows, stepRows] = await Promise.all([
          db
            .select()
            .from(questionOptions)
            .where(eq(questionOptions.questionId, q.id))
            .orderBy(questionOptions.optionLetter),
          db
            .select()
            .from(steps)
            .where(eq(steps.questionId, q.id))
            .orderBy(steps.stepNumber),
        ])

        return {
          ...q,
          options: optionRows.map((o) => ({
            id: o.id,
            optionLetter: o.optionLetter,
            optionText: o.optionText,
            isCorrect: o.isCorrect,
          })),
          steps: stepRows.map((s) => ({
            id: s.id,
            stepNumber: s.stepNumber,
            instruction: s.instruction,
            hint: s.hint,
            correctAnswer: s.correctAnswer,
            explanation: s.explanation,
          })),
        }
      })
    )

    return questionsWithDetails
  } catch (error) {
    console.error('Error fetching questions:', error)
    return []
  }
}

export async function saveProgress(
  userId: string,
  questionId: string,
  correct: boolean
): Promise<{ xpEarned: number } | null> {
  try {
    const xpToAward = correct ? 10 : 0
    const status = correct ? 'correct' : 'incorrect'

    // Check if progress record exists
    const existing = await db
      .select()
      .from(studentProgress)
      .where(
        and(
          eq(studentProgress.userId, userId),
          eq(studentProgress.questionId, questionId)
        )
      )
      .limit(1)

    if (existing.length > 0) {
      // Update existing record
      await db
        .update(studentProgress)
        .set({
          status,
          attempts: sql`${studentProgress.attempts} + 1`,
          lastAttemptedAt: new Date(),
          xpEarned: correct ? sql`${studentProgress.xpEarned} + ${xpToAward}` : studentProgress.xpEarned,
        })
        .where(eq(studentProgress.id, existing[0].id))
    } else {
      // Insert new record
      await db.insert(studentProgress).values({
        userId,
        questionId,
        status,
        attempts: 1,
        lastAttemptedAt: new Date(),
        xpEarned: xpToAward,
      })
    }

    return { xpEarned: xpToAward }
  } catch (error) {
    console.error('Error saving progress:', error)
    return null
  }
}

const MAX_HEARTS = 5

/**
 * Pure decision of whether a day rollover should refill hearts, kept
 * separate from the DB call so it's trivially unit-testable. Returns
 * the hearts value to set, or undefined when no refill is due.
 */
export function refillHeartsIfNewDay(isNewDay: boolean, maxHearts: number = MAX_HEARTS): number | undefined {
  return isNewDay ? maxHearts : undefined
}

export async function updateUserXP(
  userId: string,
  xpToAdd: number
): Promise<{ newXp: number; newStreak: number } | null> {
  try {
    // Get current user data
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
    // should already be on a new streak day. lastActiveDate is stored
    // as the SAST 'YYYY-MM-DD' string this same helper produced, so a
    // plain string comparison is enough - no Date parsing needed.
    const today = todaySast()
    const yesterday = yesterdaySast()
    const lastActive = user.lastActiveDate

    let newStreak = user.streakCount || 0
    let isNewDay = false

    if (lastActive === today) {
      // Already active today, keep streak
    } else if (lastActive === yesterday) {
      // Was active yesterday, increment streak
      newStreak += 1
      isNewDay = true
    } else {
      // First activity ever, or missed a day - (re)start streak at 1
      newStreak = 1
      isNewDay = true
    }

    const newXp = (user.xp || 0) + xpToAdd
    const refilledHearts = refillHeartsIfNewDay(isNewDay)

    // Update user
    await db
      .update(users)
      .set({
        xp: newXp,
        streakCount: newStreak,
        lastActiveDate: today,
        ...(refilledHearts !== undefined ? { hearts: refilledHearts } : {}),
      })
      .where(eq(users.id, userId))

    return { newXp, newStreak }
  } catch (error) {
    console.error('Error updating user XP:', error)
    return null
  }
}

/**
 * Decrements a user's hearts by 1, floored at 0. Called from
 * recordAnswer() when the student answers incorrectly.
 */
export async function decrementHearts(userId: string): Promise<{ hearts: number } | null> {
  try {
    // A single atomic UPDATE ... RETURNING instead of read-then-write:
    // two concurrent wrong answers (e.g. two tabs) can't both read the
    // same starting value and each write hearts - 1, losing a
    // decrement. GREATEST(...) does the floor-at-0 in SQL; COALESCE
    // guards the (should-never-happen, since the column defaults to
    // MAX_HEARTS) case of a null hearts value.
    const result = await db
      .update(users)
      .set({ hearts: sql`GREATEST(COALESCE(${users.hearts}, ${MAX_HEARTS}) - 1, 0)` })
      .where(eq(users.id, userId))
      .returning({ hearts: users.hearts })

    const row = result[0]
    if (!row || row.hearts === null) {
      return null
    }

    return { hearts: row.hearts }
  } catch (error) {
    console.error('Error decrementing hearts:', error)
    return null
  }
}
