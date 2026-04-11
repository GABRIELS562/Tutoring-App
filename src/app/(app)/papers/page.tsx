'use client'

import { useState } from 'react'
import { FileText, BookOpen, Filter, X, ChevronDown, ExternalLink, Shield } from 'lucide-react'
import Topbar from '@/components/layout/Topbar'

type PastPaper = {
  id: string
  grade: number
  subject: string
  year: number
  examType: string
  paperNumber: number
  language: string | null
  pdfUrl: string
  memoUrl: string | null
  topicsCovered: string[] | null
}

// Official Department of Basic Education (DBE) Papers
// Source: https://www.education.gov.za - Free public domain government documents
const DBE_BASE = 'https://www.education.gov.za/LinkClick.aspx?fileticket='

const mockPapers: PastPaper[] = [
  // ============================================
  // GRADE 12 MATHEMATICS - NSC November Exams
  // Source: education.gov.za (Official DBE)
  // ============================================
  // 2024
  { id: 'maths-12-2024-p1', grade: 12, subject: 'maths', year: 2024, examType: 'NSC', paperNumber: 1, language: 'English',
    pdfUrl: `${DBE_BASE}8W2dAxBUTQA%3d&tabid=5193&portalid=0&mid=13724`,
    memoUrl: `${DBE_BASE}D_T4clPBpkk%3d&tabid=5193&portalid=0&mid=13724`,
    topicsCovered: ['Algebra', 'Functions', 'Calculus', 'Probability'] },
  { id: 'maths-12-2024-p2', grade: 12, subject: 'maths', year: 2024, examType: 'NSC', paperNumber: 2, language: 'English',
    pdfUrl: `${DBE_BASE}ycHWvBVvV2M%3d&tabid=5193&portalid=0&mid=13724`,
    memoUrl: `${DBE_BASE}0DIM92_2Vu8%3d&tabid=5193&portalid=0&mid=13724`,
    topicsCovered: ['Trigonometry', 'Geometry', 'Statistics'] },
  // 2023
  { id: 'maths-12-2023-p1', grade: 12, subject: 'maths', year: 2023, examType: 'NSC', paperNumber: 1, language: 'English',
    pdfUrl: `${DBE_BASE}M_7mZq2zE5o%3d&tabid=4682&portalid=0&mid=12681`,
    memoUrl: `${DBE_BASE}ViEtlf4659c%3d&tabid=4682&portalid=0&mid=12681`,
    topicsCovered: ['Algebra', 'Functions', 'Calculus', 'Probability'] },
  { id: 'maths-12-2023-p2', grade: 12, subject: 'maths', year: 2023, examType: 'NSC', paperNumber: 2, language: 'English',
    pdfUrl: `${DBE_BASE}Zoios-rCurI%3d&tabid=4682&portalid=0&mid=12681`,
    memoUrl: `${DBE_BASE}0RJSBcYBmhA%3d&tabid=4682&portalid=0&mid=12681`,
    topicsCovered: ['Trigonometry', 'Geometry', 'Statistics'] },
  // 2022
  { id: 'maths-12-2022-p1', grade: 12, subject: 'maths', year: 2022, examType: 'NSC', paperNumber: 1, language: 'English',
    pdfUrl: `${DBE_BASE}Juy5nA5N3fM%3d&tabid=3294&portalid=0&mid=10986`,
    memoUrl: `${DBE_BASE}gytAGGPYSc8%3d&tabid=3294&portalid=0&mid=10986`,
    topicsCovered: ['Algebra', 'Functions', 'Calculus', 'Probability'] },
  { id: 'maths-12-2022-p2', grade: 12, subject: 'maths', year: 2022, examType: 'NSC', paperNumber: 2, language: 'English',
    pdfUrl: `${DBE_BASE}DqfP-i10rEE%3d&tabid=3294&portalid=0&mid=10986`,
    memoUrl: `${DBE_BASE}var8F7VpOmU%3d&tabid=3294&portalid=0&mid=10986`,
    topicsCovered: ['Trigonometry', 'Geometry', 'Statistics'] },
  // 2021
  { id: 'maths-12-2021-p1', grade: 12, subject: 'maths', year: 2021, examType: 'NSC', paperNumber: 1, language: 'English',
    pdfUrl: `${DBE_BASE}sGgq9FNv0lQ%3d&tabid=2922&portalid=0&mid=10138`,
    memoUrl: `${DBE_BASE}LJo4MZ4DRZM%3d&tabid=2922&portalid=0&mid=10138`,
    topicsCovered: ['Algebra', 'Functions', 'Calculus', 'Probability'] },
  { id: 'maths-12-2021-p2', grade: 12, subject: 'maths', year: 2021, examType: 'NSC', paperNumber: 2, language: 'English',
    pdfUrl: `${DBE_BASE}jgMJbW3Aa0o%3d&tabid=2922&portalid=0&mid=10138`,
    memoUrl: `${DBE_BASE}s7hK0H8bqPM%3d&tabid=2922&portalid=0&mid=10138`,
    topicsCovered: ['Trigonometry', 'Geometry', 'Statistics'] },
  // 2020
  { id: 'maths-12-2020-p1', grade: 12, subject: 'maths', year: 2020, examType: 'NSC', paperNumber: 1, language: 'English',
    pdfUrl: `${DBE_BASE}FU-0n3tYUzs%3d&tabid=2702&portalid=0&mid=9635`,
    memoUrl: `${DBE_BASE}P7kQcnNxRHY%3d&tabid=2702&portalid=0&mid=9635`,
    topicsCovered: ['Algebra', 'Functions', 'Calculus', 'Probability'] },
  { id: 'maths-12-2020-p2', grade: 12, subject: 'maths', year: 2020, examType: 'NSC', paperNumber: 2, language: 'English',
    pdfUrl: `${DBE_BASE}f-OMZa2HZ5U%3d&tabid=2702&portalid=0&mid=9635`,
    memoUrl: `${DBE_BASE}R9cpC35sw60%3d&tabid=2702&portalid=0&mid=9635`,
    topicsCovered: ['Trigonometry', 'Geometry', 'Statistics'] },

  // ============================================
  // GRADE 12 PHYSICAL SCIENCES - NSC November Exams
  // ============================================
  // 2024
  { id: 'science-12-2024-p1', grade: 12, subject: 'science', year: 2024, examType: 'NSC', paperNumber: 1, language: 'English',
    pdfUrl: `${DBE_BASE}jKqWYBbucS4%3d&tabid=5193&portalid=0&mid=13728`,
    memoUrl: `${DBE_BASE}4GvIWeAkK8U%3d&tabid=5193&portalid=0&mid=13728`,
    topicsCovered: ['Mechanics', 'Waves', 'Electricity', 'Magnetism'] },
  { id: 'science-12-2024-p2', grade: 12, subject: 'science', year: 2024, examType: 'NSC', paperNumber: 2, language: 'English',
    pdfUrl: `${DBE_BASE}ZxN41kEGHhI%3d&tabid=5193&portalid=0&mid=13728`,
    memoUrl: `${DBE_BASE}8rVrLl89rfM%3d&tabid=5193&portalid=0&mid=13728`,
    topicsCovered: ['Chemistry', 'Organic Chemistry', 'Reactions'] },
  // 2023
  { id: 'science-12-2023-p1', grade: 12, subject: 'science', year: 2023, examType: 'NSC', paperNumber: 1, language: 'English',
    pdfUrl: `${DBE_BASE}oTJzzXEU6Ng%3d&tabid=4682&portalid=0&mid=12685`,
    memoUrl: `${DBE_BASE}6g6X4xphO7I%3d&tabid=4682&portalid=0&mid=12685`,
    topicsCovered: ['Mechanics', 'Waves', 'Electricity', 'Magnetism'] },
  { id: 'science-12-2023-p2', grade: 12, subject: 'science', year: 2023, examType: 'NSC', paperNumber: 2, language: 'English',
    pdfUrl: `${DBE_BASE}Gs2cDJBpRR0%3d&tabid=4682&portalid=0&mid=12685`,
    memoUrl: `${DBE_BASE}1JdWi95UKbY%3d&tabid=4682&portalid=0&mid=12685`,
    topicsCovered: ['Chemistry', 'Organic Chemistry', 'Reactions'] },
  // 2022
  { id: 'science-12-2022-p1', grade: 12, subject: 'science', year: 2022, examType: 'NSC', paperNumber: 1, language: 'English',
    pdfUrl: `${DBE_BASE}5l5vQTQBaU4%3d&tabid=3294&portalid=0&mid=10990`,
    memoUrl: `${DBE_BASE}1GNWZdT8oLQ%3d&tabid=3294&portalid=0&mid=10990`,
    topicsCovered: ['Mechanics', 'Waves', 'Electricity', 'Magnetism'] },
  { id: 'science-12-2022-p2', grade: 12, subject: 'science', year: 2022, examType: 'NSC', paperNumber: 2, language: 'English',
    pdfUrl: `${DBE_BASE}_7CRVUkWGMA%3d&tabid=3294&portalid=0&mid=10990`,
    memoUrl: `${DBE_BASE}DFAi1wMTvCg%3d&tabid=3294&portalid=0&mid=10990`,
    topicsCovered: ['Chemistry', 'Organic Chemistry', 'Reactions'] },
  // 2021
  { id: 'science-12-2021-p1', grade: 12, subject: 'science', year: 2021, examType: 'NSC', paperNumber: 1, language: 'English',
    pdfUrl: `${DBE_BASE}unBWzCuezsM%3d&tabid=2922&portalid=0&mid=10142`,
    memoUrl: `${DBE_BASE}VCtYr0giXYw%3d&tabid=2922&portalid=0&mid=10142`,
    topicsCovered: ['Mechanics', 'Waves', 'Electricity', 'Magnetism'] },
  { id: 'science-12-2021-p2', grade: 12, subject: 'science', year: 2021, examType: 'NSC', paperNumber: 2, language: 'English',
    pdfUrl: `${DBE_BASE}oI4BAzXUMNA%3d&tabid=2922&portalid=0&mid=10142`,
    memoUrl: `${DBE_BASE}gmvfHOKfxws%3d&tabid=2922&portalid=0&mid=10142`,
    topicsCovered: ['Chemistry', 'Organic Chemistry', 'Reactions'] },
  // 2020
  { id: 'science-12-2020-p1', grade: 12, subject: 'science', year: 2020, examType: 'NSC', paperNumber: 1, language: 'English',
    pdfUrl: `${DBE_BASE}65cL9MczvtQ%3d&tabid=2702&portalid=0&mid=9639`,
    memoUrl: `${DBE_BASE}1MOdP9_gqm4%3d&tabid=2702&portalid=0&mid=9639`,
    topicsCovered: ['Mechanics', 'Waves', 'Electricity', 'Magnetism'] },
  { id: 'science-12-2020-p2', grade: 12, subject: 'science', year: 2020, examType: 'NSC', paperNumber: 2, language: 'English',
    pdfUrl: `${DBE_BASE}xUQ6Zo6wIpI%3d&tabid=2702&portalid=0&mid=9639`,
    memoUrl: `${DBE_BASE}l5Q6JxAbkZ0%3d&tabid=2702&portalid=0&mid=9639`,
    topicsCovered: ['Chemistry', 'Organic Chemistry', 'Reactions'] },

  // ============================================
  // GRADE 11 MATHEMATICS - Common Examination Papers
  // ============================================
  { id: 'maths-11-2018-p1', grade: 11, subject: 'maths', year: 2018, examType: 'Common', paperNumber: 1, language: 'English',
    pdfUrl: `${DBE_BASE}1KiiLnULnVY%3d&tabid=1869&portalid=0&mid=6584`,
    memoUrl: `${DBE_BASE}_uRPiTTn5y4%3d&tabid=1869&portalid=0&mid=6584`,
    topicsCovered: ['Algebra', 'Functions', 'Finance'] },
  { id: 'maths-11-2018-p2', grade: 11, subject: 'maths', year: 2018, examType: 'Common', paperNumber: 2, language: 'English',
    pdfUrl: `${DBE_BASE}4iD1QjMiShw%3d&tabid=1869&portalid=0&mid=6584`,
    memoUrl: `${DBE_BASE}AkQO3dMar_0%3d&tabid=1869&portalid=0&mid=6584`,
    topicsCovered: ['Trigonometry', 'Geometry', 'Statistics'] },

  // ============================================
  // GRADE 11 PHYSICAL SCIENCES - Common Examination Papers
  // ============================================
  { id: 'science-11-2018-p1', grade: 11, subject: 'science', year: 2018, examType: 'Common', paperNumber: 1, language: 'English',
    pdfUrl: `${DBE_BASE}_BnHGkPLTbs%3d&tabid=1869&portalid=0&mid=6588`,
    memoUrl: `${DBE_BASE}ip1nUg1Suw0%3d&tabid=1869&portalid=0&mid=6588`,
    topicsCovered: ['Mechanics', 'Waves', 'Electricity'] },
  { id: 'science-11-2018-p2', grade: 11, subject: 'science', year: 2018, examType: 'Common', paperNumber: 2, language: 'English',
    pdfUrl: `${DBE_BASE}oMu2OQls9CQ%3d&tabid=1869&portalid=0&mid=6588`,
    memoUrl: `${DBE_BASE}tl2K0ihMDrw%3d&tabid=1869&portalid=0&mid=6588`,
    topicsCovered: ['Chemistry', 'Reactions'] },

  // ============================================
  // GRADE 10 MATHEMATICS - Common Examination Papers
  // ============================================
  { id: 'maths-10-2018-p1', grade: 10, subject: 'maths', year: 2018, examType: 'Common', paperNumber: 1, language: 'English',
    pdfUrl: `${DBE_BASE}xB_6NSmf6m8%3d&tabid=1871&portalid=0&mid=6598`,
    memoUrl: null,
    topicsCovered: ['Algebra', 'Functions', 'Finance'] },
  { id: 'maths-10-2018-p2', grade: 10, subject: 'maths', year: 2018, examType: 'Common', paperNumber: 2, language: 'English',
    pdfUrl: `${DBE_BASE}RZ22JJ5tljc%3d&tabid=1871&portalid=0&mid=6598`,
    memoUrl: null,
    topicsCovered: ['Trigonometry', 'Geometry', 'Statistics'] },
  { id: 'maths-10-2017-p1', grade: 10, subject: 'maths', year: 2017, examType: 'Common', paperNumber: 1, language: 'English',
    pdfUrl: `${DBE_BASE}qtQcof03_Ek%3d&tabid=1871&portalid=0&mid=6598`,
    memoUrl: null,
    topicsCovered: ['Algebra', 'Functions', 'Finance'] },

  // ============================================
  // GRADE 10 PHYSICAL SCIENCES - Common Examination Papers
  // ============================================
  { id: 'science-10-2018-p1', grade: 10, subject: 'science', year: 2018, examType: 'Common', paperNumber: 1, language: 'English',
    pdfUrl: `${DBE_BASE}NbdCRLTzv7E%3d&tabid=1871&portalid=0&mid=6602`,
    memoUrl: null,
    topicsCovered: ['Mechanics', 'Waves'] },
  { id: 'science-10-2018-p2', grade: 10, subject: 'science', year: 2018, examType: 'Common', paperNumber: 2, language: 'English',
    pdfUrl: `${DBE_BASE}e-67gT6qA1I%3d&tabid=1871&portalid=0&mid=6602`,
    memoUrl: null,
    topicsCovered: ['Chemistry', 'Matter'] },
  { id: 'science-10-2017-p1', grade: 10, subject: 'science', year: 2017, examType: 'Common', paperNumber: 1, language: 'English',
    pdfUrl: `${DBE_BASE}JjwNryhHSd4%3d&tabid=1871&portalid=0&mid=6602`,
    memoUrl: null,
    topicsCovered: ['Mechanics', 'Waves'] },
]

export default function PapersPage() {
  const [subjectFilter, setSubjectFilter] = useState('')
  const [gradeFilter, setGradeFilter] = useState('')
  const [yearFilter, setYearFilter] = useState('')
  const [showFilters, setShowFilters] = useState(false)

  const filteredPapers = mockPapers.filter(paper => {
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
  const years = [...new Set(mockPapers.map(p => p.year))].sort((a, b) => b - a)

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
                <label className="block text-xs font-medium mb-1.5" style={{ color: 'var(--muted-custom)' }}>
                  Subject
                </label>
                <select
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
                <label className="block text-xs font-medium mb-1.5" style={{ color: 'var(--muted-custom)' }}>
                  Grade
                </label>
                <select
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
                <label className="block text-xs font-medium mb-1.5" style={{ color: 'var(--muted-custom)' }}>
                  Year
                </label>
                <select
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
            <p className="text-sm" style={{ color: 'var(--muted-custom)' }}>Try adjusting your filters</p>
          </div>
        )}
      </div>
    </div>
  )
}
