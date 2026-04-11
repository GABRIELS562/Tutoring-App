import { db } from '@/db'
import { questions, questionOptions, steps, topics, studentProgress, users } from '@/db/schema'
import { eq, and, sql } from 'drizzle-orm'

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
    const today = new Date().toISOString().split('T')[0]
    const lastActive = user.lastActiveDate

    let newStreak = user.streakCount || 0

    if (lastActive) {
      const lastActiveDate = new Date(lastActive)
      const yesterday = new Date()
      yesterday.setDate(yesterday.getDate() - 1)
      const yesterdayStr = yesterday.toISOString().split('T')[0]
      const lastActiveStr = lastActiveDate.toISOString().split('T')[0]

      if (lastActiveStr === today) {
        // Already active today, keep streak
      } else if (lastActiveStr === yesterdayStr) {
        // Was active yesterday, increment streak
        newStreak += 1
      } else {
        // Missed a day, reset streak to 1
        newStreak = 1
      }
    } else {
      // First activity, start streak at 1
      newStreak = 1
    }

    const newXp = (user.xp || 0) + xpToAdd

    // Update user
    await db
      .update(users)
      .set({
        xp: newXp,
        streakCount: newStreak,
        lastActiveDate: today,
      })
      .where(eq(users.id, userId))

    return { newXp, newStreak }
  } catch (error) {
    console.error('Error updating user XP:', error)
    return null
  }
}
