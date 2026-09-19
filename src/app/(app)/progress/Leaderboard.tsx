'use client'

import { Trophy } from 'lucide-react'
import { useTranslations } from 'next-intl'

type LeaderboardEntry = {
  id: string
  name: string
  school: string | null
  xp: number
}

type LeaderboardProps = {
  data: LeaderboardEntry[]
  currentUserId: string
}

function getMedalColor(rank: number): string | null {
  if (rank === 1) return '#FFD700' // Gold
  if (rank === 2) return '#C0C0C0' // Silver
  if (rank === 3) return '#CD7F32' // Bronze
  return null
}

export default function Leaderboard({ data, currentUserId }: LeaderboardProps) {
  const t = useTranslations('progress')

  if (data.length === 0) {
    return (
      <div className="h-[300px] flex items-center justify-center">
        <p style={{ color: 'var(--muted-custom)' }}>{t('noLeaderboardData')}</p>
      </div>
    )
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead>
          <tr
            className="text-left text-xs"
            style={{ color: 'var(--muted-custom)' }}
          >
            <th className="pb-3 font-medium">{t('rank')}</th>
            <th className="pb-3 font-medium">{t('name')}</th>
            <th className="pb-3 font-medium hidden sm:table-cell">{t('school')}</th>
            <th className="pb-3 font-medium text-right">{t('xp')}</th>
          </tr>
        </thead>
        <tbody>
          {data.map((entry, index) => {
            const rank = index + 1
            const medalColor = getMedalColor(rank)
            const isCurrentUser = entry.id === currentUserId

            return (
              <tr
                key={entry.id}
                className="border-t transition-colors"
                style={{
                  borderColor: 'var(--border-custom)',
                  borderLeftWidth: isCurrentUser ? '3px' : '0',
                  borderLeftColor: isCurrentUser ? 'var(--accent-red)' : 'transparent',
                  background: isCurrentUser ? 'rgba(230, 57, 70, 0.1)' : 'transparent',
                }}
              >
                <td className="py-3 pr-4">
                  <div className="flex items-center gap-2">
                    {medalColor ? (
                      <Trophy
                        className="w-4 h-4"
                        style={{ color: medalColor }}
                      />
                    ) : (
                      <span
                        className="text-sm font-medium w-4 text-center"
                        style={{ color: 'var(--muted-custom)' }}
                      >
                        {rank}
                      </span>
                    )}
                  </div>
                </td>
                <td className="py-3">
                  <span
                    className="text-sm font-medium"
                    style={{ color: isCurrentUser ? 'var(--accent-red)' : 'var(--text)' }}
                  >
                    {entry.name}
                    {isCurrentUser && (
                      <span className="ml-2 text-xs">{t('you')}</span>
                    )}
                  </span>
                </td>
                <td
                  className="py-3 text-sm hidden sm:table-cell"
                  style={{ color: 'var(--muted-custom)' }}
                >
                  {entry.school || '—'}
                </td>
                <td className="py-3 text-right">
                  <span
                    className="text-sm font-semibold"
                    style={{ color: 'var(--gold)' }}
                  >
                    {entry.xp.toLocaleString()}
                  </span>
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}
