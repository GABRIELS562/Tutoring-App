'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import Topbar from '@/components/layout/Topbar'
import NoteBlock from '@/components/notes/NoteBlock'
import { useTranslations } from 'next-intl'
import { ChevronDown, BookOpen, FileText, Star, ArrowRight, Download, Check, Loader2, WifiOff, AlertCircle } from 'lucide-react'
import type { TopicContent } from '@/types'
import { useUser } from '@/context/UserContext'
import { isTopicDownloaded, getDownloadedTopicCount, storeTopic } from '@/lib/offlineStorage'
import { useOnlineStatus } from '@/hooks/useOnlineStatus'

const FREE_TIER_OFFLINE_LIMIT = 2

type TopicPageClientProps = {
  slug: string
  content: TopicContent
}

export default function TopicPageClient({ slug, content }: TopicPageClientProps) {
  const t = useTranslations('topicPage')
  const tTopics = useTranslations('topics')
  const tSubjects = useTranslations('subjects')
  const [tocOpen, setTocOpen] = useState(false)
  const [activeSection, setActiveSection] = useState<string | null>(null)
  const [downloadState, setDownloadState] = useState<'idle' | 'downloading' | 'downloaded' | 'error' | 'limit_reached'>('idle')
  const [downloadProgress, setDownloadProgress] = useState('')
  const isOnline = useOnlineStatus()
  const { user } = useUser()
  const isPremium = user?.isPremium ?? false

  // Check if topic is already cached (IndexedDB + Cache API)
  useEffect(() => {
    const checkCached = async () => {
      try {
        const isDownloaded = await isTopicDownloaded(slug)
        if (isDownloaded) {
          setDownloadState('downloaded')
        }
      } catch (error) {
        console.error('Error checking offline status:', error)
      }
    }
    checkCached()
  }, [slug])

  const handleSectionClick = (sectionId: string) => {
    setActiveSection(sectionId)
    setTocOpen(false)
    const element = document.getElementById(sectionId)
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }
  }

  const handleDownloadForOffline = async () => {
    if (!('caches' in window) || !('indexedDB' in window)) {
      alert('Your browser does not support offline caching')
      return
    }

    // Check free tier limit
    if (!isPremium) {
      const downloadedCount = await getDownloadedTopicCount()
      const alreadyDownloaded = await isTopicDownloaded(slug)

      if (!alreadyDownloaded && downloadedCount >= FREE_TIER_OFFLINE_LIMIT) {
        setDownloadState('limit_reached')
        return
      }
    }

    setDownloadState('downloading')
    setDownloadProgress(t('saving'))

    try {
      // Cache the notes and practice pages with the Cache API so they're
      // readable offline. This mirrors what the service worker's CacheFirst
      // runtime caching already does for topic pages on a normal visit -
      // this button just guarantees it's cached now, on demand, and records
      // the topic as "saved" (see storeTopic below) so we can enforce the
      // free-tier limit and show "Saved for offline" in the UI.
      //
      // Deliberately does NOT fetch/store questions or audio in IndexedDB:
      // nothing in the app reads them back yet (offline quiz/audio playback
      // is a future phase - see src/lib/offlineStorage.ts), so writing them
      // here was dead weight that made the button's label a lie.
      const cache = await caches.open('angelo-offline-topics')
      const pageResponse = await fetch(`/topics/${slug}`)
      await cache.put(`/topics/${slug}`, pageResponse.clone())

      const practiceResponse = await fetch(`/topics/${slug}/practice`)
      await cache.put(`/topics/${slug}/practice`, practiceResponse.clone())

      await storeTopic({
        slug,
        title: content.title,
        downloadedAt: new Date().toISOString(),
        questionCount: 0,
        audioCount: 0,
      })

      setDownloadProgress('')
      setDownloadState('downloaded')
    } catch (error) {
      console.error('Failed to cache topic:', error)
      setDownloadState('error')
      setDownloadProgress('')
      setTimeout(() => setDownloadState('idle'), 3000)
    }
  }

  return (
    <div>
      <Topbar
        title={content.title}
        subtitle={`${tTopics('grade')} ${content.grade} • ${content.subject === 'maths' ? tSubjects('mathematics') : tSubjects('physicalScience')}${content.paper ? ` ${t('paperWord')} ${content.paper}` : ''}`}
      />

      <div className="flex">
        {/* Desktop Table of Contents - Left Sidebar */}
        <aside
          className="hidden lg:block w-[240px] flex-shrink-0 h-[calc(100vh-52px)] sticky top-[52px] overflow-y-auto p-4"
          style={{ background: 'var(--surface)', borderRight: '1px solid var(--border-custom)' }}
        >
          <h3
            className="text-xs font-semibold uppercase tracking-wider mb-4"
            style={{ color: 'var(--muted-custom)' }}
          >
            {t('contents')}
          </h3>
          <nav className="space-y-1">
            {content.sections.map((section) => (
              <button
                key={section.id}
                onClick={() => handleSectionClick(section.id)}
                className="w-full text-left px-3 py-2 rounded-lg text-sm transition-all hover:bg-white/5"
                style={{
                  color: activeSection === section.id ? 'var(--accent-red)' : 'var(--text)',
                  background: activeSection === section.id ? 'rgba(230, 57, 70, 0.1)' : 'transparent',
                }}
              >
                {section.title}
              </button>
            ))}
          </nav>

          {/* Save Notes for Offline Button */}
          <div className="mt-6 pt-4" style={{ borderTop: '1px solid var(--border-custom)' }}>
            <button
              onClick={handleDownloadForOffline}
              disabled={downloadState === 'downloading' || downloadState === 'downloaded' || downloadState === 'limit_reached'}
              className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all"
              style={{
                background: downloadState === 'downloaded'
                  ? 'rgba(42, 157, 143, 0.15)'
                  : downloadState === 'limit_reached'
                  ? 'rgba(244, 162, 97, 0.15)'
                  : 'var(--surface2)',
                color: downloadState === 'downloaded'
                  ? 'var(--teal)'
                  : downloadState === 'error'
                  ? 'var(--accent-red)'
                  : downloadState === 'limit_reached'
                  ? 'var(--gold)'
                  : 'var(--text)',
                border: `1px solid ${
                  downloadState === 'downloaded' ? 'var(--teal)' :
                  downloadState === 'limit_reached' ? 'var(--gold)' :
                  'var(--border-custom)'
                }`,
              }}
            >
              {downloadState === 'downloading' && (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  {downloadProgress || t('saving')}
                </>
              )}
              {downloadState === 'downloaded' && (
                <>
                  <Check className="w-4 h-4" />
                  {t('savedForOffline')}
                </>
              )}
              {downloadState === 'idle' && (
                <>
                  <Download className="w-4 h-4" />
                  {t('saveNotesForOffline')}
                </>
              )}
              {downloadState === 'error' && (
                <>
                  <WifiOff className="w-4 h-4" />
                  {t('saveFailed')}
                </>
              )}
              {downloadState === 'limit_reached' && (
                <>
                  <AlertCircle className="w-4 h-4" />
                  {t('freeLimitReached', { limit: FREE_TIER_OFFLINE_LIMIT })}
                </>
              )}
            </button>
            <p className="mt-2 text-xs" style={{ color: 'var(--muted-custom)' }}>
              {t('offlineDescription')}
            </p>

            {/* Offline indicator */}
            {!isOnline && (
              <div
                className="mt-3 flex items-center gap-2 px-3 py-2 rounded-lg text-xs"
                style={{ background: 'rgba(244, 162, 97, 0.15)', color: 'var(--gold)' }}
              >
                <WifiOff className="w-3 h-3" />
                {t('youAreOffline')}
              </div>
            )}
          </div>
        </aside>

        {/* Mobile TOC Dropdown */}
        <div
          className="lg:hidden sticky top-0 z-40 w-full p-3"
          style={{ background: 'var(--surface)', borderBottom: '1px solid var(--border-custom)' }}
        >
          <button
            onClick={() => setTocOpen(!tocOpen)}
            className="w-full flex items-center justify-between px-4 py-2 rounded-lg text-sm font-medium"
            style={{ background: 'var(--surface2)', color: 'var(--text)' }}
          >
            <span>{t('jumpToSection')}</span>
            <ChevronDown
              className="w-4 h-4 transition-transform"
              style={{ transform: tocOpen ? 'rotate(180deg)' : 'rotate(0)' }}
            />
          </button>
          {tocOpen && (
            <div
              className="absolute left-3 right-3 mt-2 rounded-lg shadow-lg py-2 z-50"
              style={{ background: 'var(--surface2)', border: '1px solid var(--border-custom)' }}
            >
              {content.sections.map((section) => (
                <button
                  key={section.id}
                  onClick={() => handleSectionClick(section.id)}
                  className="w-full text-left px-4 py-2 text-sm transition-all hover:bg-white/5"
                  style={{ color: 'var(--text)' }}
                >
                  {section.title}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Main Content Area */}
        <main className="flex-1 min-w-0 p-4 md:p-6 lg:p-8">
          <div className="max-w-3xl">
            {/* Topic Header */}
            <div className="mb-8">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h1
                    className="text-2xl md:text-3xl font-bold mb-2"
                    style={{ color: 'var(--text)' }}
                  >
                    {content.title}
                  </h1>
                  <p style={{ color: 'var(--muted-custom)' }}>
                    {tTopics('grade')} {content.grade} {content.subject === 'maths' ? tSubjects('mathematics') : tSubjects('physicalScience')}
                    {content.paper && ` • ${t('paperWord')} ${content.paper}`}
                  </p>
                </div>

                {/* Mobile Download Button */}
                <button
                  onClick={handleDownloadForOffline}
                  disabled={downloadState === 'downloading' || downloadState === 'downloaded'}
                  className="lg:hidden flex-shrink-0 p-2 rounded-lg"
                  style={{
                    background: downloadState === 'downloaded'
                      ? 'rgba(42, 157, 143, 0.15)'
                      : 'var(--surface)',
                    border: `1px solid ${downloadState === 'downloaded' ? 'var(--teal)' : 'var(--border-custom)'}`,
                  }}
                >
                  {downloadState === 'downloading' && (
                    <Loader2 className="w-5 h-5 animate-spin" style={{ color: 'var(--text)' }} />
                  )}
                  {downloadState === 'downloaded' && (
                    <Check className="w-5 h-5" style={{ color: 'var(--teal)' }} />
                  )}
                  {(downloadState === 'idle' || downloadState === 'error') && (
                    <Download className="w-5 h-5" style={{ color: 'var(--text)' }} />
                  )}
                </button>
              </div>
            </div>

            {/* Sections */}
            {content.sections.map((section) => (
              <section key={section.id} id={section.id} className="mb-12 scroll-mt-20">
                <h2
                  className="text-xl font-bold mb-4 pb-2"
                  style={{ color: 'var(--text)', borderBottom: '1px solid var(--border-custom)' }}
                >
                  {section.title}
                </h2>
                {section.blocks.map((block, blockIndex) => (
                  <NoteBlock
                    key={blockIndex}
                    block={block}
                    topicSlug={slug}
                    sectionId={section.id}
                  />
                ))}
              </section>
            ))}

            {/* Practice Button */}
            <div className="mt-12 pt-8" style={{ borderTop: '1px solid var(--border-custom)' }}>
              <Link
                href={`/topics/${slug}/practice`}
                className="inline-flex items-center gap-3 px-6 py-3 rounded-lg font-semibold text-white transition-all hover:opacity-90"
                style={{ background: 'var(--accent-red)' }}
              >
                {t('practiceThisTopic')}
                <ArrowRight className="w-5 h-5" />
              </Link>
            </div>
          </div>
        </main>

        {/* Desktop Metadata Card - Right Sidebar */}
        <aside
          className="hidden xl:block w-[200px] flex-shrink-0 p-4"
        >
          <div
            className="sticky top-[68px] rounded-lg p-4"
            style={{ background: 'var(--surface)', border: '1px solid var(--border-custom)' }}
          >
            <h3
              className="text-xs font-semibold uppercase tracking-wider mb-4"
              style={{ color: 'var(--muted-custom)' }}
            >
              {t('topicInfo')}
            </h3>

            {/* Grade Badge */}
            <div className="flex items-center gap-2 mb-3">
              <BookOpen className="w-4 h-4" style={{ color: 'var(--muted-custom)' }} />
              <span
                className="px-2 py-0.5 rounded text-xs font-medium text-white"
                style={{ background: 'var(--accent-red)' }}
              >
                {tTopics('grade')} {content.grade}
              </span>
            </div>

            {/* Paper Badge */}
            {content.paper && (
              <div className="flex items-center gap-2 mb-3">
                <FileText className="w-4 h-4" style={{ color: 'var(--muted-custom)' }} />
                <span
                  className="px-2 py-0.5 rounded text-xs font-medium"
                  style={{ background: 'var(--surface2)', color: 'var(--text)' }}
                >
                  {t('paperWord')} {content.paper}
                </span>
              </div>
            )}

            {/* CAPS Weight */}
            <div className="flex items-center gap-2 mb-4">
              <Star className="w-4 h-4" style={{ color: 'var(--gold)' }} />
              <span className="text-sm" style={{ color: 'var(--text)' }}>
                {t('percentOfPaper', { percent: content.capsWeight })}
              </span>
            </div>

            {/* Exam Frequency */}
            <div
              className="p-3 rounded-lg text-xs"
              style={{ background: 'rgba(244, 162, 97, 0.1)', border: '1px solid var(--gold)' }}
            >
              <p className="font-semibold mb-1" style={{ color: 'var(--gold)' }}>
                {t('highPriority')}
              </p>
              <p style={{ color: 'var(--text)' }}>
                {t('highPriorityDesc')}
              </p>
            </div>

            {/* Quick Stats */}
            <div className="mt-4 pt-4" style={{ borderTop: '1px solid var(--border-custom)' }}>
              <p className="text-xs mb-2" style={{ color: 'var(--muted-custom)' }}>
                {content.sections.length === 1 ? t('sectionsCountOne') : t('sectionsCountOther', { count: content.sections.length })}
              </p>
              <p className="text-xs" style={{ color: 'var(--muted-custom)' }}>
                {(() => {
                  const blockCount = content.sections.reduce((acc, section) => acc + section.blocks.length, 0)
                  return blockCount === 1 ? t('contentBlocksCountOne') : t('contentBlocksCountOther', { count: blockCount })
                })()}
              </p>
            </div>
          </div>
        </aside>
      </div>
    </div>
  )
}
