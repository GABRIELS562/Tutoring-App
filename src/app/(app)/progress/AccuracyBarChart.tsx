'use client'

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from 'recharts'

type TopicAccuracy = {
  topicId: string
  topicName: string
  accuracy: number
  correctCount: number
  totalCount: number
}

type AccuracyBarChartProps = {
  data: TopicAccuracy[]
}

function getBarColor(accuracy: number): string {
  if (accuracy >= 70) return 'var(--teal)'
  if (accuracy >= 40) return 'var(--gold)'
  return 'var(--accent-red)'
}

export default function AccuracyBarChart({ data }: AccuracyBarChartProps) {
  if (data.length === 0) {
    return (
      <div className="h-[250px] flex items-center justify-center">
        <p style={{ color: 'var(--muted-custom)' }}>No topic data yet. Start practicing!</p>
      </div>
    )
  }

  // Sort by accuracy descending
  const sortedData = [...data].sort((a, b) => b.accuracy - a.accuracy)

  return (
    <div className="h-[250px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={sortedData}
          layout="vertical"
          margin={{ top: 10, right: 50, left: 10, bottom: 0 }}
        >
          <XAxis
            type="number"
            domain={[0, 100]}
            tick={{ fill: 'var(--muted-custom)', fontSize: 12 }}
            tickLine={false}
            axisLine={{ stroke: 'var(--border-custom)' }}
            tickFormatter={(value) => `${value}%`}
          />
          <YAxis
            type="category"
            dataKey="topicName"
            tick={{ fill: 'var(--text)', fontSize: 12 }}
            tickLine={false}
            axisLine={false}
            width={100}
          />
          <Tooltip
            contentStyle={{
              background: 'var(--surface2)',
              border: '1px solid var(--border-custom)',
              borderRadius: '8px',
              color: 'var(--text)',
            }}
            formatter={(value, _name, props) => {
              const payload = props.payload as TopicAccuracy
              return [`${value}% (${payload.correctCount}/${payload.totalCount})`, 'Accuracy']
            }}
          />
          <Bar
            dataKey="accuracy"
            radius={[0, 4, 4, 0]}
            barSize={24}
          >
            {sortedData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={getBarColor(entry.accuracy)} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}
