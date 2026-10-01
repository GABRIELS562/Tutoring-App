'use client'

import { useState, useMemo } from 'react'
import { Search, BookOpen, Beaker, ChevronDown, ChevronRight, Wifi } from 'lucide-react'
import Topbar from '@/components/layout/Topbar'
import { useTranslations } from 'next-intl'
import { BlockMath } from 'react-katex'
import 'katex/dist/katex.min.css'
import { formulas, type Formula } from '@/content/formulas'
import Link from 'next/link'

export default function FormulasPage() {
  const t = useTranslations('formulas')
  const [subjectFilter, setSubjectFilter] = useState<'maths' | 'science' | ''>('')
  const [gradeFilter, setGradeFilter] = useState<10 | 11 | 12 | ''>('')
  const [searchQuery, setSearchQuery] = useState('')
  const [expandedTopics, setExpandedTopics] = useState<Set<string>>(new Set(['Reduction Formulae', 'Trigonometric Identities']))

  // Filter formulas
  const filteredFormulas = useMemo(() => {
    return formulas.filter(f => {
      if (subjectFilter && f.subject !== subjectFilter) return false
      if (gradeFilter && f.grade !== gradeFilter) return false
      if (searchQuery) {
        const query = searchQuery.toLowerCase()
        return (
          f.name.toLowerCase().includes(query) ||
          f.topic.toLowerCase().includes(query) ||
          f.notes.toLowerCase().includes(query)
        )
      }
      return true
    })
  }, [subjectFilter, gradeFilter, searchQuery])

  // Group formulas by topic
  const groupedFormulas = useMemo(() => {
    const groups: Record<string, Formula[]> = {}
    for (const formula of filteredFormulas) {
      if (!groups[formula.topic]) {
        groups[formula.topic] = []
      }
      groups[formula.topic].push(formula)
    }
    return groups
  }, [filteredFormulas])

  const toggleTopic = (topic: string) => {
    setExpandedTopics(prev => {
      const next = new Set(prev)
      if (next.has(topic)) {
        next.delete(topic)
      } else {
        next.add(topic)
      }
      return next
    })
  }

  const expandAll = () => {
    setExpandedTopics(new Set(Object.keys(groupedFormulas)))
  }

  const collapseAll = () => {
    setExpandedTopics(new Set())
  }

  return (
    <div className="min-h-screen" style={{ background: 'var(--bg)' }}>
      <Topbar title={t('title')} subtitle={t('pageSubtitle')} />

      <div className="p-4 md:p-6 max-w-4xl mx-auto">
        {/* Offline Badge */}
        <div
          className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium mb-4"
          style={{ background: 'rgba(42, 157, 143, 0.15)', color: 'var(--teal)' }}
        >
          <Wifi className="w-3 h-3" />
          {t('worksOffline')}
        </div>

        {/* Filters */}
        <div
          className="rounded-xl p-4 mb-6"
          style={{ background: 'var(--surface)', border: '1px solid var(--border-custom)' }}
        >
          {/* Search */}
          <div className="relative mb-4">
            <Search
              className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4"
              style={{ color: 'var(--muted-custom)' }}
            />
            <input
              type="text"
              placeholder={t('searchPlaceholder')}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-lg text-sm"
              style={{
                background: 'var(--surface2)',
                color: 'var(--text)',
                border: '1px solid var(--border-custom)',
              }}
            />
          </div>

          {/* Subject & Grade Filters */}
          <div className="flex flex-wrap gap-3">
            {/* Subject Tabs */}
            <div className="flex gap-1 p-1 rounded-lg" style={{ background: 'var(--surface2)' }}>
              <button
                onClick={() => setSubjectFilter('')}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium transition-all"
                style={{
                  background: subjectFilter === '' ? 'var(--accent-red)' : 'transparent',
                  color: subjectFilter === '' ? 'white' : 'var(--muted-custom)',
                }}
              >
                {t('all')}
              </button>
              <button
                onClick={() => setSubjectFilter('maths')}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium transition-all"
                style={{
                  background: subjectFilter === 'maths' ? 'var(--accent-red)' : 'transparent',
                  color: subjectFilter === 'maths' ? 'white' : 'var(--muted-custom)',
                }}
              >
                <BookOpen className="w-3.5 h-3.5" />
                {t('mathematics')}
              </button>
              <button
                onClick={() => setSubjectFilter('science')}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium transition-all"
                style={{
                  background: subjectFilter === 'science' ? 'var(--accent-red)' : 'transparent',
                  color: subjectFilter === 'science' ? 'white' : 'var(--muted-custom)',
                }}
              >
                <Beaker className="w-3.5 h-3.5" />
                {t('physicalScience')}
              </button>
            </div>

            {/* Grade Filter */}
            <div className="flex gap-1 p-1 rounded-lg" style={{ background: 'var(--surface2)' }}>
              {['', 10, 11, 12].map((grade) => (
                <button
                  key={grade}
                  onClick={() => setGradeFilter(grade as 10 | 11 | 12 | '')}
                  className="px-3 py-1.5 rounded-md text-sm font-medium transition-all"
                  style={{
                    background: gradeFilter === grade ? 'var(--teal)' : 'transparent',
                    color: gradeFilter === grade ? 'white' : 'var(--muted-custom)',
                  }}
                >
                  {grade === '' ? t('all') : t('grAbbrev', { grade })}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Expand/Collapse Controls */}
        <div className="flex items-center justify-between mb-4">
          <p className="text-sm" style={{ color: 'var(--muted-custom)' }}>
            {t('formulaCount', { count: filteredFormulas.length })}
          </p>
          <div className="flex gap-2">
            <button
              onClick={expandAll}
              className="text-xs px-2 py-1 rounded"
              style={{ color: 'var(--teal)' }}
            >
              {t('expandAll')}
            </button>
            <button
              onClick={collapseAll}
              className="text-xs px-2 py-1 rounded"
              style={{ color: 'var(--muted-custom)' }}
            >
              {t('collapseAll')}
            </button>
          </div>
        </div>

        {/* Formula Groups */}
        <div className="space-y-4">
          {Object.entries(groupedFormulas).map(([topic, topicFormulas]) => (
            <div
              key={topic}
              className="rounded-xl overflow-hidden"
              style={{ background: 'var(--surface)', border: '1px solid var(--border-custom)' }}
            >
              {/* Topic Header */}
              <button
                onClick={() => toggleTopic(topic)}
                className="w-full flex items-center justify-between p-4 text-left transition-colors hover:bg-white/5"
              >
                <div className="flex items-center gap-3">
                  {expandedTopics.has(topic) ? (
                    <ChevronDown className="w-4 h-4" style={{ color: 'var(--muted-custom)' }} />
                  ) : (
                    <ChevronRight className="w-4 h-4" style={{ color: 'var(--muted-custom)' }} />
                  )}
                  <h3 className="font-semibold" style={{ color: 'var(--text)' }}>
                    {topic}
                  </h3>
                </div>
                <span
                  className="px-2 py-0.5 rounded text-xs"
                  style={{ background: 'var(--surface2)', color: 'var(--muted-custom)' }}
                >
                  {topicFormulas.length}
                </span>
              </button>

              {/* Formulas */}
              {expandedTopics.has(topic) && (
                <div
                  className="px-4 pb-4 space-y-3"
                  style={{ borderTop: '1px solid var(--border-custom)' }}
                >
                  {topicFormulas.map((formula) => (
                    <div
                      key={formula.id}
                      className="p-4 rounded-lg"
                      style={{ background: 'var(--surface2)' }}
                    >
                      {/* Formula Name & Grade */}
                      <div className="flex items-start justify-between mb-2">
                        <h4 className="font-medium text-sm" style={{ color: 'var(--text)' }}>
                          {formula.name}
                        </h4>
                        <span
                          className="px-2 py-0.5 rounded text-xs shrink-0 ml-2"
                          style={{
                            background: formula.subject === 'maths'
                              ? 'rgba(230, 57, 70, 0.15)'
                              : 'rgba(42, 157, 143, 0.15)',
                            color: formula.subject === 'maths' ? 'var(--accent-red)' : 'var(--teal)',
                          }}
                        >
                          {t('grAbbrev', { grade: formula.grade })}
                        </span>
                      </div>

                      {/* Formula (KaTeX) */}
                      <div
                        className="py-3 px-4 rounded-lg mb-2 overflow-x-auto"
                        style={{ background: 'var(--bg)' }}
                      >
                        <BlockMath math={formula.formula} />
                      </div>

                      {/* Notes & Link */}
                      <div className="flex items-center justify-between">
                        <p className="text-xs" style={{ color: 'var(--muted-custom)' }}>
                          {formula.notes}
                        </p>
                        <Link
                          href={`/topics/${formula.topicSlug}/practice`}
                          className="text-xs font-medium shrink-0 ml-2"
                          style={{ color: 'var(--accent-red-text)' }}
                        >
                          {t('practiceArrow')}
                        </Link>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Empty State */}
        {Object.keys(groupedFormulas).length === 0 && (
          <div
            className="text-center py-12 rounded-xl"
            style={{ background: 'var(--surface)', border: '1px solid var(--border-custom)' }}
          >
            <Search
              className="w-12 h-12 mx-auto mb-3 opacity-50"
              style={{ color: 'var(--muted-custom)' }}
            />
            <p className="font-medium mb-1" style={{ color: 'var(--text)' }}>
              {t('noFormulasFound')}
            </p>
            <p className="text-sm" style={{ color: 'var(--muted-custom)' }}>
              {t('tryAdjustingSearch')}
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
