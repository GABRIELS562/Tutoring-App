import { db } from './index'
import { users, questions, topics, studentProgress } from './schema'
import { eq, and } from 'drizzle-orm'
import { MAX_HEARTS } from '@/lib/game-rules'

/**
 * Fixed-uuid dev fixtures - one student per grade, so grade-scoped
 * pages (dashboard, leaderboard, weakness detection) all have
 * something real to render without signing up. Never run in
 * production (guarded in main()) - these are test.-domain accounts
 * with predictable ids, not real users.
 */
const DEV_USERS = [
  {
    id: '11111111-1111-1111-1111-111111111111',
    email: 'dev-student-10@example.test',
    name: 'Thabo Nkosi',
    grade: 10,
    school: 'Dev Fixture High',
    xp: 120,
    streakCount: 2,
    hearts: MAX_HEARTS,
    isPremium: false,
  },
  {
    id: '22222222-2222-2222-2222-222222222222',
    email: 'dev-student-11@example.test',
    name: 'Lerato Dlamini',
    grade: 11,
    school: 'Dev Fixture High',
    xp: 480,
    streakCount: 9,
    hearts: MAX_HEARTS - 2, // has already used a couple of hearts, for a realistic fixture
    isPremium: true,
  },
  {
    id: '33333333-3333-3333-3333-333333333333',
    email: 'dev-student-12@example.test',
    name: 'Sipho Mokoena',
    grade: 12,
    school: 'Dev Fixture High',
    xp: 30,
    streakCount: 0,
    hearts: MAX_HEARTS,
    isPremium: false,
  },
] as const

async function upsertDevUser(user: (typeof DEV_USERS)[number]): Promise<void> {
  const existing = await db
    .select({ id: users.id })
    .from(users)
    .where(eq(users.id, user.id))
    .limit(1)

  if (existing.length > 0) {
    console.log(`Skipped (already exists): ${user.name} (${user.email})`)
    return
  }

  await db.insert(users).values({
    id: user.id,
    email: user.email,
    name: user.name,
    grade: user.grade,
    school: user.school,
    xp: user.xp,
    streakCount: user.streakCount,
    lastActiveDate: new Date().toISOString().split('T')[0],
    hearts: user.hearts,
    isPremium: user.isPremium,
  })
  console.log(`Created: ${user.name} (${user.email}), Grade ${user.grade}${user.isPremium ? ' [premium]' : ''}`)
}

/**
 * Attaches student_progress rows for one user against real, already
 * seeded questions for the given topic slug - skipping any
 * (user, question) pair that already has a row, so re-running is safe.
 * `outcomes` picks correct/incorrect per question in order, so callers
 * can shape a deliberately weak topic (accuracy < 60%) to exercise the
 * weakness detector, or a strong one.
 */
async function seedProgressForTopic(
  userId: string,
  topicSlug: string,
  outcomes: boolean[]
): Promise<void> {
  const topicQuestions = await db
    .select({ id: questions.id })
    .from(questions)
    .innerJoin(topics, eq(questions.topicId, topics.id))
    .where(and(eq(topics.slug, topicSlug), eq(questions.isApproved, true)))

  if (topicQuestions.length === 0) {
    console.log(`No approved questions found for topic "${topicSlug}" - skipping progress fixtures. Run "npm run db:seed-questions" first.`)
    return
  }

  let created = 0

  for (let i = 0; i < Math.min(outcomes.length, topicQuestions.length); i++) {
    const questionId = topicQuestions[i].id
    const correct = outcomes[i]

    const existing = await db
      .select({ id: studentProgress.id })
      .from(studentProgress)
      .where(
        and(
          eq(studentProgress.userId, userId),
          eq(studentProgress.questionId, questionId)
        )
      )
      .limit(1)

    if (existing.length > 0) {
      continue
    }

    await db.insert(studentProgress).values({
      userId,
      questionId,
      status: correct ? 'correct' : 'incorrect',
      attempts: 1,
      lastAttemptedAt: new Date(),
      xpEarned: correct ? 10 : 0,
    })
    created += 1
  }

  console.log(`Progress for topic "${topicSlug}": ${created} row(s) created (${topicQuestions.length} questions available).`)
}

async function main() {
  if (process.env.NODE_ENV === 'production') {
    console.error('Refusing to run db:seed-dev in production (NODE_ENV=production).')
    process.exit(1)
  }

  console.log('Seeding dev fixture users...')

  for (const user of DEV_USERS) {
    await upsertDevUser(user)
  }

  // Only trig-gr11 has real seeded questions today (db:seed-questions).
  // Deliberately more wrong than right so the weakness detector
  // (accuracy < 60% with >= 3 attempts) has something to surface for
  // the Grade 11 dev user.
  await seedProgressForTopic(
    '22222222-2222-2222-2222-222222222222',
    'trig-gr11',
    [false, false, true, false, true, false]
  )

  console.log('Dev fixture seed complete!')
  process.exit(0)
}

main().catch((err) => {
  console.error('Dev fixture seed error:', err)
  process.exit(1)
})
