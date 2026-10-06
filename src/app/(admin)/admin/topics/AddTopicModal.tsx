'use client'

import { useCallback, useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { Plus, X } from 'lucide-react'
import { useDialog } from '@/hooks/useDialog'

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')
}

/**
 * The route replies with a named list of what was wrong. Showing only
 * `error` turned that back into "Invalid question" with no clue which
 * field to fix.
 */
function describeSaveError(data: {
  error?: string
  issues?: { field: string; message: string }[]
}): string {
  if (data.issues?.length) {
    return data.issues.map((i) => `${i.field}: ${i.message}`).join('\n')
  }
  return data.error || 'Failed to save'
}

export default function AddTopicModal() {
  const [isOpen, setIsOpen] = useState(false)
  const [isPending, startTransition] = useTransition()
  const router = useRouter()

  const [formData, setFormData] = useState({
    name: '',
    subject: 'maths',
    grade: '11',
    paper: '',
    slug: '',
    capsWeightPercent: '',
    term: '',
    sortOrder: '',
  })

  const handleNameChange = (name: string) => {
    setFormData({
      ...formData,
      name,
      slug: slugify(name),
    })
  }

  const close = useCallback(() => setIsOpen(false), [])
  /**
   * The same hook the boss-battle dialogs use. Without it this modal had
   * no dialog semantics at all: nothing announced it, focus stayed
   * wherever it was, Tab walked straight out into the page behind the
   * backdrop - which a sighted keyboard user cannot see - and Escape did
   * nothing.
   */
  const dialogRef = useDialog<HTMLDivElement>(isOpen, close)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    startTransition(async () => {
      const res = await fetch('/api/admin/topics', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formData.name,
          subject: formData.subject,
          grade: parseInt(formData.grade),
          paper: formData.paper ? parseInt(formData.paper) : null,
          slug: formData.slug,
          capsWeightPercent: formData.capsWeightPercent ? parseInt(formData.capsWeightPercent) : null,
          term: formData.term ? parseInt(formData.term) : null,
          sortOrder: formData.sortOrder ? parseInt(formData.sortOrder) : null,
        }),
      })

      if (res.ok) {
        setFormData({
          name: '',
          subject: 'maths',
          grade: '11',
          paper: '',
          slug: '',
          capsWeightPercent: '',
          term: '',
          sortOrder: '',
        })
        close()
        router.refresh()
      } else {
        const data = await res.json()
        alert(describeSaveError(data))
      }
    })
  }

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors"
        style={{ background: 'var(--accent-red)', color: 'white' }}
      >
        <Plus className="w-4 h-4" />
        Add Topic
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop. aria-hidden because the dialog below names itself -
              a bare clickable div would otherwise be announced as an
              unlabelled element between the user and the form. */}
          <div
            className="absolute inset-0 bg-black/60"
            aria-hidden="true"
            onClick={close}
          />

          {/* Modal */}
          <div
            ref={dialogRef}
            role="dialog"
            aria-modal="true"
            aria-labelledby="add-topic-title"
            className="relative w-full max-w-lg rounded-xl p-6"
            style={{ background: 'var(--surface)', border: '1px solid var(--border-custom)' }}
          >
            <div className="flex items-center justify-between mb-6">
              <h2 id="add-topic-title" className="text-xl font-bold" style={{ color: 'var(--text)' }}>
                Add New Topic
              </h2>
              <button
                type="button"
                onClick={close}
                aria-label="Close"
                className="p-2 rounded-lg transition-colors hover:bg-white/10"
              >
                <X className="w-5 h-5" aria-hidden="true" style={{ color: 'var(--muted-custom)' }} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Name */}
              <div>
                <label htmlFor="topic-topic-name" className="block text-sm font-medium mb-1" style={{ color: 'var(--text)' }}>
                  Topic Name *
                </label>
                <input
                  id="topic-topic-name"
                  type="text"
                  value={formData.name}
                  onChange={(e) => handleNameChange(e.target.value)}
                  required
                  placeholder="e.g., Trigonometry"
                  className="w-full px-3 py-2 rounded-lg text-sm"
                  style={{
                    background: 'var(--surface2)',
                    border: '1px solid var(--border-custom)',
                    color: 'var(--text)',
                  }}
                />
              </div>

              {/* Subject + Grade row */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label htmlFor="topic-subject" className="block text-sm font-medium mb-1" style={{ color: 'var(--text)' }}>
                    Subject *
                  </label>
                  <select
                    id="topic-subject"
                    value={formData.subject}
                    onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg text-sm"
                    style={{
                      background: 'var(--surface2)',
                      border: '1px solid var(--border-custom)',
                      color: 'var(--text)',
                    }}
                  >
                    <option value="maths">Mathematics</option>
                    <option value="science">Physical Science</option>
                  </select>
                </div>
                <div>
                  <label htmlFor="topic-grade" className="block text-sm font-medium mb-1" style={{ color: 'var(--text)' }}>
                    Grade *
                  </label>
                  <select
                    id="topic-grade"
                    value={formData.grade}
                    onChange={(e) => setFormData({ ...formData, grade: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg text-sm"
                    style={{
                      background: 'var(--surface2)',
                      border: '1px solid var(--border-custom)',
                      color: 'var(--text)',
                    }}
                  >
                    <option value="10">Grade 10</option>
                    <option value="11">Grade 11</option>
                    <option value="12">Grade 12</option>
                  </select>
                </div>
              </div>

              {/* Paper + Term row */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label htmlFor="topic-paper" className="block text-sm font-medium mb-1" style={{ color: 'var(--text)' }}>
                    Paper
                  </label>
                  <select
                    id="topic-paper"
                    value={formData.paper}
                    onChange={(e) => setFormData({ ...formData, paper: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg text-sm"
                    style={{
                      background: 'var(--surface2)',
                      border: '1px solid var(--border-custom)',
                      color: 'var(--text)',
                    }}
                  >
                    <option value="">None</option>
                    <option value="1">Paper 1</option>
                    <option value="2">Paper 2</option>
                  </select>
                </div>
                <div>
                  <label htmlFor="topic-term" className="block text-sm font-medium mb-1" style={{ color: 'var(--text)' }}>
                    Term
                  </label>
                  <select
                    id="topic-term"
                    value={formData.term}
                    onChange={(e) => setFormData({ ...formData, term: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg text-sm"
                    style={{
                      background: 'var(--surface2)',
                      border: '1px solid var(--border-custom)',
                      color: 'var(--text)',
                    }}
                  >
                    <option value="">None</option>
                    <option value="1">Term 1</option>
                    <option value="2">Term 2</option>
                    <option value="3">Term 3</option>
                    <option value="4">Term 4</option>
                  </select>
                </div>
              </div>

              {/* Slug */}
              <div>
                <label htmlFor="topic-slug-auto-generated" className="block text-sm font-medium mb-1" style={{ color: 'var(--text)' }}>
                  Slug (auto-generated)
                </label>
                <input
                  id="topic-slug-auto-generated"
                  type="text"
                  value={formData.slug}
                  onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                  required
                  placeholder="trigonometry-gr11"
                  className="w-full px-3 py-2 rounded-lg text-sm"
                  style={{
                    background: 'var(--surface2)',
                    border: '1px solid var(--border-custom)',
                    color: 'var(--muted-custom)',
                  }}
                />
              </div>

              {/* CAPS Weight + Sort Order row */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label htmlFor="topic-caps-weight" className="block text-sm font-medium mb-1" style={{ color: 'var(--text)' }}>
                    CAPS Weight %
                  </label>
                  <input
                    id="topic-caps-weight"
                    type="number"
                    value={formData.capsWeightPercent}
                    onChange={(e) => setFormData({ ...formData, capsWeightPercent: e.target.value })}
                    placeholder="e.g., 15"
                    min="0"
                    max="100"
                    className="w-full px-3 py-2 rounded-lg text-sm"
                    style={{
                      background: 'var(--surface2)',
                      border: '1px solid var(--border-custom)',
                      color: 'var(--text)',
                    }}
                  />
                </div>
                <div>
                  <label htmlFor="topic-sort-order" className="block text-sm font-medium mb-1" style={{ color: 'var(--text)' }}>
                    Sort Order
                  </label>
                  <input
                    id="topic-sort-order"
                    type="number"
                    value={formData.sortOrder}
                    onChange={(e) => setFormData({ ...formData, sortOrder: e.target.value })}
                    placeholder="e.g., 1"
                    min="0"
                    className="w-full px-3 py-2 rounded-lg text-sm"
                    style={{
                      background: 'var(--surface2)',
                      border: '1px solid var(--border-custom)',
                      color: 'var(--text)',
                    }}
                  />
                </div>
              </div>

              {/* Actions */}
              <div className="flex justify-end gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  className="px-4 py-2 rounded-lg text-sm font-medium transition-colors hover:bg-white/10"
                  style={{ color: 'var(--muted-custom)' }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isPending}
                  className="px-4 py-2 rounded-lg text-sm font-medium transition-colors disabled:opacity-50"
                  style={{ background: 'var(--accent-red)', color: 'white' }}
                >
                  {isPending ? 'Creating...' : 'Create Topic'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  )
}
