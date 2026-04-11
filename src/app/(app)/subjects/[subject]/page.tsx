'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useParams } from 'next/navigation'
import Topbar from '@/components/layout/Topbar'
import { useUser } from '@/context/UserContext'
import {
  Calculator,
  Atom,
  ChevronRight,
  CheckCircle2,
  Circle,
  Lock,
  Star,
} from 'lucide-react'

// Topic data for each subject and grade
const topicsData: Record<string, Record<number, Array<{
  slug: string
  name: string
  status: 'completed' | 'in-progress' | 'locked'
  progress: number
  lessons: number
  questions: number
}>>> = {
  maths: {
    10: [
      { slug: 'algebraic-expressions-gr10', name: 'Algebraic Expressions', status: 'completed', progress: 100, lessons: 5, questions: 20 },
      { slug: 'exponents-gr10', name: 'Exponents', status: 'completed', progress: 100, lessons: 4, questions: 15 },
      { slug: 'number-patterns-gr10', name: 'Number Patterns', status: 'in-progress', progress: 60, lessons: 3, questions: 12 },
      { slug: 'equations-gr10', name: 'Equations and Inequalities', status: 'locked', progress: 0, lessons: 6, questions: 25 },
    ],
    11: [
      { slug: 'trig-gr11', name: 'Trigonometry', status: 'in-progress', progress: 45, lessons: 8, questions: 30 },
      { slug: 'analytical-geometry-gr11', name: 'Analytical Geometry', status: 'locked', progress: 0, lessons: 5, questions: 20 },
      { slug: 'euclidean-geometry-gr11', name: 'Euclidean Geometry', status: 'locked', progress: 0, lessons: 7, questions: 25 },
      { slug: 'functions-gr11', name: 'Functions', status: 'locked', progress: 0, lessons: 10, questions: 40 },
    ],
    12: [
      { slug: 'calculus-gr12', name: 'Differential Calculus', status: 'locked', progress: 0, lessons: 12, questions: 50 },
      { slug: 'probability-gr12', name: 'Probability', status: 'locked', progress: 0, lessons: 6, questions: 25 },
      { slug: 'sequences-gr12', name: 'Sequences and Series', status: 'locked', progress: 0, lessons: 5, questions: 20 },
      { slug: 'financial-maths-gr12', name: 'Financial Mathematics', status: 'locked', progress: 0, lessons: 4, questions: 15 },
    ],
  },
  science: {
    10: [
      { slug: 'mechanics-gr10', name: 'Mechanics', status: 'in-progress', progress: 30, lessons: 8, questions: 30 },
      { slug: 'matter-gr10', name: 'Matter and Materials', status: 'locked', progress: 0, lessons: 6, questions: 20 },
      { slug: 'waves-gr10', name: 'Waves and Sound', status: 'locked', progress: 0, lessons: 5, questions: 18 },
    ],
    11: [
      { slug: 'electrostatics-gr11', name: 'Electrostatics', status: 'locked', progress: 0, lessons: 6, questions: 25 },
      { slug: 'electromagnetism-gr11', name: 'Electromagnetism', status: 'locked', progress: 0, lessons: 5, questions: 20 },
      { slug: 'chemical-change-gr11', name: 'Chemical Change', status: 'locked', progress: 0, lessons: 7, questions: 28 },
    ],
    12: [
      { slug: 'momentum-gr12', name: 'Momentum and Impulse', status: 'locked', progress: 0, lessons: 5, questions: 20 },
      { slug: 'work-energy-gr12', name: 'Work, Energy and Power', status: 'locked', progress: 0, lessons: 6, questions: 25 },
      { slug: 'organic-chemistry-gr12', name: 'Organic Chemistry', status: 'locked', progress: 0, lessons: 8, questions: 35 },
    ],
  },
}

const subjectInfo = {
  maths: {
    name: 'Mathematics',
    icon: Calculator,
    color: 'var(--accent-red)',
  },
  science: {
    name: 'Physical Science',
    icon: Atom,
    color: 'var(--teal)',
  },
}

export default function SubjectPage() {
  const { user } = useUser()
  const params = useParams()
  const subject = params.subject as string
  const [selectedGrade, setSelectedGrade] = useState(user?.grade || 11)

  const info = subjectInfo[subject as keyof typeof subjectInfo]
  const topics = topicsData[subject]?.[selectedGrade] || []
  const Icon = info?.icon || Calculator

  if (!info) {
    return (
      <div>
        <Topbar title="Subject Not Found" />
        <div className="p-6">
          <p style={{ color: 'var(--muted-custom)' }}>
            Subject &quot;{subject}&quot; not found.
          </p>
          <Link
            href="/subjects"
            className="inline-flex items-center gap-2 mt-4 px-4 py-2 rounded-lg"
            style={{ background: 'var(--accent-red)', color: 'white' }}
          >
            Back to Subjects
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div>
      <Topbar
        title={info.name}
        subtitle={`Grade ${selectedGrade} • CAPS Curriculum`}
      />
      <div className="p-4 md:p-6 max-w-4xl mx-auto">
        {/* Subject Header */}
        <div className="flex items-center gap-4 mb-6">
          <div
            className="w-16 h-16 rounded-xl flex items-center justify-center"
            style={{ background: `${info.color}20` }}
          >
            <Icon className="w-8 h-8" style={{ color: info.color }} />
          </div>
          <div>
            <h1 className="text-2xl font-bold" style={{ color: 'var(--text)' }}>
              {info.name}
            </h1>
            <p style={{ color: 'var(--muted-custom)' }}>
              {topics.length} topics • {topics.reduce((a, t) => a + t.lessons, 0)} lessons
            </p>
          </div>
        </div>

        {/* Grade Selector */}
        <div className="flex gap-2 mb-6">
          {[10, 11, 12].map((grade) => (
            <button
              key={grade}
              onClick={() => setSelectedGrade(grade)}
              className="px-4 py-2 rounded-lg font-medium text-sm transition-colors"
              style={{
                background: selectedGrade === grade ? info.color : 'var(--surface)',
                color: selectedGrade === grade ? 'white' : 'var(--text)',
                border: `1px solid ${selectedGrade === grade ? info.color : 'var(--border-custom)'}`,
              }}
            >
              Grade {grade}
            </button>
          ))}
        </div>

        {/* Topics List */}
        <div className="space-y-3">
          {topics.map((topic, index) => {
            const isLocked = topic.status === 'locked'
            const isCompleted = topic.status === 'completed'
            const isInProgress = topic.status === 'in-progress'

            return (
              <Link
                key={topic.slug}
                href={isLocked ? '#' : `/topics/${topic.slug}`}
                className={`block rounded-xl p-4 transition-all ${
                  isLocked ? 'opacity-60 cursor-not-allowed' : 'hover:scale-[1.01]'
                }`}
                style={{
                  background: 'var(--surface)',
                  border: `1px solid ${isInProgress ? info.color : 'var(--border-custom)'}`,
                }}
                onClick={(e) => isLocked && e.preventDefault()}
              >
                <div className="flex items-center gap-4">
                  {/* Status Icon */}
                  <div
                    className="w-10 h-10 rounded-full flex items-center justify-center shrink-0"
                    style={{
                      background: isCompleted
                        ? 'rgba(42, 157, 143, 0.15)'
                        : isInProgress
                        ? `${info.color}20`
                        : 'var(--surface2)',
                    }}
                  >
                    {isCompleted ? (
                      <CheckCircle2 className="w-5 h-5" style={{ color: 'var(--teal)' }} />
                    ) : isLocked ? (
                      <Lock className="w-5 h-5" style={{ color: 'var(--muted-custom)' }} />
                    ) : (
                      <Circle className="w-5 h-5" style={{ color: info.color }} />
                    )}
                  </div>

                  {/* Topic Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xs font-medium px-2 py-0.5 rounded" style={{ background: 'var(--surface2)', color: 'var(--muted-custom)' }}>
                        {index + 1}
                      </span>
                      <h3 className="font-semibold truncate" style={{ color: 'var(--text)' }}>
                        {topic.name}
                      </h3>
                      {isInProgress && (
                        <Star className="w-4 h-4 shrink-0" style={{ color: 'var(--gold)' }} />
                      )}
                    </div>
                    <p className="text-sm" style={{ color: 'var(--muted-custom)' }}>
                      {topic.lessons} lessons • {topic.questions} questions
                    </p>

                    {/* Progress Bar */}
                    {!isLocked && (
                      <div className="mt-2">
                        <div
                          className="h-1.5 rounded-full overflow-hidden"
                          style={{ background: 'var(--surface2)' }}
                        >
                          <div
                            className="h-full rounded-full transition-all"
                            style={{
                              width: `${topic.progress}%`,
                              background: isCompleted ? 'var(--teal)' : info.color,
                            }}
                          />
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Arrow */}
                  {!isLocked && (
                    <ChevronRight className="w-5 h-5 shrink-0" style={{ color: 'var(--muted-custom)' }} />
                  )}
                </div>
              </Link>
            )
          })}
        </div>

        {/* Back Link */}
        <div className="mt-6 pt-6" style={{ borderTop: '1px solid var(--border-custom)' }}>
          <Link
            href="/subjects"
            className="text-sm font-medium hover:underline"
            style={{ color: info.color }}
          >
            ← Back to all subjects
          </Link>
        </div>
      </div>
    </div>
  )
}
