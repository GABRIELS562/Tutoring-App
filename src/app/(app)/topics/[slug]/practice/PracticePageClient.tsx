'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { ArrowLeft, Star } from 'lucide-react'
import Topbar from '@/components/layout/Topbar'
import QuizEngine from '@/components/quiz/QuizEngine'
import { useUser } from '@/context/UserContext'
import type { QuestionWithDetails } from '@/db/queries/questions'

type PracticePageClientProps = {
  slug: string
  difficulty?: number
  initialQuestions: QuestionWithDetails[]
  isDemo: boolean
  topicName: string
  topicPaper: number | null
}

export default function PracticePageClient({
  slug,
  difficulty,
  initialQuestions,
  isDemo,
  topicName,
  topicPaper,
}: PracticePageClientProps) {
  const { user } = useUser()
  const router = useRouter()

  // router.replace() re-renders the server component with the new
  // searchParams, which re-fetches questions server-side - no full
  // page reload needed.
  const setDifficulty = (d: number | undefined) => {
    const params = new URLSearchParams()
    if (d) {
      params.set('difficulty', d.toString())
    }
    const query = params.toString()
    router.replace(`/topics/${slug}/practice${query ? `?${query}` : ''}`)
  }

  return (
    <div className="min-h-screen" style={{ background: 'var(--bg)' }}>
      <Topbar
        title="Practice"
        subtitle={`${topicName} • Grade ${user?.grade || 11}${topicPaper ? ` Paper ${topicPaper}` : ''}`}
      />

      <div className="p-4 md:p-6 max-w-3xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <Link
            href={`/topics/${slug}`}
            className="flex items-center gap-2 text-sm font-medium transition-colors hover:opacity-80"
            style={{ color: 'var(--muted-custom)' }}
          >
            <ArrowLeft className="w-4 h-4" />
            Back to notes
          </Link>

          <h1 className="text-lg font-bold" style={{ color: 'var(--text)' }}>
            {topicName}
          </h1>
        </div>

        {/* Difficulty Filter */}
        <div className="flex flex-wrap gap-2 mb-6">
          <button
            onClick={() => setDifficulty(undefined)}
            className="px-4 py-2 rounded-lg text-sm font-medium transition-all"
            style={{
              background: !difficulty ? 'var(--accent-red)' : 'var(--surface2)',
              color: !difficulty ? 'white' : 'var(--text)',
              border: '1px solid',
              borderColor: !difficulty ? 'var(--accent-red)' : 'var(--border-custom)',
            }}
          >
            All
          </button>
          <button
            onClick={() => setDifficulty(1)}
            className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium transition-all"
            style={{
              background: difficulty === 1 ? 'var(--accent-red)' : 'var(--surface2)',
              color: difficulty === 1 ? 'white' : 'var(--text)',
              border: '1px solid',
              borderColor: difficulty === 1 ? 'var(--accent-red)' : 'var(--border-custom)',
            }}
          >
            Easy
            <Star className="w-3.5 h-3.5" style={{ color: difficulty === 1 ? 'white' : 'var(--gold)' }} />
          </button>
          <button
            onClick={() => setDifficulty(2)}
            className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium transition-all"
            style={{
              background: difficulty === 2 ? 'var(--accent-red)' : 'var(--surface2)',
              color: difficulty === 2 ? 'white' : 'var(--text)',
              border: '1px solid',
              borderColor: difficulty === 2 ? 'var(--accent-red)' : 'var(--border-custom)',
            }}
          >
            Medium
            <span style={{ color: difficulty === 2 ? 'white' : 'var(--gold)' }}>★★</span>
          </button>
          <button
            onClick={() => setDifficulty(3)}
            className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium transition-all"
            style={{
              background: difficulty === 3 ? 'var(--accent-red)' : 'var(--surface2)',
              color: difficulty === 3 ? 'white' : 'var(--text)',
              border: '1px solid',
              borderColor: difficulty === 3 ? 'var(--accent-red)' : 'var(--border-custom)',
            }}
          >
            Hard
            <span style={{ color: difficulty === 3 ? 'white' : 'var(--gold)' }}>★★★</span>
          </button>
        </div>

        {/* Quiz Engine */}
        <QuizEngine
          topicSlug={slug}
          grade={user?.grade || 11}
          userId={user?.id || 'demo-user'}
          difficulty={difficulty}
          initialQuestions={initialQuestions}
          isDemo={isDemo}
          hearts={user?.hearts}
          isPremium={user?.isPremium ?? false}
        />
      </div>
    </div>
  )
}
