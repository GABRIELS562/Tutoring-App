import { db } from '@/db'
import { users, studentProgress, questions, topics } from '@/db/schema'
import { eq, and, sql, desc, gte } from 'drizzle-orm'

export type DashboardData = {
  user: {
    id: string
    name: string | null
    email: string
    grade: number | null
    xp: number | null
    streakCount: number | null
    hearts: number | null
    isPremium: boolean | null
  } | null
  totalQuestionsAnswered: number
  correctAnswers: number
  topicsStarted: number
  recentActivity: {
    id: string
    topicName: string
    questionText: string
    status: string | null
    xpEarned: number | null
    lastAttemptedAt: Date | null
  }[]
  weeklyXP: {
    date: string
    xp: number
  }[]
  topicsWithProgress: {
    topicId: string
    topicName: string
    topicSlug: string
    correctCount: number
    totalQuestions: number
    progressPercent: number
  }[]
}

export type LeaderboardEntry = {
  id: string
  name: string
  school: string | null
  xp: number
}

export async function getDashboardData(userId: string): Promise<DashboardData> {
  try {
    // Get user data
    const userRows = await db
      .select()
      .from(users)
      .where(eq(users.id, userId))
      .limit(1)

    const user = userRows[0] || null

    // Get total questions answered
    const totalResult = await db
      .select({ count: sql<number>`count(*)` })
      .from(studentProgress)
      .where(eq(studentProgress.userId, userId))

    const totalQuestionsAnswered = Number(totalResult[0]?.count || 0)

    // Get correct answers count
    const correctResult = await db
      .select({ count: sql<number>`count(*)` })
      .from(studentProgress)
      .where(
        and(
          eq(studentProgress.userId, userId),
          eq(studentProgress.status, 'correct')
        )
      )

    const correctAnswers = Number(correctResult[0]?.count || 0)

    // Get distinct topic count
    const distinctTopicsResult = await db
      .selectDistinct({ topicId: questions.topicId })
      .from(studentProgress)
      .innerJoin(questions, eq(studentProgress.questionId, questions.id))
      .where(eq(studentProgress.userId, userId))

    const topicsStarted = distinctTopicsResult.length

    // Get recent activity (last 5)
    const recentRows = await db
      .select({
        id: studentProgress.id,
        topicName: topics.name,
        questionText: questions.questionText,
        status: studentProgress.status,
        xpEarned: studentProgress.xpEarned,
        lastAttemptedAt: studentProgress.lastAttemptedAt,
      })
      .from(studentProgress)
      .innerJoin(questions, eq(studentProgress.questionId, questions.id))
      .innerJoin(topics, eq(questions.topicId, topics.id))
      .where(eq(studentProgress.userId, userId))
      .orderBy(desc(studentProgress.lastAttemptedAt))
      .limit(5)

    // Get weekly XP (last 14 days)
    const fourteenDaysAgo = new Date()
    fourteenDaysAgo.setDate(fourteenDaysAgo.getDate() - 14)

    const weeklyXPRows = await db
      .select({
        date: sql<string>`DATE(${studentProgress.lastAttemptedAt})`,
        xp: sql<number>`SUM(${studentProgress.xpEarned})`,
      })
      .from(studentProgress)
      .where(
        and(
          eq(studentProgress.userId, userId),
          gte(studentProgress.lastAttemptedAt, fourteenDaysAgo)
        )
      )
      .groupBy(sql`DATE(${studentProgress.lastAttemptedAt})`)
      .orderBy(sql`DATE(${studentProgress.lastAttemptedAt})`)

    // Fill in missing days with 0 XP
    const weeklyXP: { date: string; xp: number }[] = []
    for (let i = 13; i >= 0; i--) {
      const date = new Date()
      date.setDate(date.getDate() - i)
      const dateStr = date.toISOString().split('T')[0]
      const existingRow = weeklyXPRows.find((r) => r.date === dateStr)
      weeklyXP.push({
        date: dateStr,
        xp: Number(existingRow?.xp || 0),
      })
    }

    // Get topics with progress for "Continue learning"
    const topicsProgressRows = await db
      .select({
        topicId: topics.id,
        topicName: topics.name,
        topicSlug: topics.slug,
        correctCount: sql<number>`SUM(CASE WHEN ${studentProgress.status} = 'correct' THEN 1 ELSE 0 END)`,
        attemptCount: sql<number>`COUNT(${studentProgress.id})`,
      })
      .from(studentProgress)
      .innerJoin(questions, eq(studentProgress.questionId, questions.id))
      .innerJoin(topics, eq(questions.topicId, topics.id))
      .where(eq(studentProgress.userId, userId))
      .groupBy(topics.id, topics.name, topics.slug)
      .limit(4)

    // Get total questions per topic for progress calculation
    const topicsWithProgress = await Promise.all(
      topicsProgressRows.map(async (tp) => {
        const totalQuestionsForTopic = await db
          .select({ count: sql<number>`count(*)` })
          .from(questions)
          .where(eq(questions.topicId, tp.topicId))

        const total = Number(totalQuestionsForTopic[0]?.count || 1)
        const correct = Number(tp.correctCount || 0)

        return {
          topicId: tp.topicId,
          topicName: tp.topicName,
          topicSlug: tp.topicSlug,
          correctCount: correct,
          totalQuestions: total,
          progressPercent: Math.round((correct / total) * 100),
        }
      })
    )

    return {
      user,
      totalQuestionsAnswered,
      correctAnswers,
      topicsStarted,
      recentActivity: recentRows.map((r) => ({
        id: r.id,
        topicName: r.topicName,
        questionText: r.questionText,
        status: r.status,
        xpEarned: r.xpEarned,
        lastAttemptedAt: r.lastAttemptedAt,
      })),
      weeklyXP,
      topicsWithProgress,
    }
  } catch (error) {
    console.error('Error fetching dashboard data:', error)
    return {
      user: null,
      totalQuestionsAnswered: 0,
      correctAnswers: 0,
      topicsStarted: 0,
      recentActivity: [],
      weeklyXP: [],
      topicsWithProgress: [],
    }
  }
}

export async function getLeaderboard(grade: number): Promise<LeaderboardEntry[]> {
  try {
    const rows = await db
      .select({
        id: users.id,
        name: users.name,
        school: users.school,
        xp: users.xp,
      })
      .from(users)
      .where(eq(users.grade, grade))
      .orderBy(desc(users.xp))
      .limit(10)

    // Anonymise names to "FirstName L." format
    return rows.map((row) => {
      let anonymisedName = 'Anonymous'
      if (row.name) {
        const parts = row.name.trim().split(' ')
        if (parts.length >= 2) {
          anonymisedName = `${parts[0]} ${parts[parts.length - 1][0]}.`
        } else {
          anonymisedName = parts[0]
        }
      }

      return {
        id: row.id,
        name: anonymisedName,
        school: row.school,
        xp: row.xp || 0,
      }
    })
  } catch (error) {
    console.error('Error fetching leaderboard:', error)
    return []
  }
}

export async function getProgressData(userId: string) {
  try {
    // Get weekly XP for chart (last 14 days)
    const fourteenDaysAgo = new Date()
    fourteenDaysAgo.setDate(fourteenDaysAgo.getDate() - 14)

    const weeklyXPRows = await db
      .select({
        date: sql<string>`DATE(${studentProgress.lastAttemptedAt})`,
        xp: sql<number>`SUM(${studentProgress.xpEarned})`,
      })
      .from(studentProgress)
      .where(
        and(
          eq(studentProgress.userId, userId),
          gte(studentProgress.lastAttemptedAt, fourteenDaysAgo)
        )
      )
      .groupBy(sql`DATE(${studentProgress.lastAttemptedAt})`)
      .orderBy(sql`DATE(${studentProgress.lastAttemptedAt})`)

    // Fill in missing days
    const weeklyXP: { date: string; xp: number }[] = []
    for (let i = 13; i >= 0; i--) {
      const date = new Date()
      date.setDate(date.getDate() - i)
      const dateStr = date.toISOString().split('T')[0]
      const existingRow = weeklyXPRows.find((r) => r.date === dateStr)
      weeklyXP.push({
        date: dateStr,
        xp: Number(existingRow?.xp || 0),
      })
    }

    // Get accuracy by topic
    const topicAccuracyRows = await db
      .select({
        topicId: topics.id,
        topicName: topics.name,
        // The slug is what the Afrikaans title maps are keyed on; without it
        // the chart could only label bars in English.
        topicSlug: topics.slug,
        correctCount: sql<number>`SUM(CASE WHEN ${studentProgress.status} = 'correct' THEN 1 ELSE 0 END)`,
        totalCount: sql<number>`COUNT(${studentProgress.id})`,
      })
      .from(studentProgress)
      .innerJoin(questions, eq(studentProgress.questionId, questions.id))
      .innerJoin(topics, eq(questions.topicId, topics.id))
      .where(eq(studentProgress.userId, userId))
      .groupBy(topics.id, topics.name, topics.slug)

    const topicAccuracy = topicAccuracyRows.map((row) => {
      const accuracy = Math.round(
        (Number(row.correctCount) / Number(row.totalCount || 1)) * 100
      )
      return {
        topicId: row.topicId,
        topicName: row.topicName,
        topicSlug: row.topicSlug,
        accuracy,
        correctCount: Number(row.correctCount),
        totalCount: Number(row.totalCount),
      }
    })

    // Get activity calendar data (last 8 weeks = 56 days)
    const eightWeeksAgo = new Date()
    eightWeeksAgo.setDate(eightWeeksAgo.getDate() - 56)

    const activityRows = await db
      .select({
        date: sql<string>`DATE(${studentProgress.lastAttemptedAt})`,
        count: sql<number>`COUNT(*)`,
      })
      .from(studentProgress)
      .where(
        and(
          eq(studentProgress.userId, userId),
          gte(studentProgress.lastAttemptedAt, eightWeeksAgo)
        )
      )
      .groupBy(sql`DATE(${studentProgress.lastAttemptedAt})`)

    // Build activity map
    const activityMap = new Map<string, number>()
    activityRows.forEach((row) => {
      activityMap.set(row.date, Number(row.count))
    })

    // Generate 56 days of activity data
    const activityCalendar: { date: string; count: number }[] = []
    for (let i = 55; i >= 0; i--) {
      const date = new Date()
      date.setDate(date.getDate() - i)
      const dateStr = date.toISOString().split('T')[0]
      activityCalendar.push({
        date: dateStr,
        count: activityMap.get(dateStr) || 0,
      })
    }

    return {
      weeklyXP,
      topicAccuracy,
      activityCalendar,
    }
  } catch (error) {
    console.error('Error fetching progress data:', error)
    return {
      weeklyXP: [],
      topicAccuracy: [],
      activityCalendar: [],
    }
  }
}

export async function updateUserGrade(userId: string, grade: number): Promise<boolean> {
  try {
    await db
      .update(users)
      .set({ grade })
      .where(eq(users.id, userId))
    return true
  } catch (error) {
    console.error('Error updating user grade:', error)
    return false
  }
}
