'use client'

import { useTranslations } from 'next-intl'

/**
 * Accessible skip-to-content link (WCAG 2.4.1 Bypass Blocks).
 *
 * A plain `<a href="#main-content">` relies on the browser to move focus
 * to the fragment target when activated - some browsers (notably older
 * Safari) never do that even when the target has `tabIndex={-1}`, which
 * leaves a sighted keyboard user's focus stranded on the link itself
 * with no visible indication anything happened. Handling the click (and,
 * via the browser's own Enter-on-link behaviour, the keyboard case too)
 * explicitly and calling `.focus()` ourselves makes the behaviour
 * deterministic everywhere, not just where the browser's default handles
 * it. `preventDefault` still lets `href` provide a no-JS fallback and
 * correct link semantics/URL update; we're only replacing the focus
 * step, not the navigation.
 */
export default function SkipLink() {
  const t = useTranslations('common')

  const handleActivate = (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault()
    const target = document.getElementById('main-content')
    target?.focus()
  }

  return (
    <a
      href="#main-content"
      onClick={handleActivate}
      className="sr-only focus:not-sr-only focus:fixed focus:top-2 focus:left-2 focus:z-[100] focus:rounded-lg focus:px-4 focus:py-2 focus:font-semibold focus:text-white"
      style={{ background: 'var(--accent-red)' }}
    >
      {t('skipToContent')}
    </a>
  )
}
