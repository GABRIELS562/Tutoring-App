'use client'

import { useState, useEffect, useTransition } from 'react'
import { X, Plus, Trash2, Sparkles, Loader2 } from 'lucide-react'
import type { FullQuestion } from '@/db/queries/admin'

type QuestionEditorProps = {
  topicId: string
  topicName: string
  questionId: string | null
  onClose: (saved: boolean) => void
}

type OptionData = {
  optionLetter: string
  optionText: string
  isCorrect: boolean
}

type StepData = {
  stepNumber: number
  instruction: string
  hint: string
  correctAnswer: string
  explanation: string
  createdBy: string
}

const SOURCES = [
  { value: 'nsc_dbe', label: 'NSC DBE' },
  { value: 'kzn', label: 'KZN' },
  { value: 'wced', label: 'WCED' },
  { value: 'angelo', label: 'Angelo Custom' },
]

const EXAM_TYPES = [
  { value: 'november', label: 'November' },
  { value: 'june', label: 'June' },
  { value: 'march', label: 'March' },
  { value: 'trial', label: 'Trial' },
  { value: 'custom', label: 'Custom' },
]

export default function QuestionEditor({
  topicId,
  topicName,
  questionId,
  onClose,
}: QuestionEditorProps) {
  const [isPending, startTransition] = useTransition()
  const [isLoading, setIsLoading] = useState(!!questionId)
  const [isGeneratingSteps, setIsGeneratingSteps] = useState(false)

  // Form state
  const [questionText, setQuestionText] = useState('')
  const [source, setSource] = useState('angelo')
  const [year, setYear] = useState('')
  const [examType, setExamType] = useState('custom')
  const [marks, setMarks] = useState('4')
  const [difficulty, setDifficulty] = useState('2')
  const [isMultipleChoice, setIsMultipleChoice] = useState(true)

  const [options, setOptions] = useState<OptionData[]>([
    { optionLetter: 'A', optionText: '', isCorrect: true },
    { optionLetter: 'B', optionText: '', isCorrect: false },
    { optionLetter: 'C', optionText: '', isCorrect: false },
    { optionLetter: 'D', optionText: '', isCorrect: false },
  ])

  const [steps, setSteps] = useState<StepData[]>([
    { stepNumber: 1, instruction: '', hint: '', correctAnswer: '', explanation: '', createdBy: 'angelo' },
  ])

  // Load existing question if editing
  useEffect(() => {
    if (questionId) {
      setIsLoading(true)
      fetch(`/api/admin/questions/${questionId}`)
        .then((res) => res.json())
        .then((data: { question: FullQuestion }) => {
          const q = data.question
          setQuestionText(q.questionText)
          setSource(q.source || 'angelo')
          setYear(q.year?.toString() || '')
          setExamType(q.examType || 'custom')
          setMarks(q.marks?.toString() || '4')
          setDifficulty(q.difficulty?.toString() || '2')
          setIsMultipleChoice(q.isMultipleChoice ?? true)

          if (q.options.length > 0) {
            setOptions(
              q.options.map((o) => ({
                optionLetter: o.optionLetter || 'A',
                optionText: o.optionText,
                isCorrect: o.isCorrect ?? false,
              }))
            )
          }

          if (q.steps.length > 0) {
            setSteps(
              q.steps.map((s) => ({
                stepNumber: s.stepNumber,
                instruction: s.instruction,
                hint: s.hint || '',
                correctAnswer: s.correctAnswer,
                explanation: s.explanation || '',
                createdBy: s.createdBy || 'angelo',
              }))
            )
          }

          setIsLoading(false)
        })
        .catch(() => {
          setIsLoading(false)
          alert('Failed to load question')
        })
    }
  }, [questionId])

  const handleOptionChange = (index: number, field: keyof OptionData, value: string | boolean) => {
    const newOptions = [...options]
    if (field === 'isCorrect' && value === true) {
      // Only one correct answer
      newOptions.forEach((o, i) => {
        o.isCorrect = i === index
      })
    } else {
      newOptions[index] = { ...newOptions[index], [field]: value }
    }
    setOptions(newOptions)
  }

  const addStep = () => {
    setSteps([
      ...steps,
      {
        stepNumber: steps.length + 1,
        instruction: '',
        hint: '',
        correctAnswer: '',
        explanation: '',
        createdBy: 'angelo',
      },
    ])
  }

  const removeStep = (index: number) => {
    if (steps.length === 1) return
    const newSteps = steps.filter((_, i) => i !== index).map((s, i) => ({
      ...s,
      stepNumber: i + 1,
    }))
    setSteps(newSteps)
  }

  const handleStepChange = (index: number, field: keyof StepData, value: string) => {
    const newSteps = [...steps]
    newSteps[index] = { ...newSteps[index], [field]: value }
    setSteps(newSteps)
  }

  const generateStepsWithAI = async () => {
    if (!questionText.trim()) {
      alert('Please enter a question first')
      return
    }

    setIsGeneratingSteps(true)
    try {
      const res = await fetch('/api/admin/generate-steps', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ questionText }),
      })

      if (!res.ok) {
        throw new Error('Failed to generate steps')
      }

      const data = await res.json()
      if (data.steps && data.steps.length > 0) {
        setSteps(
          data.steps.map((s: { instruction: string; hint: string; correctAnswer: string; explanation: string }, i: number) => ({
            stepNumber: i + 1,
            instruction: s.instruction,
            hint: s.hint || '',
            correctAnswer: s.correctAnswer,
            explanation: s.explanation || '',
            createdBy: 'claude_ai',
          }))
        )
      }
    } catch (error) {
      console.error('Error generating steps:', error)
      alert('Failed to generate steps. Please try again.')
    } finally {
      setIsGeneratingSteps(false)
    }
  }

  const handleSave = (approve: boolean) => {
    if (!questionText.trim()) {
      alert('Please enter question text')
      return
    }

    if (isMultipleChoice && !options.some((o) => o.isCorrect)) {
      alert('Please select a correct answer')
      return
    }

    if (steps.some((s) => !s.instruction.trim() || !s.correctAnswer.trim())) {
      alert('Please fill in all step instructions and correct answers')
      return
    }

    startTransition(async () => {
      const payload = {
        id: questionId,
        topicId,
        questionText,
        source,
        year: year ? parseInt(year) : null,
        examType,
        marks: parseInt(marks),
        difficulty: parseInt(difficulty),
        isMultipleChoice,
        isApproved: approve,
        options: isMultipleChoice ? options : [],
        steps,
      }

      const res = await fetch('/api/admin/questions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })

      if (res.ok) {
        onClose(true)
      } else {
        const data = await res.json()
        alert(data.error || 'Failed to save question')
      }
    })
  }

  if (isLoading) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div className="absolute inset-0 bg-black/60" />
        <div className="relative p-8">
          <Loader2 className="w-8 h-8 animate-spin" style={{ color: 'var(--accent-red-text)' }} />
        </div>
      </div>
    )
  }

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center p-4 overflow-y-auto">
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black/60" onClick={() => onClose(false)} />

      {/* Modal */}
      <div
        className="relative w-full max-w-3xl rounded-xl my-8"
        style={{ background: 'var(--surface)', border: '1px solid var(--border-custom)' }}
      >
        {/* Header */}
        <div
          className="flex items-center justify-between p-4 border-b"
          style={{ borderColor: 'var(--border-custom)' }}
        >
          <div>
            <h2 className="text-lg font-bold" style={{ color: 'var(--text)' }}>
              {questionId ? 'Edit Question' : 'Add Question'}
            </h2>
            <p className="text-sm" style={{ color: 'var(--muted-custom)' }}>
              {topicName}
            </p>
          </div>
          <button
            onClick={() => onClose(false)}
            className="p-2 rounded-lg transition-colors hover:bg-white/10"
          >
            <X className="w-5 h-5" style={{ color: 'var(--muted-custom)' }} />
          </button>
        </div>

        {/* Body */}
        <div className="p-4 space-y-6 max-h-[calc(100vh-250px)] overflow-y-auto">
          {/* Question Text */}
          <div>
            <label className="block text-sm font-medium mb-1" style={{ color: 'var(--text)' }}>
              Question Text * <span className="text-xs font-normal" style={{ color: 'var(--muted-custom)' }}>(supports LaTeX with $ delimiters)</span>
            </label>
            <textarea
              value={questionText}
              onChange={(e) => setQuestionText(e.target.value)}
              rows={4}
              required
              placeholder="e.g., Simplify without using a calculator: $\frac{\sin(210°)}{\cos(300°)}$"
              className="w-full px-3 py-2 rounded-lg text-sm resize-none"
              style={{
                background: 'var(--surface2)',
                border: '1px solid var(--border-custom)',
                color: 'var(--text)',
              }}
            />
          </div>

          {/* Source + Year + Exam Type Row */}
          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1" style={{ color: 'var(--text)' }}>
                Source
              </label>
              <select
                value={source}
                onChange={(e) => setSource(e.target.value)}
                className="w-full px-3 py-2 rounded-lg text-sm"
                style={{
                  background: 'var(--surface2)',
                  border: '1px solid var(--border-custom)',
                  color: 'var(--text)',
                }}
              >
                {SOURCES.map((s) => (
                  <option key={s.value} value={s.value}>
                    {s.label}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1" style={{ color: 'var(--text)' }}>
                Year
              </label>
              <input
                type="number"
                value={year}
                onChange={(e) => setYear(e.target.value)}
                placeholder="e.g., 2023"
                min="2000"
                max="2030"
                className="w-full px-3 py-2 rounded-lg text-sm"
                style={{
                  background: 'var(--surface2)',
                  border: '1px solid var(--border-custom)',
                  color: 'var(--text)',
                }}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1" style={{ color: 'var(--text)' }}>
                Exam Type
              </label>
              <select
                value={examType}
                onChange={(e) => setExamType(e.target.value)}
                className="w-full px-3 py-2 rounded-lg text-sm"
                style={{
                  background: 'var(--surface2)',
                  border: '1px solid var(--border-custom)',
                  color: 'var(--text)',
                }}
              >
                {EXAM_TYPES.map((et) => (
                  <option key={et.value} value={et.value}>
                    {et.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Marks + Difficulty Row */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1" style={{ color: 'var(--text)' }}>
                Marks
              </label>
              <input
                type="number"
                value={marks}
                onChange={(e) => setMarks(e.target.value)}
                min="1"
                max="20"
                className="w-full px-3 py-2 rounded-lg text-sm"
                style={{
                  background: 'var(--surface2)',
                  border: '1px solid var(--border-custom)',
                  color: 'var(--text)',
                }}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text)' }}>
                Difficulty
              </label>
              <div className="flex gap-2">
                {[
                  { value: '1', label: 'Easy', color: 'var(--teal)' },
                  { value: '2', label: 'Medium', color: 'var(--gold)' },
                  { value: '3', label: 'Hard', color: 'var(--accent-red-text)' },
                ].map((d) => (
                  <button
                    key={d.value}
                    type="button"
                    onClick={() => setDifficulty(d.value)}
                    className="flex-1 px-3 py-2 rounded-lg text-sm font-medium transition-colors"
                    style={{
                      background: difficulty === d.value ? d.color : 'var(--surface2)',
                      color: difficulty === d.value ? 'white' : 'var(--muted-custom)',
                      border: `1px solid ${difficulty === d.value ? d.color : 'var(--border-custom)'}`,
                    }}
                  >
                    {d.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Multiple Choice Toggle */}
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setIsMultipleChoice(!isMultipleChoice)}
              className="relative w-12 h-6 rounded-full transition-colors"
              style={{
                background: isMultipleChoice ? 'var(--accent-red)' : 'var(--surface2)',
              }}
            >
              <span
                className="absolute top-1 left-1 w-4 h-4 rounded-full bg-white transition-transform"
                style={{
                  transform: isMultipleChoice ? 'translateX(24px)' : 'translateX(0)',
                }}
              />
            </button>
            <span className="text-sm" style={{ color: 'var(--text)' }}>
              Multiple choice question
            </span>
          </div>

          {/* Options (if multiple choice) */}
          {isMultipleChoice && (
            <div>
              <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text)' }}>
                Options
              </label>
              <div className="space-y-2">
                {options.map((option, index) => (
                  <div key={option.optionLetter} className="flex items-center gap-2">
                    <span
                      className="w-8 h-8 rounded-lg flex items-center justify-center text-sm font-bold"
                      style={{
                        background: option.isCorrect ? 'var(--teal)' : 'var(--surface2)',
                        color: option.isCorrect ? 'white' : 'var(--muted-custom)',
                      }}
                    >
                      {option.optionLetter}
                    </span>
                    <input
                      type="text"
                      value={option.optionText}
                      onChange={(e) => handleOptionChange(index, 'optionText', e.target.value)}
                      placeholder={`Option ${option.optionLetter}`}
                      className="flex-1 px-3 py-2 rounded-lg text-sm"
                      style={{
                        background: 'var(--surface2)',
                        border: '1px solid var(--border-custom)',
                        color: 'var(--text)',
                      }}
                    />
                    <button
                      type="button"
                      onClick={() => handleOptionChange(index, 'isCorrect', true)}
                      className="px-3 py-2 rounded-lg text-xs font-medium transition-colors"
                      style={{
                        background: option.isCorrect ? 'var(--teal)' : 'var(--surface2)',
                        color: option.isCorrect ? 'white' : 'var(--muted-custom)',
                      }}
                    >
                      {option.isCorrect ? 'Correct' : 'Set correct'}
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Steps Section */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-sm font-medium" style={{ color: 'var(--text)' }}>
                Solution Steps
              </label>
              <button
                type="button"
                onClick={generateStepsWithAI}
                disabled={isGeneratingSteps || !questionText.trim()}
                className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors disabled:opacity-50"
                style={{
                  background: 'rgba(139, 92, 246, 0.15)',
                  color: '#8B5CF6',
                }}
              >
                {isGeneratingSteps ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <Sparkles className="w-3.5 h-3.5" />
                )}
                Generate with AI
              </button>
            </div>

            <div className="space-y-4">
              {steps.map((step, index) => (
                <div
                  key={index}
                  className="p-4 rounded-lg"
                  style={{ background: 'var(--surface2)', border: '1px solid var(--border-custom)' }}
                >
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-sm font-medium" style={{ color: 'var(--text)' }}>
                      Step {step.stepNumber}
                      {step.createdBy === 'claude_ai' && (
                        <span className="ml-2 text-xs px-2 py-0.5 rounded" style={{ background: 'rgba(139, 92, 246, 0.15)', color: '#8B5CF6' }}>
                          AI Generated
                        </span>
                      )}
                    </span>
                    {steps.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeStep(index)}
                        className="p-1 rounded transition-colors hover:bg-white/10"
                      >
                        <Trash2 className="w-4 h-4" style={{ color: 'var(--accent-red-text)' }} />
                      </button>
                    )}
                  </div>

                  <div className="space-y-3">
                    <div>
                      <label className="block text-xs mb-1" style={{ color: 'var(--muted-custom)' }}>
                        Instruction *
                      </label>
                      <textarea
                        value={step.instruction}
                        onChange={(e) => handleStepChange(index, 'instruction', e.target.value)}
                        rows={2}
                        placeholder="What should the student do in this step?"
                        className="w-full px-3 py-2 rounded-lg text-sm resize-none"
                        style={{
                          background: 'var(--bg)',
                          border: '1px solid var(--border-custom)',
                          color: 'var(--text)',
                        }}
                      />
                    </div>

                    <div>
                      <label className="block text-xs mb-1" style={{ color: 'var(--muted-custom)' }}>
                        Hint
                      </label>
                      <input
                        type="text"
                        value={step.hint}
                        onChange={(e) => handleStepChange(index, 'hint', e.target.value)}
                        placeholder="Optional hint for struggling students"
                        className="w-full px-3 py-2 rounded-lg text-sm"
                        style={{
                          background: 'var(--bg)',
                          border: '1px solid var(--border-custom)',
                          color: 'var(--text)',
                        }}
                      />
                    </div>

                    <div>
                      <label className="block text-xs mb-1" style={{ color: 'var(--muted-custom)' }}>
                        Correct Answer *
                      </label>
                      <input
                        type="text"
                        value={step.correctAnswer}
                        onChange={(e) => handleStepChange(index, 'correctAnswer', e.target.value)}
                        placeholder="The expected answer for this step"
                        className="w-full px-3 py-2 rounded-lg text-sm"
                        style={{
                          background: 'var(--bg)',
                          border: '1px solid var(--border-custom)',
                          color: 'var(--text)',
                        }}
                      />
                    </div>

                    <div>
                      <label className="block text-xs mb-1" style={{ color: 'var(--muted-custom)' }}>
                        Explanation
                      </label>
                      <textarea
                        value={step.explanation}
                        onChange={(e) => handleStepChange(index, 'explanation', e.target.value)}
                        rows={2}
                        placeholder="Why is this the correct answer?"
                        className="w-full px-3 py-2 rounded-lg text-sm resize-none"
                        style={{
                          background: 'var(--bg)',
                          border: '1px solid var(--border-custom)',
                          color: 'var(--text)',
                        }}
                      />
                    </div>
                  </div>
                </div>
              ))}

              <button
                type="button"
                onClick={addStep}
                className="w-full flex items-center justify-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors border-dashed"
                style={{
                  border: '2px dashed var(--border-custom)',
                  color: 'var(--muted-custom)',
                }}
              >
                <Plus className="w-4 h-4" />
                Add Step
              </button>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div
          className="flex items-center justify-end gap-3 p-4 border-t"
          style={{ borderColor: 'var(--border-custom)' }}
        >
          <button
            type="button"
            onClick={() => onClose(false)}
            className="px-4 py-2 rounded-lg text-sm font-medium transition-colors hover:bg-white/10"
            style={{ color: 'var(--muted-custom)' }}
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={() => handleSave(false)}
            disabled={isPending}
            className="px-4 py-2 rounded-lg text-sm font-medium transition-colors disabled:opacity-50"
            style={{
              background: 'var(--surface2)',
              border: '1px solid var(--border-custom)',
              color: 'var(--gold)',
            }}
          >
            {isPending ? 'Saving...' : 'Save as Draft'}
          </button>
          <button
            type="button"
            onClick={() => handleSave(true)}
            disabled={isPending}
            className="px-4 py-2 rounded-lg text-sm font-medium transition-colors disabled:opacity-50"
            style={{ background: 'var(--teal)', color: 'var(--bg)' }}
          >
            {isPending ? 'Saving...' : 'Approve & Publish'}
          </button>
        </div>
      </div>
    </div>
  )
}
