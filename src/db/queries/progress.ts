import { db } from '@/db'
import { users, studentProgress, questions, topics } from '@/db/schema'
import { and, desc, eq, gte, inArray, sql } from 'drizzle-orm'

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
    /** So the feed can be labelled in the reader's language. */
    topicSlug: string
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
    // Seven independent reads, all keyed on nothing but userId, and they
    // used to run one after another - seven serial round trips to the
    // Supabase pooler before the dashboard could render. On SA mobile data
    // that is the difference between a page that appears and one that
    // hangs. Nothing here depends on anything else here, so they go
    // together and the cost becomes the slowest one, not the sum.
    const fourteenDaysAgo = new Date()
    fourteenDaysAgo.setDate(fourteenDaysAgo.getDate() - 14)

    const [
      userRows,
      totalResult,
      correctResult,
      distinctTopicsResult,
      recentRows,
      weeklyXPRows,
      topicsProgressRows,
    ] = await Promise.all([
      db.select().from(users).where(eq(users.id, userId)).limit(1),

      db
        .select({ count: sql<number>`count(*)` })
        .from(studentProgress)
        .where(eq(studentProgress.userId, userId)),

      db
        .select({ count: sql<number>`count(*)` })
        .from(studentProgress)
        .where(
          and(
            eq(studentProgress.userId, userId),
            eq(studentProgress.status, 'correct')
          )
        ),

      db
        .selectDistinct({ topicId: questions.topicId })
        .from(studentProgress)
        .innerJoin(questions, eq(studentProgress.questionId, questions.id))
        .where(eq(studentProgress.userId, userId)),

      db
        .select({
          id: studentProgress.id,
          topicName: topics.name,
          topicSlug: topics.slug,
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
        .limit(5),

      db
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
        .orderBy(sql`DATE(${studentProgress.lastAttemptedAt})`),

      db
        .select({
          topicId: topics.id,
          topicName: topics.name,
          topicSlug: topics.slug,
          correctCount: sql<number>`SUM(CASE WHEN ${studentProgress.status} = 'correct' THEN 1 ELSE 0 END)`,
          attemptCount: sql<number>`COUNT(${studentProgress.id})`,
          lastAttemptedAt: sql<string>`MAX(${studentProgress.lastAttemptedAt})`,
        })
        .from(studentProgress)
        .innerJoin(questions, eq(studentProgress.questionId, questions.id))
        .innerJoin(topics, eq(questions.topicId, topics.id))
        .where(eq(studentProgress.userId, userId))
        .groupBy(topics.id, topics.name, topics.slug)
        // LIMIT without ORDER BY left it to the planner which four topics
        // "Continue learning" showed. Most recently attempted is what the
        // section claims to be.
        .orderBy(desc(sql`MAX(${studentProgress.lastAttemptedAt})`))
        .limit(4),
    ])

    const user = userRows[0] || null
    const totalQuestionsAnswered = Number(totalResult[0]?.count || 0)
    const correctAnswers = Number(correctResult[0]?.count || 0)
    const topicsStarted = distinctTopicsResult.length

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

    // One grouped query, not one per topic. This was a four-round-trip
    // fan-out inside Promise.all - better than serial, but still four
    // extra trips to the pooler to count rows the database can count in
    // a single GROUP BY. The same N+1 was already fixed this way in
    // getQuestionsByTopic.
    const topicIds = topicsProgressRows.map((tp) => tp.topicId)
    const questionCounts = topicIds.length
      ? await db
          .select({
            topicId: questions.topicId,
            count: sql<number>`count(*)`,
          })
          .from(questions)
          .where(inArray(questions.topicId, topicIds))
          .groupBy(questions.topicId)
      : []

    const countByTopic = new Map(
      questionCounts.map((row) => [row.topicId, Number(row.count)])
    )

    const topicsWithProgress = topicsProgressRows.map((tp) => {
      // 1, not 0: this is the denominator of the progress percentage, and
      // a topic with no questions yet should read 0%, not divide by zero.
      const total = countByTopic.get(tp.topicId) || 1
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

    return {
      user,
      totalQuestionsAnswered,
      correctAnswers,
      topicsStarted,
      recentActivity: recentRows.map((r) => ({
        id: r.id,
        topicName: r.topicName,
        topicSlug: r.topicSlug,
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

    // Last 8 weeks for the activity calendar.
    const eightWeeksAgo = new Date()
    eightWeeksAgo.setDate(eightWeeksAgo.getDate() - 56)

    // Three independent reads for three independent charts. They ran one
    // after another, so the progress page waited for the sum of them.
    const weeklyXPPromise = db
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

    const topicAccuracyPromise = db
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

    const activityPromise = db
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

    const [weeklyXPRows, topicAccuracyRows, activityRows] = await Promise.all([
      weeklyXPPromise,
      topicAccuracyPromise,
      activityPromise,
    ])


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
