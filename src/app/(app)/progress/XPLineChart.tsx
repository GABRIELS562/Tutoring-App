'use client'

import { useTranslations, useLocale } from 'next-intl'

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts'

type XPData = {
  date: string
  xp: number
  dayLabel: string
}

type XPLineChartProps = {
  data: XPData[]
}

export default function XPLineChart({ data }: XPLineChartProps) {
  const t = useTranslations('progress')
  const locale = useLocale()

  // Weekday names come from the browser's own locale data rather than a
  // hardcoded English array, which put "Sun Mon Tue" along the bottom of an
  // otherwise Afrikaans page. The row already carries the ISO date, so the
  // label is derived here instead of in the query.
  const labelled = data.map((d) => ({
    ...d,
    weekday: new Date(d.date).toLocaleDateString(locale === 'af' ? 'af-ZA' : 'en-ZA', {
      weekday: 'short',
    }),
  }))
  if (data.length === 0) {
    return (
      <div className="h-[250px] flex items-center justify-center">
        <p style={{ color: 'var(--muted-custom)' }}>{t('noXpData')}</p>
      </div>
    )
  }

  const maxXP = Math.max(...data.map((d) => d.xp), 10)

  return (
    <div className="h-[250px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart
          data={labelled}
          margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
        >
          <CartesianGrid
            strokeDasharray="3 3"
            stroke="var(--border-custom)"
            vertical={false}
          />
          <XAxis
            dataKey="weekday"
            tick={{ fill: 'var(--muted-custom)', fontSize: 12 }}
            tickLine={false}
            axisLine={{ stroke: 'var(--border-custom)' }}
            interval={1}
          />
          <YAxis
            tick={{ fill: 'var(--muted-custom)', fontSize: 12 }}
            tickLine={false}
            axisLine={false}
            domain={[0, Math.ceil(maxXP / 10) * 10 + 10]}
            width={40}
          />
          <Tooltip
            contentStyle={{
              background: 'var(--surface2)',
              border: '1px solid var(--border-custom)',
              borderRadius: '8px',
              color: 'var(--text)',
            }}
            labelStyle={{ color: 'var(--muted-custom)' }}
            formatter={(value) => [`${value} XP`, 'Earned']}
            labelFormatter={(label) => label}
          />
          <Line
            // Draw immediately rather than animating in. A half-drawn
            // chart is indistinguishable from "no data": the axes and
            // labels are static so they always paint, while the line and
            // bars animate from zero, so a throttled or interrupted
            // animation leaves an empty plot that reads as an empty
            // account. Same rule as the question card in the quiz.
            isAnimationActive={false}
            type="monotone"
            dataKey="xp"
            stroke="var(--gold)"
            strokeWidth={2}
            dot={{
              fill: 'var(--gold)',
              stroke: 'var(--gold)',
              strokeWidth: 2,
              r: 4,
            }}
            activeDot={{
              fill: 'var(--gold)',
              stroke: 'var(--surface)',
              strokeWidth: 2,
              r: 6,
            }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}
