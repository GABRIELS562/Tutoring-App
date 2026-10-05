import { getTranslations } from 'next-intl/server'

/**
 * Says, on every page, that this deployment keeps nothing.
 *
 * A demo deployment (NEXT_PUBLIC_DEMO_DEPLOYMENT, see src/lib/env.ts) runs
 * a real production build with no database. The app looks and behaves
 * exactly like the real thing: XP goes up, hearts go down, quizzes mark
 * themselves. None of it is written anywhere, and a reload puts it all
 * back. Without a visible note, the first thing anyone concludes after
 * losing a session's work is that the app has a data-loss bug.
 *
 * It renders only on a demo deployment - not in local development, where
 * the same demo mode is simply how the app runs and the banner would be
 * noise.
 */
export default async function DemoBanner() {
  if (process.env.NEXT_PUBLIC_DEMO_DEPLOYMENT !== 'true') {
    return null
  }

  const t = await getTranslations('demoBanner')

  return (
    // role="status" rather than "alert": a screen reader should hear this
    // when it reaches it, not have the page announcement interrupted by it.
    <div
      role="status"
      className="px-4 py-2 text-center text-xs font-medium"
      style={{
        background: 'var(--accent-red-glow)',
        color: 'var(--text)',
        borderBottom: '1px solid var(--border)',
      }}
    >
      <strong className="font-semibold">{t('label')}</strong>
      {/* The separator lives here, not in the copy: without it the bold
          label runs straight into the sentence ("Demo Explore everything
          freely..."), and every translation would have to remember it. */}
      <span aria-hidden="true" style={{ color: 'var(--text-muted)' }}>
        {' · '}
      </span>
      <span style={{ color: 'var(--text-muted)' }}>{t('message')}</span>
    </div>
  )
}
