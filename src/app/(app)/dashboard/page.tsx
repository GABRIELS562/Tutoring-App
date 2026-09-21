import { cookies } from 'next/headers'
import { createServerClient } from '@supabase/ssr'
import Link from 'next/link'
import { getTranslations, getLocale } from 'next-intl/server'
import {
  BookOpen,
  Target,
  CheckCircle2,
  Flame,
  ArrowRight,
  FileText,
  TrendingUp,
  Clock,
  Brain,
  Swords,
} from 'lucide-react'
import Topbar from '@/components/layout/Topbar'
import { getDashboardData, type DashboardData } from '@/db/queries/progress'
import GradeSelector from './GradeSelector'
import ExamCountdown from '@/components/dashboard/ExamCountdown'
import StudyPlanBanner from '@/components/dashboard/StudyPlanBanner'
import WeaknessCard from '@/components/dashboard/WeaknessCard'
import { analyzeWeaknesses, getMockWeaknesses, type Weakness } from '@/lib/weaknessDetector'
import { getTopicsForSubjectGrade } from '@/content/registry'
import { getBossForTopic } from '@/content/bosses'
import { ACCENT_TEXT_LIGHT, ACCENT_TEXT_DARK } from '@/lib/color/contrast'
import type { Grade } from '@/types'

export const dynamic = 'force-dynamic'

type HomeTranslator = Awaited<ReturnType<typeof getTranslations<'home'>>>

const VALID_GRADES: readonly Grade[] = [10, 11, 12]

/** Narrows a student's stored grade (arbitrary `number | null` in the DB)
 * down to the Grade union the content registry indexes by, defaulting to
 * 11 the same way the rest of the dashboard already does. */
function toGrade(grade: number | null | undefined): Grade {
  return (VALID_GRADES as readonly number[]).includes(grade ?? NaN) ? (grade as Grade) : 11
}

function getGreeting(t: HomeTranslator): string {
  const hour = new Date().getHours()
  if (hour < 12) return t('goodMorning')
  if (hour < 17) return t('goodAfternoon')
  return t('goodEvening')
}

// Plain helper (not a component/hook) so the impure Date.now() read doesn't
// trip the react-hooks/purity rule, which forbids calling it directly inside
// a component's render body.
function getDaysUntilExam(examDateIso: string): number {
  return Math.ceil((new Date(examDateIso).getTime() - Date.now()) / (1000 * 60 * 60 * 24))
}

function formatTimeAgo(date: Date | null, t: HomeTranslator): string {
  if (!date) return t('recently')
  const now = new Date()
  const diffMs = now.getTime() - new Date(date).getTime()
  const diffMins = Math.floor(diffMs / 60000)
  const diffHours = Math.floor(diffMins / 60)
  const diffDays = Math.floor(diffHours / 24)

  if (diffMins < 1) return t('timeAgoJustNow')
  if (diffMins < 60) return t('timeAgoMinutes', { minutes: diffMins })
  if (diffHours < 24) return t('timeAgoHours', { hours: diffHours })
  if (diffDays === 1) return t('timeAgoYesterday')
  return t('timeAgoDays', { days: diffDays })
}

// Mock data for demo mode
const mockDashboardData: DashboardData = {
  user: {
    id: 'demo-user',
    name: 'Demo Student',
    email: 'demo@example.com',
    grade: 11,
    xp: 1250,
    streakCount: 7,
    hearts: 5,
    isPremium: false,
  },
  totalQuestionsAnswered: 47,
  correctAnswers: 38,
  topicsStarted: 4,
  recentActivity: [
    { id: '1', topicName: 'Trigonometry', questionText: 'Calculate sin 30°', status: 'correct', xpEarned: 10, lastAttemptedAt: new Date(Date.now() - 1000 * 60 * 30) },
    { id: '2', topicName: 'Trigonometry', questionText: 'Find cos 45°', status: 'correct', xpEarned: 10, lastAttemptedAt: new Date(Date.now() - 1000 * 60 * 60) },
    { id: '3', topicName: 'Algebra', questionText: 'Solve for x: 2x + 5 = 15', status: 'incorrect', xpEarned: 0, lastAttemptedAt: new Date(Date.now() - 1000 * 60 * 60 * 2) },
    { id: '4', topicName: 'Functions', questionText: 'Find the domain of f(x)', status: 'correct', xpEarned: 10, lastAttemptedAt: new Date(Date.now() - 1000 * 60 * 60 * 5) },
    { id: '5', topicName: 'Geometry', questionText: 'Calculate the area', status: 'correct', xpEarned: 10, lastAttemptedAt: new Date(Date.now() - 1000 * 60 * 60 * 24) },
  ],
  weeklyXP: [],
  topicsWithProgress: [
    { topicId: '1', topicName: 'Trigonometry', topicSlug: 'trigonometry', correctCount: 15, totalQuestions: 25, progressPercent: 60 },
    { topicId: '2', topicName: 'Algebra', topicSlug: 'algebra', correctCount: 8, totalQuestions: 20, progressPercent: 40 },
    { topicId: '3', topicName: 'Functions', topicSlug: 'functions', correctCount: 10, totalQuestions: 15, progressPercent: 67 },
    { topicId: '4', topicName: 'Geometry', topicSlug: 'geometry', correctCount: 5, totalQuestions: 18, progressPercent: 28 },
  ],
}

export default async function DashboardPage() {
  const t = await getTranslations('home')
  const tNav = await getTranslations('nav')
  const tBoss = await getTranslations('boss')
  const locale = await getLocale()
  let userId = 'demo-user'
  let data = mockDashboardData
  let isRealUser = false

  // Try to get authenticated user
  try {
    const cookieStore = await cookies()
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

    if (supabaseUrl && supabaseKey) {
      const supabase = createServerClient(supabaseUrl, supabaseKey, {
        cookies: {
          getAll() {
            return cookieStore.getAll()
          },
          setAll() {},
        },
      })

      const { data: { user: authUser } } = await supabase.auth.getUser()
      if (authUser) {
        userId = authUser.id
        const fetchedData = await getDashboardData(userId)
        if (fetchedData.user) {
          data = fetchedData
          isRealUser = true
        }
      }
    }
  } catch (error) {
    console.error('Dashboard auth error:', error)
  }

  const { user, totalQuestionsAnswered, correctAnswers, topicsStarted, recentActivity, topicsWithProgress } = data

  // Analyze weaknesses - use real data for authenticated users, mock
  // only for demo mode. A real user whose analysis comes back empty
  // (no topic with >= 3 attempts and < 60% accuracy) never falls back
  // to the mock weaknesses - that would show them someone else's
  // fabricated struggle. They get a plain "not enough signal yet" nudge
  // instead.
  let weaknesses: Weakness[] = []
  let showWeaknessPrompt = false
  if (totalQuestionsAnswered >= 10) {
    if (isRealUser && user?.grade) {
      weaknesses = await analyzeWeaknesses(userId, user.grade)
      showWeaknessPrompt = weaknesses.length === 0
    } else {
      weaknesses = getMockWeaknesses()
    }
  }

  const accuracy = totalQuestionsAnswered > 0
    ? Math.round((correctAnswers / totalQuestionsAnswered) * 100)
    : 0

  const totalTopicsForGrade = 12 // Approximate total topics per grade

  const daysRemaining = getDaysUntilExam('2026-10-30')

  // Boss Battle entry points: 3 maths topics for the student's grade,
  // each paired with its boss (getBossForTopic always returns one - a
  // generic fallback for any topic without a named boss yet, see
  // src/content/bosses.ts).
  const bossTopics = getTopicsForSubjectGrade('maths', toGrade(user?.grade)).slice(0, 3)

  return (
    <div className="min-h-screen" style={{ background: 'var(--bg)' }}>
      <Topbar
        title={t('dashboardTitle')}
        subtitle={user?.grade ? t('gradeCurriculum', { grade: user.grade }) : t('capsCurriculum')}
      />

      <div className="p-4 md:p-6 max-w-6xl mx-auto space-y-6">
        {/* Section 1: Welcome Banner */}
        <div
          className="rounded-xl p-6"
          style={{
            background: 'linear-gradient(135deg, var(--accent-red) 0%, #c1121f 100%)',
          }}
        >
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h2 className="text-2xl md:text-3xl font-bold text-white mb-2">
                {getGreeting(t)}, {user?.name?.split(' ')[0] || t('studentFallback')}!
              </h2>
              <p className="text-white/80">
                {user?.streakCount && user.streakCount > 0
                  ? t('streakActive', { days: user.streakCount })
                  : t('streakStart')}
              </p>
            </div>
            <GradeSelector currentGrade={user?.grade || 11} />
          </div>
        </div>

        {/* Exam Countdown & Study Plan Row */}
        <div className="grid md:grid-cols-2 gap-6">
          <ExamCountdown />
          <StudyPlanBanner
            daysRemaining={daysRemaining}
            topics={topicsWithProgress.map(t => ({
              topicSlug: t.topicSlug,
              topicName: t.topicName,
              completed: t.progressPercent >= 80,
            }))}
          />
        </div>

        {/* Weakness Detection (show after 10+ questions) */}
        {totalQuestionsAnswered >= 10 && weaknesses.length > 0 && (
          <WeaknessCard weakness={weaknesses[0]} />
        )}
        {showWeaknessPrompt && (
          <div
            className="rounded-xl p-4 text-center"
            style={{ background: 'var(--surface)', border: '1px solid var(--border-custom)' }}
          >
            <p className="text-sm" style={{ color: 'var(--muted-custom)' }}>
              {t('answerToSeeWeakSpots')}
            </p>
          </div>
        )}

        {/* Section 2: Stats Row */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {/* Topics Done */}
          <div
            className="rounded-xl p-4"
            style={{ background: 'var(--surface)', border: '1px solid var(--border-custom)' }}
          >
            <div className="flex items-center gap-3 mb-2">
              <div
                className="p-2 rounded-lg"
                style={{ background: 'rgba(42, 157, 143, 0.15)' }}
              >
                <BookOpen className="w-5 h-5" style={{ color: 'var(--teal)' }} />
              </div>
            </div>
            <p className="text-2xl font-bold" style={{ color: 'var(--text)' }}>
              {topicsStarted}/{totalTopicsForGrade}
            </p>
            <p className="text-sm" style={{ color: 'var(--muted-custom)' }}>
              {t('topicsStarted')}
            </p>
          </div>

          {/* Questions Answered */}
          <div
            className="rounded-xl p-4"
            style={{ background: 'var(--surface)', border: '1px solid var(--border-custom)' }}
          >
            <div className="flex items-center gap-3 mb-2">
              <div
                className="p-2 rounded-lg"
                style={{ background: 'rgba(244, 162, 97, 0.15)' }}
              >
                <Target className="w-5 h-5" style={{ color: 'var(--gold)' }} />
              </div>
            </div>
            <p className="text-2xl font-bold" style={{ color: 'var(--text)' }}>
              {totalQuestionsAnswered}
            </p>
            <p className="text-sm" style={{ color: 'var(--muted-custom)' }}>
              {t('questionsAnswered')}
            </p>
          </div>

          {/* Accuracy */}
          <div
            className="rounded-xl p-4"
            style={{ background: 'var(--surface)', border: '1px solid var(--border-custom)' }}
          >
            <div className="flex items-center gap-3 mb-2">
              <div
                className="p-2 rounded-lg"
                style={{
                  background: accuracy >= 70
                    ? 'rgba(42, 157, 143, 0.15)'
                    : accuracy < 50
                    ? 'rgba(230, 57, 70, 0.15)'
                    : 'rgba(244, 162, 97, 0.15)',
                }}
              >
                <CheckCircle2
                  className="w-5 h-5"
                  style={{
                    color: accuracy >= 70
                      ? 'var(--teal)'
                      : accuracy < 50
                      ? 'var(--accent-red)'
                      : 'var(--gold)',
                  }}
                />
              </div>
            </div>
            <p
              className="text-2xl font-bold"
              style={{
                color: accuracy >= 70
                  ? 'var(--teal)'
                  : accuracy < 50
                  ? 'var(--accent-red)'
                  : 'var(--text)',
              }}
            >
              {accuracy}%
            </p>
            <p className="text-sm" style={{ color: 'var(--muted-custom)' }}>
              {t('accuracy')}
            </p>
          </div>

          {/* Day Streak */}
          <div
            className="rounded-xl p-4"
            style={{ background: 'var(--surface)', border: '1px solid var(--border-custom)' }}
          >
            <div className="flex items-center gap-3 mb-2">
              <div
                className="p-2 rounded-lg"
                style={{ background: 'rgba(230, 57, 70, 0.15)' }}
              >
                <Flame className="w-5 h-5" style={{ color: 'var(--accent-red)' }} />
              </div>
            </div>
            <p className="text-2xl font-bold" style={{ color: 'var(--text)' }}>
              {user?.streakCount || 0}
            </p>
            <p className="text-sm" style={{ color: 'var(--muted-custom)' }}>
              {t('dayStreak')}
            </p>
          </div>
        </div>

        {/* Section 3: Two Columns */}
        <div className="grid md:grid-cols-2 gap-6">
          {/* Continue Learning */}
          <div
            className="rounded-xl p-5"
            style={{ background: 'var(--surface)', border: '1px solid var(--border-custom)' }}
          >
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-semibold" style={{ color: 'var(--text)' }}>
                {t('continueLearning')}
              </h2>
              <TrendingUp className="w-5 h-5" style={{ color: 'var(--muted-custom)' }} />
            </div>

            {topicsWithProgress.length > 0 ? (
              <div className="space-y-4">
                {topicsWithProgress.map((topic) => (
                  <Link
                    key={topic.topicId}
                    href={`/topics/${topic.topicSlug}/practice`}
                    className="block group"
                  >
                    <div className="flex items-center justify-between mb-1.5">
                      <span
                        className="text-sm font-medium group-hover:text-[var(--accent-red)] transition-colors"
                        style={{ color: 'var(--text)' }}
                      >
                        {topic.topicName}
                      </span>
                      <span className="text-xs" style={{ color: 'var(--muted-custom)' }}>
                        {topic.progressPercent}%
                      </span>
                    </div>
                    <div
                      className="h-2 rounded-full overflow-hidden"
                      style={{ background: 'var(--surface2)' }}
                    >
                      <div
                        className="h-full rounded-full transition-all"
                        style={{
                          width: `${topic.progressPercent}%`,
                          background: topic.progressPercent >= 70
                            ? 'var(--teal)'
                            : topic.progressPercent >= 40
                            ? 'var(--gold)'
                            : 'var(--accent-red)',
                        }}
                      />
                    </div>
                  </Link>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <BookOpen
                  className="w-10 h-10 mx-auto mb-2 opacity-50"
                  style={{ color: 'var(--muted-custom)' }}
                />
                <p className="text-sm" style={{ color: 'var(--muted-custom)' }}>
                  {t('startPracticingToTrack')}
                </p>
              </div>
            )}
          </div>

          {/* Recent Activity */}
          <div
            className="rounded-xl p-5"
            style={{ background: 'var(--surface)', border: '1px solid var(--border-custom)' }}
          >
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-semibold" style={{ color: 'var(--text)' }}>
                {t('recentActivity')}
              </h2>
              <Clock className="w-5 h-5" style={{ color: 'var(--muted-custom)' }} />
            </div>

            {recentActivity.length > 0 ? (
              <div className="space-y-3">
                {recentActivity.map((activity) => (
                  <div
                    key={activity.id}
                    className="flex items-center gap-3"
                  >
                    <div
                      className="w-2 h-2 rounded-full shrink-0"
                      style={{
                        background: activity.status === 'correct'
                          ? 'var(--teal)'
                          : 'var(--accent-red)',
                      }}
                    />
                    <div className="flex-1 min-w-0">
                      <p
                        className="text-sm truncate"
                        style={{ color: 'var(--text)' }}
                      >
                        {activity.topicName}
                      </p>
                      <p
                        className="text-xs truncate"
                        style={{ color: 'var(--muted-custom)' }}
                      >
                        {activity.status === 'correct' ? `✓ ${t('correct')}` : `✗ ${t('incorrect')}`} • {formatTimeAgo(activity.lastAttemptedAt, t)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <Clock
                  className="w-10 h-10 mx-auto mb-2 opacity-50"
                  style={{ color: 'var(--muted-custom)' }}
                />
                <p className="text-sm" style={{ color: 'var(--muted-custom)' }}>
                  {t('noRecentActivity')}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Section 3.5: Boss Battles */}
        {bossTopics.length > 0 && (
          <div
            className="rounded-xl p-5"
            style={{ background: 'var(--surface)', border: '1px solid var(--border-custom)' }}
          >
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-semibold" style={{ color: 'var(--text)' }}>
                {tBoss('dashboardSectionTitle')}
              </h2>
              <Swords className="w-5 h-5" style={{ color: 'var(--muted-custom)' }} />
            </div>

            <div className="grid gap-3 sm:grid-cols-3">
              {bossTopics.map((topic) => {
                const boss = getBossForTopic(topic.slug)
                const bossName = locale === 'af' ? boss.nameAf : boss.name

                return (
                  <div
                    key={topic.slug}
                    className="rounded-lg p-4 flex flex-col justify-between gap-3"
                    style={{ background: 'var(--surface2)', border: `1px solid ${boss.accent}` }}
                  >
                    <div>
                      <p className="text-sm font-semibold" style={{ color: 'var(--text)' }}>
                        {topic.title}
                      </p>
                      <p className="text-xs mt-0.5" style={{ color: 'var(--muted-custom)' }}>
                        {bossName}
                      </p>
                    </div>
                    <Link
                      href={`/topics/${topic.slug}/boss`}
                      className="inline-flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-semibold transition-all hover:opacity-90"
                      style={{ background: boss.accent, color: boss.onAccent === 'light' ? ACCENT_TEXT_LIGHT : ACCENT_TEXT_DARK }}
                    >
                      <Swords className="w-3.5 h-3.5" aria-hidden="true" />
                      {tBoss('fight')}
                    </Link>
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {/* Section 4: Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Practice */}
          <Link
            href={topicsWithProgress[0]?.topicSlug ? `/topics/${topicsWithProgress[0].topicSlug}/practice` : '/topics/trigonometry/practice'}
            className="rounded-xl p-5 flex items-center justify-between group transition-all hover:scale-[1.02]"
            style={{ background: 'var(--accent-red)' }}
          >
            <div>
              <h3 className="font-semibold text-white mb-1">{t('practice')}</h3>
              <p className="text-sm text-white/80">
                {t('continueWhereLeftOff')}
              </p>
            </div>
            <ArrowRight className="w-5 h-5 text-white group-hover:translate-x-1 transition-transform" />
          </Link>

          {/* AI Skills */}
          <Link
            href="/ai-skills"
            className="rounded-xl p-5 flex items-center justify-between group transition-all hover:scale-[1.02]"
            style={{ background: 'var(--ai-purple)' }}
          >
            <div>
              <h3 className="font-semibold text-white mb-1">{tNav('aiSkills')}</h3>
              <p className="text-sm text-white/80">
                {t('learnToUseAI')}
              </p>
            </div>
            <Brain className="w-5 h-5 text-white group-hover:scale-110 transition-transform" />
          </Link>

          {/* Past Papers */}
          <Link
            href="/papers"
            className="rounded-xl p-5 flex items-center justify-between group transition-all hover:scale-[1.02]"
            style={{ background: 'var(--surface)', border: '1px solid var(--border-custom)' }}
          >
            <div>
              <h3 className="font-semibold mb-1" style={{ color: 'var(--text)' }}>
                {tNav('papers')}
              </h3>
              <p className="text-sm" style={{ color: 'var(--muted-custom)' }}>
                {t('examPapersMemos')}
              </p>
            </div>
            <FileText className="w-5 h-5 group-hover:scale-110 transition-transform" style={{ color: 'var(--gold)' }} />
          </Link>

          {/* View Progress */}
          <Link
            href="/progress"
            className="rounded-xl p-5 flex items-center justify-between group transition-all hover:scale-[1.02]"
            style={{ background: 'var(--surface)', border: '1px solid var(--border-custom)' }}
          >
            <div>
              <h3 className="font-semibold mb-1" style={{ color: 'var(--text)' }}>
                {t('viewProgress')}
              </h3>
              <p className="text-sm" style={{ color: 'var(--muted-custom)' }}>
                {t('chartsLeaderboard')}
              </p>
            </div>
            <TrendingUp className="w-5 h-5 group-hover:scale-110 transition-transform" style={{ color: 'var(--teal)' }} />
          </Link>
        </div>
      </div>
    </div>
  )
}
