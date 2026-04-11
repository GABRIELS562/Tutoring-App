'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { Trash2 } from 'lucide-react'
import type { TopicWithCount } from '@/db/queries/admin'

type TopicsTableProps = {
  topics: TopicWithCount[]
}

async function deleteTopicAction(topicId: string) {
  const res = await fetch('/api/admin/topics', {
    method: 'DELETE',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ topicId }),
  })
  return res.ok
}

export default function TopicsTable({ topics }: TopicsTableProps) {
  const [isPending, startTransition] = useTransition()
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const router = useRouter()

  const handleDelete = (topicId: string, topicName: string) => {
    if (!confirm(`Are you sure you want to delete "${topicName}"? This cannot be undone.`)) {
      return
    }

    setDeletingId(topicId)
    startTransition(async () => {
      const success = await deleteTopicAction(topicId)
      if (success) {
        router.refresh()
      } else {
        alert('Failed to delete topic. It may have questions associated with it.')
      }
      setDeletingId(null)
    })
  }

  const getDifficultyLabel = (subject: string) => {
    return subject === 'maths' ? 'Mathematics' : subject.charAt(0).toUpperCase() + subject.slice(1)
  }

  if (topics.length === 0) {
    return (
      <div className="p-8 text-center">
        <p style={{ color: 'var(--muted-custom)' }}>
          No topics yet. Click &quot;Add Topic&quot; to create one.
        </p>
      </div>
    )
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead>
          <tr
            className="text-left text-xs border-b"
            style={{ color: 'var(--muted-custom)', borderColor: 'var(--border-custom)' }}
          >
            <th className="px-4 py-3 font-medium">Name</th>
            <th className="px-4 py-3 font-medium">Subject</th>
            <th className="px-4 py-3 font-medium">Grade</th>
            <th className="px-4 py-3 font-medium">Paper</th>
            <th className="px-4 py-3 font-medium text-right">Questions</th>
            <th className="px-4 py-3 font-medium text-right">Actions</th>
          </tr>
        </thead>
        <tbody>
          {topics.map((topic) => (
            <tr
              key={topic.id}
              className="border-b transition-colors hover:bg-white/5"
              style={{ borderColor: 'var(--border-custom)' }}
            >
              <td className="px-4 py-3">
                <div>
                  <span className="font-medium" style={{ color: 'var(--text)' }}>
                    {topic.name}
                  </span>
                  <p className="text-xs" style={{ color: 'var(--muted-custom)' }}>
                    {topic.slug}
                  </p>
                </div>
              </td>
              <td className="px-4 py-3">
                <span
                  className="px-2 py-1 rounded text-xs font-medium"
                  style={{
                    background: topic.subject === 'maths' ? 'rgba(42, 157, 143, 0.15)' : 'rgba(244, 162, 97, 0.15)',
                    color: topic.subject === 'maths' ? 'var(--teal)' : 'var(--gold)',
                  }}
                >
                  {getDifficultyLabel(topic.subject)}
                </span>
              </td>
              <td className="px-4 py-3" style={{ color: 'var(--text)' }}>
                Grade {topic.grade}
              </td>
              <td className="px-4 py-3" style={{ color: 'var(--muted-custom)' }}>
                {topic.paper ? `Paper ${topic.paper}` : '—'}
              </td>
              <td className="px-4 py-3 text-right">
                <span
                  className="px-2 py-1 rounded text-xs font-medium"
                  style={{
                    background: topic.questionCount > 0 ? 'rgba(42, 157, 143, 0.15)' : 'rgba(136, 136, 136, 0.15)',
                    color: topic.questionCount > 0 ? 'var(--teal)' : 'var(--muted-custom)',
                  }}
                >
                  {topic.questionCount}
                </span>
              </td>
              <td className="px-4 py-3 text-right">
                <button
                  onClick={() => handleDelete(topic.id, topic.name)}
                  disabled={isPending && deletingId === topic.id}
                  className="p-2 rounded-lg transition-colors hover:bg-white/10 disabled:opacity-50"
                  title="Delete topic"
                >
                  <Trash2
                    className="w-4 h-4"
                    style={{ color: 'var(--accent-red)' }}
                  />
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
