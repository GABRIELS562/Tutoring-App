'use client'

import { useState } from 'react'
import { ChevronDown, ChevronRight, Plus, FileQuestion } from 'lucide-react'
import type { TopicTreeItem } from '@/db/queries/admin'
import QuestionsList from './QuestionsList'
import QuestionEditor from './QuestionEditor'

type TopicTree = {
  subjects: {
    name: string
    grades: {
      grade: number
      topics: TopicTreeItem[]
    }[]
  }[]
}

type QuestionsManagerProps = {
  initialTopicTree: TopicTree
}

export default function QuestionsManager({ initialTopicTree }: QuestionsManagerProps) {
  const [selectedTopic, setSelectedTopic] = useState<TopicTreeItem | null>(null)
  const [expandedSubjects, setExpandedSubjects] = useState<Set<string>>(new Set(['maths']))
  const [expandedGrades, setExpandedGrades] = useState<Set<string>>(new Set(['maths-11']))
  const [isEditorOpen, setIsEditorOpen] = useState(false)
  const [editingQuestionId, setEditingQuestionId] = useState<string | null>(null)
  const [refreshKey, setRefreshKey] = useState(0)

  const toggleSubject = (subject: string) => {
    const newExpanded = new Set(expandedSubjects)
    if (newExpanded.has(subject)) {
      newExpanded.delete(subject)
    } else {
      newExpanded.add(subject)
    }
    setExpandedSubjects(newExpanded)
  }

  const toggleGrade = (key: string) => {
    const newExpanded = new Set(expandedGrades)
    if (newExpanded.has(key)) {
      newExpanded.delete(key)
    } else {
      newExpanded.add(key)
    }
    setExpandedGrades(newExpanded)
  }

  const handleAddQuestion = () => {
    if (!selectedTopic) {
      alert('Please select a topic first')
      return
    }
    setEditingQuestionId(null)
    setIsEditorOpen(true)
  }

  const handleEditQuestion = (questionId: string) => {
    setEditingQuestionId(questionId)
    setIsEditorOpen(true)
  }

  const handleEditorClose = (saved: boolean) => {
    setIsEditorOpen(false)
    setEditingQuestionId(null)
    if (saved) {
      setRefreshKey((k) => k + 1)
    }
  }

  const getSubjectLabel = (subject: string) => {
    return subject === 'maths' ? 'Mathematics' : 'Physical Science'
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
      {/* Left Panel: Topic Selector Tree */}
      <div
        className="lg:col-span-1 rounded-xl p-4 h-fit max-h-[calc(100vh-200px)] overflow-y-auto"
        style={{ background: 'var(--surface)', border: '1px solid var(--border-custom)' }}
      >
        <h2 className="font-semibold mb-4" style={{ color: 'var(--text)' }}>
          Topics
        </h2>

        {initialTopicTree.subjects.length === 0 ? (
          <p className="text-sm" style={{ color: 'var(--muted-custom)' }}>
            No topics yet. Create topics first.
          </p>
        ) : (
          <div className="space-y-2">
            {initialTopicTree.subjects.map((subject) => (
              <div key={subject.name}>
                {/* Subject Header */}
                <button
                  onClick={() => toggleSubject(subject.name)}
                  className="w-full flex items-center gap-2 px-2 py-1.5 rounded-lg text-sm font-medium transition-colors hover:bg-white/5"
                  style={{ color: 'var(--text)' }}
                >
                  {expandedSubjects.has(subject.name) ? (
                    <ChevronDown className="w-4 h-4" />
                  ) : (
                    <ChevronRight className="w-4 h-4" />
                  )}
                  {getSubjectLabel(subject.name)}
                </button>

                {/* Grades */}
                {expandedSubjects.has(subject.name) && (
                  <div className="ml-4 space-y-1">
                    {subject.grades.map((gradeGroup) => {
                      const gradeKey = `${subject.name}-${gradeGroup.grade}`
                      return (
                        <div key={gradeKey}>
                          {/* Grade Header */}
                          <button
                            onClick={() => toggleGrade(gradeKey)}
                            className="w-full flex items-center gap-2 px-2 py-1 rounded-lg text-sm transition-colors hover:bg-white/5"
                            style={{ color: 'var(--muted-custom)' }}
                          >
                            {expandedGrades.has(gradeKey) ? (
                              <ChevronDown className="w-3 h-3" />
                            ) : (
                              <ChevronRight className="w-3 h-3" />
                            )}
                            Grade {gradeGroup.grade}
                          </button>

                          {/* Topics */}
                          {expandedGrades.has(gradeKey) && (
                            <div className="ml-4 space-y-0.5">
                              {gradeGroup.topics.map((topic) => (
                                <button
                                  key={topic.id}
                                  onClick={() => setSelectedTopic(topic)}
                                  className="w-full flex items-center justify-between px-2 py-1.5 rounded-lg text-sm transition-colors"
                                  style={{
                                    background: selectedTopic?.id === topic.id ? 'var(--accent-red)' : 'transparent',
                                    color: selectedTopic?.id === topic.id ? 'white' : 'var(--text)',
                                  }}
                                >
                                  <span className="truncate">{topic.name}</span>
                                  <span
                                    className="text-xs px-1.5 py-0.5 rounded"
                                    style={{
                                      background: selectedTopic?.id === topic.id ? 'rgba(255,255,255,0.2)' : 'var(--surface2)',
                                      color: selectedTopic?.id === topic.id ? 'white' : 'var(--muted-custom)',
                                    }}
                                  >
                                    {topic.questionCount}
                                  </span>
                                </button>
                              ))}
                            </div>
                          )}
                        </div>
                      )
                    })}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Right Panel: Questions List */}
      <div
        className="lg:col-span-3 rounded-xl p-4"
        style={{ background: 'var(--surface)', border: '1px solid var(--border-custom)' }}
      >
        {selectedTopic ? (
          <>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="font-semibold" style={{ color: 'var(--text)' }}>
                  {selectedTopic.name}
                </h2>
                <p className="text-xs" style={{ color: 'var(--muted-custom)' }}>
                  {getSubjectLabel(selectedTopic.subject)} • Grade {selectedTopic.grade}
                </p>
              </div>
              <button
                onClick={handleAddQuestion}
                className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                style={{ background: 'var(--accent-red)', color: 'white' }}
              >
                <Plus className="w-4 h-4" />
                Add Question
              </button>
            </div>

            <QuestionsList
              key={refreshKey}
              topicId={selectedTopic.id}
              onEdit={handleEditQuestion}
              onRefresh={() => setRefreshKey((k) => k + 1)}
            />
          </>
        ) : (
          <div className="flex flex-col items-center justify-center py-16">
            <FileQuestion className="w-12 h-12 mb-4" style={{ color: 'var(--muted-custom)' }} />
            <p style={{ color: 'var(--muted-custom)' }}>
              Select a topic from the left to view and manage questions
            </p>
          </div>
        )}
      </div>

      {/* Question Editor Modal */}
      {isEditorOpen && selectedTopic && (
        <QuestionEditor
          topicId={selectedTopic.id}
          topicName={selectedTopic.name}
          questionId={editingQuestionId}
          onClose={handleEditorClose}
        />
      )}
    </div>
  )
}
