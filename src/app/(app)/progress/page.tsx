import { cookies } from 'next/headers'
import { createServerClient } from '@supabase/ssr'
import { getTranslations } from 'next-intl/server'
import Topbar from '@/components/layout/Topbar'
import { getProgressData, getLeaderboard, getDashboardData } from '@/db/queries/progress'
import XPLineChart from './XPLineChart'
import AccuracyBarChart from './AccuracyBarChart'
import ActivityCalendar from './ActivityCalendar'
import Leaderboard from './Leaderboard'

export const dynamic = 'force-dynamic'

// Mock data for demo mode
const mockProgressData = {
  weeklyXP: [
    { date: '2026-03-23', xp: 30, dayLabel: 'Sun' },
    { date: '2026-03-24', xp: 50, dayLabel: 'Mon' },
    { date: '2026-03-25', xp: 20, dayLabel: 'Tue' },
    { date: '2026-03-26', xp: 80, dayLabel: 'Wed' },
    { date: '2026-03-27', xp: 40, dayLabel: 'Thu' },
    { date: '2026-03-28', xp: 60, dayLabel: 'Fri' },
    { date: '2026-03-29', xp: 0, dayLabel: 'Sat' },
    { date: '2026-03-30', xp: 70, dayLabel: 'Sun' },
    { date: '2026-03-31', xp: 90, dayLabel: 'Mon' },
    { date: '2026-04-01', xp: 45, dayLabel: 'Tue' },
    { date: '2026-04-02', xp: 55, dayLabel: 'Wed' },
    { date: '2026-04-03', xp: 100, dayLabel: 'Thu' },
    { date: '2026-04-04', xp: 35, dayLabel: 'Fri' },
    { date: '2026-04-05', xp: 25, dayLabel: 'Sat' },
  ],
  topicAccuracy: [
    { topicId: '1', topicName: 'Trigonometry', accuracy: 76, correctCount: 19, totalCount: 25 },
    { topicId: '2', topicName: 'Algebra', accuracy: 55, correctCount: 11, totalCount: 20 },
    { topicId: '3', topicName: 'Functions', accuracy: 80, correctCount: 12, totalCount: 15 },
    { topicId: '4', topicName: 'Geometry', accuracy: 38, correctCount: 7, totalCount: 18 },
    { topicId: '5', topicName: 'Statistics', accuracy: 90, correctCount: 9, totalCount: 10 },
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
  let progressData = mockProgressData
  let leaderboard = mockLeaderboard

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
        const fetchedProgress = await getProgressData(userId)
        if (fetchedProgress.weeklyXP.length > 0) {
          progressData = fetchedProgress
        }
        const fetchedLeaderboard = await getLeaderboard(userGrade)
        if (fetchedLeaderboard.length > 0) {
          leaderboard = fetchedLeaderboard
        }
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
