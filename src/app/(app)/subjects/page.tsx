'use client'

import Link from 'next/link'
import Topbar from '@/components/layout/Topbar'
import { useUser } from '@/context/UserContext'
import { Calculator, Atom, ChevronRight, BookOpen, Target } from 'lucide-react'

const subjects = [
  {
    id: 'maths',
    name: 'Mathematics',
    icon: Calculator,
    description: 'Algebra, Trigonometry, Calculus, Geometry and more',
    color: 'var(--accent-red)',
    topics: 12,
    progress: 45,
  },
  {
    id: 'science',
    name: 'Physical Science',
    icon: Atom,
    description: 'Physics, Chemistry, Mechanics and Waves',
    color: 'var(--teal)',
    topics: 10,
    progress: 30,
  },
]

export default function SubjectsPage() {
  const { user } = useUser()

  return (
    <div>
      <Topbar
        title="Subjects"
        subtitle={user?.grade ? `Grade ${user.grade} • CAPS Curriculum` : 'CAPS Curriculum'}
      />
      <div className="p-4 md:p-6 max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold mb-2" style={{ color: 'var(--text)' }}>
            Choose a Subject
          </h1>
          <p style={{ color: 'var(--muted-custom)' }}>
            Select a subject to start learning. Track your progress and master each topic.
          </p>
        </div>

        {/* Subject Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {subjects.map((subject) => {
            const Icon = subject.icon
            return (
              <Link
                key={subject.id}
                href={`/subjects/${subject.id}`}
                className="group block rounded-xl p-6 transition-all hover:scale-[1.02]"
                style={{
                  background: 'var(--surface)',
                  border: '1px solid var(--border-custom)',
                }}
              >
                {/* Icon and Title */}
                <div className="flex items-start justify-between mb-4">
                  <div
                    className="w-14 h-14 rounded-xl flex items-center justify-center"
                    style={{ background: `${subject.color}20` }}
                  >
                    <Icon className="w-7 h-7" style={{ color: subject.color }} />
                  </div>
                  <ChevronRight
                    className="w-5 h-5 transition-transform group-hover:translate-x-1"
                    style={{ color: 'var(--muted-custom)' }}
                  />
                </div>

                {/* Subject Info */}
                <h2 className="text-xl font-bold mb-2" style={{ color: 'var(--text)' }}>
                  {subject.name}
                </h2>
                <p className="text-sm mb-4" style={{ color: 'var(--muted-custom)' }}>
                  {subject.description}
                </p>

                {/* Stats */}
                <div className="flex items-center gap-4 mb-4">
                  <div className="flex items-center gap-1.5">
                    <BookOpen className="w-4 h-4" style={{ color: 'var(--muted-custom)' }} />
                    <span className="text-sm" style={{ color: 'var(--muted-custom)' }}>
                      {subject.topics} topics
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Target className="w-4 h-4" style={{ color: 'var(--muted-custom)' }} />
                    <span className="text-sm" style={{ color: 'var(--muted-custom)' }}>
                      {subject.progress}% complete
                    </span>
                  </div>
                </div>

                {/* Progress Bar */}
                <div
                  className="h-2 rounded-full overflow-hidden"
                  style={{ background: 'var(--surface2)' }}
                >
                  <div
                    className="h-full rounded-full transition-all"
                    style={{
                      width: `${subject.progress}%`,
                      background: subject.color,
                    }}
                  />
                </div>
              </Link>
            )
          })}
        </div>

        {/* Info Note */}
        <div
          className="mt-6 rounded-xl p-4 flex items-start gap-3"
          style={{
            background: 'var(--surface)',
            border: '1px solid var(--border-custom)',
          }}
        >
          <div
            className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
            style={{ background: 'rgba(244, 162, 97, 0.15)' }}
          >
            <BookOpen className="w-4 h-4" style={{ color: 'var(--gold)' }} />
          </div>
          <div>
            <p className="font-medium mb-1" style={{ color: 'var(--text)' }}>
              CAPS Aligned Content
            </p>
            <p className="text-sm" style={{ color: 'var(--muted-custom)' }}>
              All topics follow the South African CAPS curriculum for Grade 10, 11, and 12.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
