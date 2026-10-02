'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { useTranslations } from 'next-intl'

type GradeSelectorProps = {
  currentGrade: number
}

async function updateGradeAction(grade: number): Promise<{ success: boolean; demo?: boolean }> {
  try {
    const res = await fetch('/api/update-grade', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ grade }),
    })
    if (res.ok) {
      return await res.json()
    }
    return { success: false }
  } catch {
    return { success: false }
  }
}

export default function GradeSelector({ currentGrade }: GradeSelectorProps) {
  const t = useTranslations('topics')
  const [selectedGrade, setSelectedGrade] = useState(currentGrade)
  const [isPending, startTransition] = useTransition()
  const router = useRouter()

  const handleGradeChange = (grade: number) => {
    if (grade === selectedGrade) return
    setSelectedGrade(grade)
    startTransition(async () => {
      const result = await updateGradeAction(grade)
      // Only refresh if it's a real user update (not demo mode)
      if (result.success && !result.demo) {
        router.refresh()
      }
    })
  }

  const grades = [10, 11, 12]

  return (
    <div className="flex gap-2">
      {grades.map((grade) => (
        <button
          key={grade}
          onClick={() => handleGradeChange(grade)}
          aria-pressed={selectedGrade === grade}
          disabled={isPending}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
            isPending ? 'opacity-70' : ''
          }`}
          style={{
            // The unselected chip used to LIGHTEN the red banner behind it
            // with a 20% white scrim, which left white-on-#e34b58 at
            // 3.88:1. Darkening instead keeps the same "inset" look and
            // takes it to 7.65:1.
            background: selectedGrade === grade ? 'white' : 'rgba(0,0,0,0.25)',
            color: selectedGrade === grade ? 'var(--accent-red)' : 'white',
          }}
        >
          {t('grade')} {grade}
        </button>
      ))}
    </div>
  )
}
