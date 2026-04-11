'use client'

import { useParams, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Star } from 'lucide-react'
import Topbar from '@/components/layout/Topbar'
import QuizEngine from '@/components/quiz/QuizEngine'
import { useUser } from '@/context/UserContext'

// Content registry for topic metadata
const topicMetadata: Record<string, { name: string; subject: string; paper: number | null }> = {
  'trig-gr11': { name: 'Trigonometry', subject: 'maths', paper: 2 },
  'trigonometry': { name: 'Trigonometry', subject: 'maths', paper: 2 },
}

export default function PracticePage() {
  const params = useParams()
  const searchParams = useSearchParams()
  const { user } = useUser()

  const slug = params.slug as string
  const difficultyParam = searchParams.get('difficulty')
  const difficulty = difficultyParam ? parseInt(difficultyParam) : undefined

  const metadata = topicMetadata[slug] || { name: slug, subject: 'maths', paper: null }

  const setDifficulty = (d: number | undefined) => {
    const url = new URL(window.location.href)
    if (d) {
      url.searchParams.set('difficulty', d.toString())
    } else {
      url.searchParams.delete('difficulty')
    }
    window.history.pushState({}, '', url.toString())
    window.location.reload()
  }

  return (
    <div className="min-h-screen" style={{ background: 'var(--bg)' }}>
      <Topbar
        title="Practice"
        subtitle={`${metadata.name} • Grade ${user?.grade || 11}${metadata.paper ? ` Paper ${metadata.paper}` : ''}`}
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
            {metadata.name}
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
        />
      </div>
    </div>
  )
}
