'use client'

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
  if (data.length === 0) {
    return (
      <div className="h-[250px] flex items-center justify-center">
        <p style={{ color: 'var(--muted-custom)' }}>No XP data yet. Start practicing!</p>
      </div>
    )
  }

  const maxXP = Math.max(...data.map((d) => d.xp), 10)

  return (
    <div className="h-[250px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart
          data={data}
          margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
        >
          <CartesianGrid
            strokeDasharray="3 3"
            stroke="var(--border-custom)"
            vertical={false}
          />
          <XAxis
            dataKey="dayLabel"
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
