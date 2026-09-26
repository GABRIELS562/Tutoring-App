import Link from 'next/link'
import { getTranslations } from 'next-intl/server'
import Topbar from '@/components/layout/Topbar'

/**
 * Shown when a topic slug is not in the content registry.
 *
 * This replaces a hand-rolled block inside page.tsx whose strings were
 * hardcoded English, so an Afrikaans student who mistyped a URL - or
 * followed a stale link - got the one screen in the app that was not in
 * their language.
 */
export default async function TopicNotFound() {
  const t = await getTranslations('topicPage')

  return (
    <div className="min-h-screen" style={{ background: 'var(--bg)' }}>
      <Topbar title={t('notFoundTitle')} />

      <div className="max-w-xl mx-auto px-4 py-10">
        <h1 className="text-xl font-bold mb-2" style={{ color: 'var(--text)' }}>
          {t('notFoundTitle')}
        </h1>
        <p className="text-sm mb-6" style={{ color: 'var(--muted-custom)' }}>
          {t('notFoundBody')}
        </p>
        <Link
          href="/subjects"
          className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold"
          style={{ background: 'var(--accent-red)', color: 'white' }}
        >
          {t('backToSubjects')}
        </Link>
      </div>
    </div>
  )
}
