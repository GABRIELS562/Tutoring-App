'use client'

type ActivityData = {
  date: string
  count: number
}

type ActivityCalendarProps = {
  data: ActivityData[]
}

function getActivityColor(count: number): string {
  if (count === 0) return 'var(--surface2)'
  if (count <= 5) return 'rgba(230, 57, 70, 0.3)'
  if (count <= 10) return 'rgba(230, 57, 70, 0.6)'
  return 'var(--accent-red)'
}

export default function ActivityCalendar({ data }: ActivityCalendarProps) {
  // Organize data into weeks (8 weeks × 7 days)
  const weeks: ActivityData[][] = []
  for (let i = 0; i < 8; i++) {
    weeks.push(data.slice(i * 7, (i + 1) * 7))
  }

  const dayLabels = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']

  return (
    <div>
      {/* Day labels */}
      <div className="flex gap-1 mb-2 ml-8">
        {dayLabels.map((day, i) => (
          <div
            key={day}
            className="w-7 h-4 text-[10px] text-center"
            style={{ color: 'var(--muted-custom)' }}
          >
            {i % 2 === 0 ? day : ''}
          </div>
        ))}
      </div>

      {/* Calendar grid */}
      <div className="flex flex-col gap-1">
        {weeks.map((week, weekIndex) => (
          <div key={weekIndex} className="flex items-center gap-1">
            {/* Week label */}
            <div
              className="w-7 text-[10px] text-right pr-1"
              style={{ color: 'var(--muted-custom)' }}
            >
              {weekIndex === 0 ? 'W1' : weekIndex === 7 ? 'W8' : ''}
            </div>

            {/* Days in week */}
            {week.map((day, dayIndex) => (
              <div
                key={`${weekIndex}-${dayIndex}`}
                className="w-7 h-7 rounded-sm cursor-pointer transition-all hover:scale-110"
                style={{
                  background: getActivityColor(day.count),
                }}
                title={`${day.date}: ${day.count} questions`}
              />
            ))}
          </div>
        ))}
      </div>

      {/* Legend */}
      <div className="flex items-center justify-end gap-2 mt-4">
        <span className="text-xs" style={{ color: 'var(--muted-custom)' }}>Less</span>
        <div className="flex gap-1">
          <div
            className="w-4 h-4 rounded-sm"
            style={{ background: 'var(--surface2)' }}
            title="0 questions"
          />
          <div
            className="w-4 h-4 rounded-sm"
            style={{ background: 'rgba(230, 57, 70, 0.3)' }}
            title="1-5 questions"
          />
          <div
            className="w-4 h-4 rounded-sm"
            style={{ background: 'rgba(230, 57, 70, 0.6)' }}
            title="6-10 questions"
          />
          <div
            className="w-4 h-4 rounded-sm"
            style={{ background: 'var(--accent-red)' }}
            title="10+ questions"
          />
        </div>
        <span className="text-xs" style={{ color: 'var(--muted-custom)' }}>More</span>
      </div>
    </div>
  )
}
