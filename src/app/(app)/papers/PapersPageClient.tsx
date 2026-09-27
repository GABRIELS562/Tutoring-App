'use client'

import { useState } from 'react'
import Link from 'next/link'
import { FileText, BookOpen, Filter, X, ChevronDown, ExternalLink, Shield, Swords } from 'lucide-react'
import Topbar from '@/components/layout/Topbar'
import { useTranslations } from 'next-intl'
import type { PastPaperRecord } from '@/db/queries/topics'

/** A paper that has been transcribed into the exam game. */
export type PlayablePaper = {
  key: string
  title: string
  source: string
  questionCount: number
  totalMarks: number
}

type PapersPageClientProps = {
  papers: PastPaperRecord[]
  /** Papers the student can play question-by-question, in their language. */
  playable: PlayablePaper[]
}

export default function PapersPageClient({ papers, playable }: PapersPageClientProps) {
  const t = useTranslations('papers')
  const tExam = useTranslations('exam')
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
    return subject === 'maths' ? t('mathematics') : t('physicalScience')
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
      <Topbar title={t('title')} subtitle={t('pageSubtitle')} />

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
              {t('filters')}
              {hasActiveFilters && (
                <span
                  className="px-2 py-0.5 text-xs rounded-full"
                  style={{ background: 'var(--accent-red)', color: 'white' }}
                >
                  {t('active')}
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
                  {t('subject')}
                </label>
                <select
                  id="papers-subject-filter"
                  value={subjectFilter}
                  onChange={(e) => setSubjectFilter(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg text-sm"
                  style={{ background: 'var(--surface2)', color: 'var(--text)', border: '1px solid var(--border-custom)' }}
                >
                  <option value="">{t('allSubjects')}</option>
                  <option value="maths">{t('mathematics')}</option>
                  <option value="science">{t('physicalScience')}</option>
                </select>
              </div>

              <div>
                <label htmlFor="papers-grade-filter" className="block text-xs font-medium mb-1.5" style={{ color: 'var(--muted-custom)' }}>
                  {t('gradeLabel')}
                </label>
                <select
                  id="papers-grade-filter"
                  value={gradeFilter}
                  onChange={(e) => setGradeFilter(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg text-sm"
                  style={{ background: 'var(--surface2)', color: 'var(--text)', border: '1px solid var(--border-custom)' }}
                >
                  <option value="">{t('allGrades')}</option>
                  <option value="12">{t('grade12')}</option>
                  <option value="11">{t('grade11')}</option>
                  <option value="10">{t('grade10')}</option>
                </select>
              </div>

              <div>
                <label htmlFor="papers-year-filter" className="block text-xs font-medium mb-1.5" style={{ color: 'var(--muted-custom)' }}>
                  {t('year')}
                </label>
                <select
                  id="papers-year-filter"
                  value={yearFilter}
                  onChange={(e) => setYearFilter(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg text-sm"
                  style={{ background: 'var(--surface2)', color: 'var(--text)', border: '1px solid var(--border-custom)' }}
                >
                  <option value="">{t('allYears')}</option>
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
                {t('clearFilters')}
              </button>
            )}
          </div>
        </div>

        {/* Playable papers.
            The exam game lives at /exam, but a student looking for past
            papers comes HERE - and until now this page never mentioned it,
            so the one gamified thing in the app was invisible from the page
            it belongs to. Papers not yet transcribed still open as PDFs
            below, and the count says so rather than implying all of them
            are playable. */}
        {playable.length > 0 && (
          <div
            className="rounded-lg p-4 mb-4"
            style={{ background: 'var(--surface)', border: '1px solid var(--accent-red)' }}
          >
            <div className="flex items-start gap-3">
              <Swords
                className="w-5 h-5 mt-0.5 flex-shrink-0"
                style={{ color: 'var(--accent-red)' }}
                aria-hidden="true"
              />
              <div className="min-w-0 flex-1">
                <p className="text-sm font-semibold" style={{ color: 'var(--text)' }}>
                  {t('playableTitle')}
                </p>
                <p className="text-xs mt-1" style={{ color: 'var(--muted-custom)' }}>
                  {t('playableBody')}
                </p>

                <div className="mt-3 grid gap-2 sm:grid-cols-2">
                  {playable.map((paper) => (
                    <Link
                      key={paper.key}
                      href="/exam"
                      className="rounded-lg p-3 flex items-center justify-between gap-3 transition-all hover:scale-[1.01]"
                      style={{ background: 'var(--surface2)', border: '1px solid var(--border-custom)' }}
                    >
                      <span className="min-w-0">
                        <span className="block text-sm font-medium" style={{ color: 'var(--text)' }}>
                          {paper.title}
                        </span>
                        <span className="block text-xs mt-0.5" style={{ color: 'var(--muted-custom)' }}>
                          {paper.source} · {paper.questionCount} {tExam('questionsWord')} ·{' '}
                          {paper.totalMarks} {tExam('marks')}
                        </span>
                      </span>
                      <span
                        className="shrink-0 px-3 py-1.5 rounded-lg text-xs font-semibold"
                        style={{ background: 'var(--accent-red)', color: 'white' }}
                      >
                        {t('playableCta')}
                      </span>
                    </Link>
                  ))}
                </div>

                <p className="text-xs mt-3" style={{ color: 'var(--muted-custom)' }}>
                  {t('playableCount', { count: playable.length })}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Official Source Notice */}
        <div
          className="rounded-lg p-3 mb-4 flex items-start gap-3"
          style={{ background: 'rgba(42, 157, 143, 0.1)', border: '1px solid var(--teal)' }}
        >
          <Shield className="w-5 h-5 mt-0.5 flex-shrink-0" style={{ color: 'var(--teal)' }} />
          <div>
            <p className="text-sm font-medium" style={{ color: 'var(--text)' }}>
              {t('officialSource')}
            </p>
            <p className="text-xs mt-0.5" style={{ color: 'var(--muted-custom)' }}>
              {t('sourcedPrefix')} <strong>education.gov.za</strong> {t('sourcedSuffix')}
            </p>
          </div>
        </div>

        {/* Results */}
        <p className="text-sm mb-4" style={{ color: 'var(--muted-custom)' }}>
          {t('showingCount', { count: sortedPapers.length })}
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
                  <h2 className="font-bold text-base" style={{ color: 'var(--text)' }}>
                    {formatSubject(paper.subject)}
                  </h2>
                  <p className="text-sm" style={{ color: 'var(--muted-custom)' }}>
                    {t('gradeAndPaper', { grade: paper.grade, number: paper.paperNumber })}
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
                  <p className="text-xs mb-1.5" style={{ color: 'var(--muted-custom)' }}>{t('topicsLabel')}</p>
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
                  {t('paperButton')}
                  <ExternalLink className="w-3 h-3" />
                </button>
                {/* A paper with no memo says so. It used to render nothing,
                    so a student - every Grade 10 student, since DBE does not
                    publish those memos - saw a paper they could attempt with
                    no way to check it, and no reason given. */}
                {!paper.memoUrl && (
                  <span
                    className="flex-1 flex items-center justify-center gap-2 px-3 py-2.5 rounded-lg text-sm"
                    style={{
                      background: 'var(--surface2)',
                      color: 'var(--muted-custom)',
                      border: '1px dashed var(--border-custom)',
                    }}
                  >
                    <BookOpen className="w-4 h-4" aria-hidden="true" />
                    {t('memoUnavailable')}
                  </span>
                )}
                {paper.memoUrl && (
                  <button
                    onClick={() => openPaper(paper.memoUrl!)}
                    className="flex-1 flex items-center justify-center gap-2 px-3 py-2.5 rounded-lg font-medium text-sm cursor-pointer transition-opacity hover:opacity-90"
                    style={{ background: 'var(--surface2)', color: 'var(--text)', border: '1px solid var(--border-custom)' }}
                  >
                    <BookOpen className="w-4 h-4" />
                    {t('memoButton')}
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
            <p className="font-medium mb-1" style={{ color: 'var(--text)' }}>{t('noPapersFound')}</p>
            <p className="text-sm" style={{ color: 'var(--muted-custom)' }}>
              {papers.length === 0 ? t('noPapersYet') : t('tryAdjustingFilters')}
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
