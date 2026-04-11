'use client'

import { useState, useEffect, useTransition } from 'react'
import { Edit, Trash2, Check, X, AlertCircle } from 'lucide-react'
import type { AdminQuestion } from '@/db/queries/admin'

type QuestionsListProps = {
  topicId: string
  onEdit: (questionId: string) => void
  onRefresh: () => void
}

async function fetchQuestions(topicId: string): Promise<AdminQuestion[]> {
  const res = await fetch(`/api/admin/questions?topicId=${topicId}`)
  if (!res.ok) return []
  const data = await res.json()
  return data.questions || []
}

async function deleteQuestionAction(questionId: string) {
  const res = await fetch('/api/admin/questions', {
    method: 'DELETE',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ questionId }),
  })
  return res.ok
}

export default function QuestionsList({ topicId, onEdit, onRefresh }: QuestionsListProps) {
  const [questions, setQuestions] = useState<AdminQuestion[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isPending, startTransition] = useTransition()
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [currentTopicId, setCurrentTopicId] = useState(topicId)

  // Reset loading state when topicId changes
  if (topicId !== currentTopicId) {
    setCurrentTopicId(topicId)
    setIsLoading(true)
    setQuestions([])
  }

  useEffect(() => {
    let cancelled = false
    fetchQuestions(topicId).then((qs) => {
      if (!cancelled) {
        setQuestions(qs)
        setIsLoading(false)
      }
    })
    return () => { cancelled = true }
  }, [topicId])

  const handleDelete = (questionId: string) => {
    if (!confirm('Are you sure you want to delete this question? This cannot be undone.')) {
      return
    }

    setDeletingId(questionId)
    startTransition(async () => {
      const success = await deleteQuestionAction(questionId)
      if (success) {
        setQuestions((qs) => qs.filter((q) => q.id !== questionId))
        onRefresh()
      } else {
        alert('Failed to delete question')
      }
      setDeletingId(null)
    })
  }

  const getDifficultyLabel = (difficulty: number | null) => {
    switch (difficulty) {
      case 1:
        return { label: 'Easy', color: 'var(--teal)' }
      case 2:
        return { label: 'Medium', color: 'var(--gold)' }
      case 3:
        return { label: 'Hard', color: 'var(--accent-red)' }
      default:
        return { label: 'Unknown', color: 'var(--muted-custom)' }
    }
  }

  const truncateText = (text: string, length: number = 60) => {
    // Remove LaTeX delimiters for preview
    const cleanText = text.replace(/\$[^$]+\$/g, '[math]').replace(/\\\(/g, '[math]').replace(/\\\)/g, '')
    return cleanText.length > length ? cleanText.substring(0, length) + '...' : cleanText
  }

  if (isLoading) {
    return (
      <div className="py-8 text-center">
        <div className="animate-spin w-6 h-6 border-2 border-t-transparent rounded-full mx-auto mb-2" style={{ borderColor: 'var(--accent-red)', borderTopColor: 'transparent' }} />
        <p style={{ color: 'var(--muted-custom)' }}>Loading questions...</p>
      </div>
    )
  }

  if (questions.length === 0) {
    return (
      <div className="py-8 text-center">
        <AlertCircle className="w-8 h-8 mx-auto mb-2" style={{ color: 'var(--muted-custom)' }} />
        <p style={{ color: 'var(--muted-custom)' }}>
          No questions yet. Click &quot;Add Question&quot; to create one.
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-2">
      {questions.map((question) => {
        const difficulty = getDifficultyLabel(question.difficulty)
        return (
          <div
            key={question.id}
            className="flex items-center gap-4 p-3 rounded-lg transition-colors hover:bg-white/5"
            style={{ border: '1px solid var(--border-custom)' }}
          >
            {/* Question Preview */}
            <div className="flex-1 min-w-0">
              <p
                className="text-sm font-medium truncate"
                style={{ color: 'var(--text)' }}
              >
                {truncateText(question.questionText)}
              </p>
              <div className="flex items-center gap-3 mt-1">
                {/* Source */}
                {question.source && (
                  <span className="text-xs" style={{ color: 'var(--muted-custom)' }}>
                    {question.source.toUpperCase()}
                    {question.year && ` ${question.year}`}
                  </span>
                )}
                {/* Marks */}
                {question.marks && (
                  <span className="text-xs" style={{ color: 'var(--muted-custom)' }}>
                    {question.marks} marks
                  </span>
                )}
              </div>
            </div>

            {/* Difficulty Badge */}
            <span
              className="px-2 py-1 rounded text-xs font-medium shrink-0"
              style={{
                background: `${difficulty.color}20`,
                color: difficulty.color,
              }}
            >
              {difficulty.label}
            </span>

            {/* Approved Badge */}
            <div
              className="w-6 h-6 rounded-full flex items-center justify-center shrink-0"
              style={{
                background: question.isApproved ? 'rgba(42, 157, 143, 0.15)' : 'rgba(244, 162, 97, 0.15)',
              }}
              title={question.isApproved ? 'Approved' : 'Draft'}
            >
              {question.isApproved ? (
                <Check className="w-3.5 h-3.5" style={{ color: 'var(--teal)' }} />
              ) : (
                <X className="w-3.5 h-3.5" style={{ color: 'var(--gold)' }} />
              )}
            </div>

            {/* Actions */}
            <div className="flex items-center gap-1 shrink-0">
              <button
                onClick={() => onEdit(question.id)}
                className="p-2 rounded-lg transition-colors hover:bg-white/10"
                title="Edit question"
              >
                <Edit className="w-4 h-4" style={{ color: 'var(--muted-custom)' }} />
              </button>
              <button
                onClick={() => handleDelete(question.id)}
                disabled={isPending && deletingId === question.id}
                className="p-2 rounded-lg transition-colors hover:bg-white/10 disabled:opacity-50"
                title="Delete question"
              >
                <Trash2 className="w-4 h-4" style={{ color: 'var(--accent-red)' }} />
              </button>
            </div>
          </div>
        )
      })}
    </div>
  )
}
