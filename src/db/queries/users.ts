import { db } from '..'
import { users, studentProgress, promptChallengeAttempts, aiCertificates } from '../schema'
import { eq, sql } from 'drizzle-orm'

/**
 * Get user by ID
 */
export async function getUserById(userId: string) {
  const result = await db
    .select()
    .from(users)
    .where(eq(users.id, userId))
    .limit(1)
  return result[0] || null
}

/**
 * Get user by email
 */
export async function getUserByEmail(email: string) {
  const result = await db
    .select()
    .from(users)
    .where(eq(users.email, email))
    .limit(1)
  return result[0] || null
}

/**
 * Create a new user
 */
export async function createUser(data: {
  email: string
  name: string
  grade?: number
  school?: string
}) {
  const result = await db
    .insert(users)
    .values({
      email: data.email,
      name: data.name,
      grade: data.grade,
      school: data.school,
    })
    .returning()
  return result[0]
}

/**
 * Update user profile
 */
export async function updateUserProfile(userId: string, data: {
  name?: string
  grade?: number
  school?: string
}) {
  const result = await db
    .update(users)
    .set(data)
    .where(eq(users.id, userId))
    .returning()
  return result[0]
}

/**
 * Mark AI module as completed
 */
export async function completeAIModule(userId: string, moduleId: string) {
  const user = await getUserById(userId)
  if (!user) return null

  const completed = user.aiModulesCompleted || []
  if (completed.includes(moduleId)) {
    return user // Already completed
  }

  const result = await db
    .update(users)
    .set({
      aiModulesCompleted: [...completed, moduleId],
    })
    .where(eq(users.id, userId))
    .returning()

  return result[0]
}

/**
 * Add badge to user
 */
export async function addBadge(userId: string, badgeId: string) {
  const user = await getUserById(userId)
  if (!user) return null

  const badges = user.badges || []
  if (badges.includes(badgeId)) {
    return user // Already has badge
  }

  const result = await db
    .update(users)
    .set({
      badges: [...badges, badgeId],
    })
    .where(eq(users.id, userId))
    .returning()

  return result[0]
}

/**
 * Save CV statement
 */
export async function saveCVStatement(userId: string, cvStatement: string) {
  const result = await db
    .update(users)
    .set({ cvStatement })
    .where(eq(users.id, userId))
    .returning()
  return result[0]
}

/**
 * Increment prompt challenges completed
 */
export async function incrementPromptChallenges(userId: string) {
  const result = await db
    .update(users)
    .set({
      promptChallengesCompleted: sql`${users.promptChallengesCompleted} + 1`,
    })
    .where(eq(users.id, userId))
    .returning()
  return result[0]
}

/**
 * Get user's AI progress summary
 */
export async function getUserAIProgress(userId: string) {
  const user = await getUserById(userId)
  if (!user) return null

  // Get prompt challenge stats
  const challengeStats = await db
    .select({
      totalAttempts: sql<number>`count(*)`,
      avgScore: sql<number>`avg(${promptChallengeAttempts.aiScore})`,
      totalXP: sql<number>`sum(${promptChallengeAttempts.xpEarned})`,
    })
    .from(promptChallengeAttempts)
    .where(eq(promptChallengeAttempts.userId, userId))

  // Get certificate if exists
  const certificate = await db
    .select()
    .from(aiCertificates)
    .where(eq(aiCertificates.userId, userId))
    .limit(1)

  return {
    user: {
      id: user.id,
      name: user.name,
      xp: user.xp,
      badges: user.badges,
      cvStatement: user.cvStatement,
    },
    aiModules: {
      completed: user.aiModulesCompleted || [],
      totalCount: 5,
    },
    promptChallenges: {
      completed: user.promptChallengesCompleted || 0,
      totalAttempts: challengeStats[0]?.totalAttempts || 0,
      avgScore: challengeStats[0]?.avgScore || 0,
      totalXP: challengeStats[0]?.totalXP || 0,
    },
    certificate: certificate[0] || null,
  }
}

/**
 * Get user's study statistics
 */
export async function getUserStudyStats(userId: string) {
  // Questions answered stats
  const questionStats = await db
    .select({
      total: sql<number>`count(*)`,
      correct: sql<number>`count(*) filter (where ${studentProgress.status} = 'correct')`,
      totalXP: sql<number>`sum(${studentProgress.xpEarned})`,
    })
    .from(studentProgress)
    .where(eq(studentProgress.userId, userId))

  return {
    questionsAnswered: questionStats[0]?.total || 0,
    correctAnswers: questionStats[0]?.correct || 0,
    accuracy: questionStats[0]?.total
      ? Math.round((questionStats[0].correct / questionStats[0].total) * 100)
      : 0,
    xpFromQuestions: questionStats[0]?.totalXP || 0,
  }
}

/**
 * Check if user has premium status
 */
export async function checkPremiumStatus(userId: string): Promise<boolean> {
  const user = await getUserById(userId)
  return user?.isPremium ?? false
}

/**
 * Check if user is admin
 */
export async function checkAdminStatus(userId: string): Promise<boolean> {
  const user = await getUserById(userId)
  return user?.isAdmin ?? false
}
