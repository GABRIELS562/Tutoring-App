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
          disabled={isPending}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
            isPending ? 'opacity-70' : ''
          }`}
          style={{
            background: selectedGrade === grade ? 'white' : 'rgba(255,255,255,0.2)',
            color: selectedGrade === grade ? 'var(--accent-red)' : 'white',
          }}
        >
          {t('grade')} {grade}
        </button>
      ))}
    </div>
  )
}
