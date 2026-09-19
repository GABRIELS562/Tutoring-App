'use client'

import { useState } from 'react'
import { FileText, BookOpen, Filter, X, ChevronDown, ExternalLink, Shield } from 'lucide-react'
import Topbar from '@/components/layout/Topbar'
import type { PastPaperRecord } from '@/db/queries/topics'

type PapersPageClientProps = {
  papers: PastPaperRecord[]
}

export default function PapersPageClient({ papers }: PapersPageClientProps) {
  const [subjectFilter, setSubjectFilter] = useState('')
  const [gradeFilter, setGradeFilter] = useState('')
  const [yearFilter, setYearFilter] = useState('')
  const [showFilters, setShowFilters] = useState(false)

  const filteredPapers = papers.filter(paper => {
    if (subjectFilter && paper.subject !== subjectFilter) return false
    if (gradeFilter && paper.grade !== parseInt(gradeFilter)) return false
    if (yearFilter && paper.year !== parseInt(yearFilter)) return false
    return true
  })

  // Sort by year (newest first), then grade, then paper number
  const sortedPapers = [...filteredPapers].sort((a, b) => {
    if (b.year !== a.year) return b.year - a.year
    if (b.grade !== a.grade) return b.grade - a.grade
    return a.paperNumber - b.paperNumber
  })

  const formatSubject = (subject: string) => {
    return subject === 'maths' ? 'Mathematics' : 'Physical Science'
  }

  const clearFilters = () => {
    setSubjectFilter('')
    setGradeFilter('')
    setYearFilter('')
  }

  const hasActiveFilters = subjectFilter || gradeFilter || yearFilter

  // Open PDF in new tab
  const openPaper = (url: string) => {
    window.open(url, '_blank', 'noopener,noreferrer')
  }

  // Get unique years for filter
  const years = [...new Set(papers.map(p => p.year))].sort((a, b) => b - a)

  return (
    <div className="min-h-screen" style={{ background: 'var(--bg)' }}>
      <Topbar title="Past Papers" subtitle="Official DBE Exam Papers" />

      <div className="p-4 md:p-6 max-w-6xl mx-auto">
        {/* Filter Bar */}
        <div
          className="rounded-xl p-4 mb-6"
          style={{ background: 'var(--surface)', border: '1px solid var(--border-custom)' }}
        >
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="md:hidden flex items-center gap-2 w-full justify-between mb-4"
            style={{ color: 'var(--text)' }}
          >
            <span className="flex items-center gap-2 font-medium">
              <Filter className="w-4 h-4" />
              Filters
              {hasActiveFilters && (
                <span
                  className="px-2 py-0.5 text-xs rounded-full"
                  style={{ background: 'var(--accent-red)', color: 'white' }}
                >
                  Active
                </span>
              )}
            </span>
            <ChevronDown
              className={`w-4 h-4 transition-transform ${showFilters ? 'rotate-180' : ''}`}
            />
          </button>

          <div className={`${showFilters ? 'block' : 'hidden'} md:block`}>
            <div className="grid grid-cols-3 md:grid-cols-4 gap-3">
              <div>
                <label htmlFor="papers-subject-filter" className="block text-xs font-medium mb-1.5" style={{ color: 'var(--muted-custom)' }}>
                  Subject
                </label>
                <select
                  id="papers-subject-filter"
                  value={subjectFilter}
                  onChange={(e) => setSubjectFilter(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg text-sm"
                  style={{ background: 'var(--surface2)', color: 'var(--text)', border: '1px solid var(--border-custom)' }}
                >
                  <option value="">All Subjects</option>
                  <option value="maths">Mathematics</option>
                  <option value="science">Physical Science</option>
                </select>
              </div>

              <div>
                <label htmlFor="papers-grade-filter" className="block text-xs font-medium mb-1.5" style={{ color: 'var(--muted-custom)' }}>
                  Grade
                </label>
                <select
                  id="papers-grade-filter"
                  value={gradeFilter}
                  onChange={(e) => setGradeFilter(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg text-sm"
                  style={{ background: 'var(--surface2)', color: 'var(--text)', border: '1px solid var(--border-custom)' }}
                >
                  <option value="">All Grades</option>
                  <option value="12">Grade 12</option>
                  <option value="11">Grade 11</option>
                  <option value="10">Grade 10</option>
                </select>
              </div>

              <div>
                <label htmlFor="papers-year-filter" className="block text-xs font-medium mb-1.5" style={{ color: 'var(--muted-custom)' }}>
                  Year
                </label>
                <select
                  id="papers-year-filter"
                  value={yearFilter}
                  onChange={(e) => setYearFilter(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg text-sm"
                  style={{ background: 'var(--surface2)', color: 'var(--text)', border: '1px solid var(--border-custom)' }}
                >
                  <option value="">All Years</option>
                  {years.map(year => (
                    <option key={year} value={year}>{year}</option>
                  ))}
                </select>
              </div>
            </div>

            {hasActiveFilters && (
              <button
                onClick={clearFilters}
                className="mt-3 flex items-center gap-1.5 text-sm font-medium"
                style={{ color: 'var(--accent-red)' }}
              >
                <X className="w-4 h-4" />
                Clear filters
              </button>
            )}
          </div>
        </div>

        {/* Official Source Notice */}
        <div
          className="rounded-lg p-3 mb-4 flex items-start gap-3"
          style={{ background: 'rgba(42, 157, 143, 0.1)', border: '1px solid var(--teal)' }}
        >
          <Shield className="w-5 h-5 mt-0.5 flex-shrink-0" style={{ color: 'var(--teal)' }} />
          <div>
            <p className="text-sm font-medium" style={{ color: 'var(--text)' }}>
              Official Government Source
            </p>
            <p className="text-xs mt-0.5" style={{ color: 'var(--muted-custom)' }}>
              Papers sourced directly from <strong>education.gov.za</strong> - Department of Basic Education. Free public domain documents.
            </p>
          </div>
        </div>

        {/* Results */}
        <p className="text-sm mb-4" style={{ color: 'var(--muted-custom)' }}>
          Showing {sortedPapers.length} paper{sortedPapers.length !== 1 ? 's' : ''}
        </p>

        {/* Papers Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {sortedPapers.map(paper => (
            <div
              key={paper.id}
              className="rounded-xl p-4"
              style={{ background: 'var(--surface)', border: '1px solid var(--border-custom)' }}
            >
              <div className="flex items-start justify-between mb-3">
                <div>
                  <h3 className="font-bold text-base" style={{ color: 'var(--text)' }}>
                    {formatSubject(paper.subject)}
                  </h3>
                  <p className="text-sm" style={{ color: 'var(--muted-custom)' }}>
                    Grade {paper.grade} • Paper {paper.paperNumber}
                  </p>
                </div>
                <span
                  className="px-2.5 py-1 rounded-lg text-xs font-semibold"
                  style={{
                    background: paper.subject === 'maths' ? 'rgba(230, 57, 70, 0.15)' : 'rgba(45, 212, 191, 0.15)',
                    color: paper.subject === 'maths' ? 'var(--accent-red)' : 'var(--teal)',
                  }}
                >
                  {paper.year}
                </span>
              </div>

              <div className="flex items-center gap-2 mb-4">
                <span
                  className="px-2 py-0.5 rounded text-xs"
                  style={{ background: 'var(--surface2)', color: 'var(--muted-custom)' }}
                >
                  {paper.examType}
                </span>
                <span
                  className="px-2 py-0.5 rounded text-xs"
                  style={{ background: 'var(--surface2)', color: 'var(--muted-custom)' }}
                >
                  {paper.language}
                </span>
              </div>

              {paper.topicsCovered && (
                <div className="mb-4">
                  <p className="text-xs mb-1.5" style={{ color: 'var(--muted-custom)' }}>Topics:</p>
                  <div className="flex flex-wrap gap-1">
                    {paper.topicsCovered.slice(0, 3).map((topic, i) => (
                      <span
                        key={i}
                        className="px-2 py-0.5 rounded text-xs"
                        style={{ background: 'var(--surface2)', color: 'var(--text)' }}
                      >
                        {topic}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              <div className="flex gap-2">
                <button
                  onClick={() => openPaper(paper.pdfUrl)}
                  className="flex-1 flex items-center justify-center gap-2 px-3 py-2.5 rounded-lg font-medium text-sm cursor-pointer transition-opacity hover:opacity-90"
                  style={{ background: 'var(--accent-red)', color: 'white' }}
                >
                  <FileText className="w-4 h-4" />
                  Paper
                  <ExternalLink className="w-3 h-3" />
                </button>
                {paper.memoUrl && (
                  <button
                    onClick={() => openPaper(paper.memoUrl!)}
                    className="flex-1 flex items-center justify-center gap-2 px-3 py-2.5 rounded-lg font-medium text-sm cursor-pointer transition-opacity hover:opacity-90"
                    style={{ background: 'var(--surface2)', color: 'var(--text)', border: '1px solid var(--border-custom)' }}
                  >
                    <BookOpen className="w-4 h-4" />
                    Memo
                    <ExternalLink className="w-3 h-3" />
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>

        {sortedPapers.length === 0 && (
          <div
            className="text-center py-12 rounded-xl"
            style={{ background: 'var(--surface)', border: '1px solid var(--border-custom)' }}
          >
            <FileText className="w-12 h-12 mx-auto mb-3 opacity-50" style={{ color: 'var(--muted-custom)' }} />
            <p className="font-medium mb-1" style={{ color: 'var(--text)' }}>No papers found</p>
            <p className="text-sm" style={{ color: 'var(--muted-custom)' }}>
              {papers.length === 0 ? 'No past papers have been added yet.' : 'Try adjusting your filters'}
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
