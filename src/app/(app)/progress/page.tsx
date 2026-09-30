import { cookies } from 'next/headers'
import { createServerClient } from '@supabase/ssr'
import { getTranslations } from 'next-intl/server'
import Topbar from '@/components/layout/Topbar'
import { getProgressData, getLeaderboard, getDashboardData } from '@/db/queries/progress'
import { getExamSummary, type ExamPaperSummary } from '@/db/queries/exam'
import { paperByKey } from '@/content/exam'
// Recharts is 376KB and lives on this page alone - loaded on demand, not
// on the critical path. See LazyCharts.tsx.
import { XPLineChart, AccuracyBarChart } from './LazyCharts'
import ActivityCalendar from './ActivityCalendar'
import Leaderboard from './Leaderboard'

export const dynamic = 'force-dynamic'

// Mock data for demo mode
const mockProgressData = {
  weeklyXP: [
    { date: '2026-03-23', xp: 30 },
    { date: '2026-03-24', xp: 50 },
    { date: '2026-03-25', xp: 20 },
    { date: '2026-03-26', xp: 80 },
    { date: '2026-03-27', xp: 40 },
    { date: '2026-03-28', xp: 60 },
    { date: '2026-03-29', xp: 0 },
    { date: '2026-03-30', xp: 70 },
    { date: '2026-03-31', xp: 90 },
    { date: '2026-04-01', xp: 45 },
    { date: '2026-04-02', xp: 55 },
    { date: '2026-04-03', xp: 100 },
    { date: '2026-04-04', xp: 35 },
    { date: '2026-04-05', xp: 25 },
  ],
  topicAccuracy: [
    { topicId: '1', topicName: 'Trigonometry', topicSlug: 'trig-gr11', accuracy: 76, correctCount: 19, totalCount: 25 },
    { topicId: '2', topicName: 'Algebra', topicSlug: 'algebra-gr10', accuracy: 55, correctCount: 11, totalCount: 20 },
    { topicId: '3', topicName: 'Functions', topicSlug: 'functions-gr10', accuracy: 80, correctCount: 12, totalCount: 15 },
    { topicId: '4', topicName: 'Geometry', topicSlug: 'euclidean-geometry-gr11', accuracy: 38, correctCount: 7, totalCount: 18 },
    { topicId: '5', topicName: 'Statistics', topicSlug: 'statistics-gr11', accuracy: 90, correctCount: 9, totalCount: 10 },
  ],
  activityCalendar: Array.from({ length: 56 }, (_, i) => {
    const date = new Date()
    date.setDate(date.getDate() - (55 - i))
    return {
      date: date.toISOString().split('T')[0],
      count: Math.random() > 0.4 ? Math.floor(Math.random() * 15) : 0,
    }
  }),
}

const mockLeaderboard: { id: string; name: string; school: string | null; xp: number }[] = [
  { id: '1', name: 'Thabo M.', school: 'Wynberg High', xp: 2450 },
  { id: '2', name: 'Naledi K.', school: 'Rondebosch Girls', xp: 2280 },
  { id: '3', name: 'Sipho N.', school: 'SACS', xp: 2150 },
  { id: '4', name: 'Ayanda Z.', school: 'Bishops', xp: 1980 },
  { id: '5', name: 'Lerato P.', school: 'Herschel', xp: 1850 },
  { id: 'demo-user', name: 'Demo S.', school: 'Demo High', xp: 1250 },
  { id: '6', name: 'Mandla S.', school: 'Pinelands High', xp: 1120 },
  { id: '7', name: 'Nomvula T.', school: 'Sans Souci', xp: 980 },
  { id: '8', name: 'Bongani M.', school: 'Westerford', xp: 850 },
  { id: '9', name: 'Zanele D.', school: 'Springfield', xp: 720 },
]

export default async function ProgressPage() {
  const t = await getTranslations('progress')
  let userId = 'demo-user'
  let userGrade = 11
  // These are a preview for a signed-out visitor only. They are invented
  // data - an XP chart that is not anyone's and a leaderboard of made-up
  // classmates - so a signed-in student must never see them, however their
  // own fetch turns out.
  let progressData = mockProgressData
  let leaderboard = mockLeaderboard
  // No mock counterpart on purpose. An invented exam result is worse than
  // no section: the whole point of the exam game is telling a student what
  // they actually got wrong, so the section simply does not render until
  // there is a real attempt behind it.
  let examSummary: ExamPaperSummary[] = []

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
        const dashboardData = await getDashboardData(userId)
        if (dashboardData.user) {
          userGrade = dashboardData.user.grade || 11
        }

        // For a signed-in student we show what they actually have, even
        // when that is nothing. Falling back on "the result was empty"
        // meant a real student with no practice yet - or one whose query
        // failed - was shown an invented XP chart and a leaderboard of
        // made-up classmates presented as their grade's real ranking.
        progressData = await getProgressData(userId)
        leaderboard = await getLeaderboard(userGrade)
        examSummary = await getExamSummary(userId)
      }
    }
  } catch (error) {
    console.error('Progress page auth error:', error)
  }

  return (
    <div className="min-h-screen" style={{ background: 'var(--bg)' }}>
      <Topbar
        title={t('title')}
        subtitle={t('subtitle')}
      />

      <div className="p-4 md:p-6 max-w-6xl mx-auto space-y-6">
        {/* Section 1: XP Line Chart */}
        <div
          className="rounded-xl p-5"
          style={{ background: 'var(--surface)', border: '1px solid var(--border-custom)' }}
        >
          <h2 className="font-semibold mb-4" style={{ color: 'var(--text)' }}>
            {t('xpEarned')}
          </h2>
          <XPLineChart data={progressData.weeklyXP} />
        </div>

        {/* Section 2: Accuracy by Topic */}
        <div
          className="rounded-xl p-5"
          style={{ background: 'var(--surface)', border: '1px solid var(--border-custom)' }}
        >
          <h2 className="font-semibold mb-4" style={{ color: 'var(--text)' }}>
            {t('accuracyByTopic')}
          </h2>
          <AccuracyBarChart data={progressData.topicAccuracy} />
        </div>

        {/* Section 2b: Exam papers.
            Practice measures accuracy; an exam paper measures MARKS, which
            is the number a matric student is actually judged on. They are
            not the same thing and are deliberately not merged into one
            chart - 80% of questions attempted is not 80%. */}
        {examSummary.length > 0 && (
          <div
            className="rounded-xl p-5"
            style={{ background: 'var(--surface)', border: '1px solid var(--border-custom)' }}
          >
            <h2 className="font-semibold mb-4" style={{ color: 'var(--text)' }}>
              {t('examPapers')}
            </h2>
            <div className="space-y-3">
              {examSummary.map((paper) => {
                const meta = paperByKey(paper.paperKey)
                const percent = paper.marksAvailable > 0
                  ? Math.round((paper.marksEarned / paper.marksAvailable) * 100)
                  : 0
                return (
                  <div
                    key={paper.paperKey}
                    className="rounded-lg p-4"
                    style={{ background: 'var(--surface2)', border: '1px solid var(--border-custom)' }}
                  >
                    <div className="flex items-baseline justify-between gap-3 flex-wrap">
                      <span className="font-semibold text-sm" style={{ color: 'var(--text)' }}>
                        {meta?.title ?? paper.paperKey}
                      </span>
                      <span className="text-sm font-bold" style={{ color: 'var(--text)' }}>
                        {paper.marksEarned} / {paper.marksAvailable}
                        <span className="ml-2" style={{ color: 'var(--accent-red)' }}>{percent}%</span>
                      </span>
                    </div>
                    <p className="text-xs mt-1" style={{ color: 'var(--muted-custom)' }}>
                      {t('examAnswered', { count: paper.itemsAttempted })}
                    </p>
                    <div className="flex gap-4 mt-2 text-xs flex-wrap">
                      <span style={{ color: 'var(--teal)' }}>
                        {t('examMastered', { count: paper.mastered })}
                      </span>
                      {/* Surfaced on its own because it is the one number
                          that should change what the student does next. */}
                      <span style={{ color: paper.blindSpots > 0 ? '#e9c46a' : 'var(--muted-custom)' }}>
                        {t('examBlindSpots', { count: paper.blindSpots })}
                      </span>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {/* Section 3 & 4: Activity Calendar and Leaderboard */}
        <div className="grid md:grid-cols-2 gap-6">
          {/* Activity Calendar */}
          <div
            className="rounded-xl p-5"
            style={{ background: 'var(--surface)', border: '1px solid var(--border-custom)' }}
          >
            <h2 className="font-semibold mb-4" style={{ color: 'var(--text)' }}>
              {t('activityCalendarTitle')}
            </h2>
            <ActivityCalendar data={progressData.activityCalendar} />
          </div>

          {/* Leaderboard */}
          <div
            className="rounded-xl p-5"
            style={{ background: 'var(--surface)', border: '1px solid var(--border-custom)' }}
          >
            <h2 className="font-semibold mb-4" style={{ color: 'var(--text)' }}>
              {t('gradeLeaderboard', { grade: userGrade })}
            </h2>
            <Leaderboard data={leaderboard} currentUserId={userId} />
          </div>
        </div>
      </div>
    </div>
  )
}
