'use client'

import { useState, useRef, useEffect, useId } from 'react'
import { useRouter } from 'next/navigation'
import { Globe, Check } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { locales, localeNames, localeFlags, type Locale } from '@/i18n/routing'
import { setLocaleCookie } from '@/lib/locale'
import { useLocaleCookie } from '@/hooks/useLocaleCookie'

type LanguageToggleProps = {
  variant?: 'dropdown' | 'inline'
  showLabel?: boolean
}

export default function LanguageToggle({ variant = 'dropdown', showLabel = false }: LanguageToggleProps) {
  const t = useTranslations('language')
  const currentLocale = useLocaleCookie()
  const [dropdownOpen, setDropdownOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)
  const triggerRef = useRef<HTMLButtonElement>(null)
  const panelId = useId()
  const router = useRouter()

  // The accessible name must announce the language a click will switch TO,
  // not just "change language" - with exactly two locales, that's simply
  // the other one.
  const targetLocale = locales.find((locale) => locale !== currentLocale) ?? locales[0]
  const switchToLabel = t('switchTo', { language: localeNames[targetLocale] })

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setDropdownOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  // Escape closes the menu and returns focus to the trigger - without
  // this, a keyboard user who opens the menu and backs out with Escape
  // (the standard way to dismiss any menu/dialog) loses their place on
  // the page entirely, since nothing else moves focus for them.
  useEffect(() => {
    if (!dropdownOpen) return

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setDropdownOpen(false)
        triggerRef.current?.focus()
      }
    }
    document.addEventListener('keydown', handleEscape)
    return () => document.removeEventListener('keydown', handleEscape)
  }, [dropdownOpen])

  const handleLocaleChange = (locale: Locale) => {
    setLocaleCookie(locale) // notifies useLocaleCookie subscribers immediately
    setDropdownOpen(false)
    // Refresh to reload server-rendered content with the new locale
    router.refresh()
  }

  if (variant === 'inline') {
    return (
      <div className="flex items-center gap-2">
        {locales.map((locale) => (
          <button
            key={locale}
            onClick={() => handleLocaleChange(locale)}
            aria-pressed={currentLocale === locale}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
              currentLocale === locale
                ? 'bg-white/10'
                : 'hover:bg-white/5'
            }`}
            style={{
              color: currentLocale === locale ? 'var(--teal)' : 'var(--text)',
              border: currentLocale === locale ? '1px solid var(--teal)' : '1px solid transparent'
            }}
          >
            <span>{localeFlags[locale]}</span>
            <span>{localeNames[locale]}</span>
          </button>
        ))}
      </div>
    )
  }

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        ref={triggerRef}
        onClick={() => setDropdownOpen(!dropdownOpen)}
        className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-sm font-medium transition-colors hover:bg-white/5"
        style={{ color: 'var(--text)' }}
        aria-label={switchToLabel}
        aria-expanded={dropdownOpen}
        aria-controls={panelId}
      >
        <Globe className="w-4 h-4" style={{ color: 'var(--muted-custom)' }} />
        <span>{localeFlags[currentLocale]}</span>
        {showLabel && <span>{localeNames[currentLocale]}</span>}
      </button>

      {dropdownOpen && (
        <div
          id={panelId}
          className="absolute right-0 top-full mt-2 w-40 rounded-lg shadow-lg py-1 z-50"
          style={{ background: 'var(--surface2)', border: '1px solid var(--border-custom)' }}
        >
          {/* aria-pressed rather than role="menuitemradio": the selected
              language was conveyed by the tick alone, and claiming menu
              semantics would promise arrow-key navigation this does not
              implement. */}
          {locales.map((locale) => (
            <button
              key={locale}
              onClick={() => handleLocaleChange(locale)}
              aria-pressed={currentLocale === locale}
              className="w-full flex items-center justify-between px-4 py-2 text-sm transition-colors hover:bg-white/5"
              style={{ color: 'var(--text)' }}
            >
              <span className="flex items-center gap-2">
                <span>{localeFlags[locale]}</span>
                <span>{localeNames[locale]}</span>
              </span>
              {currentLocale === locale && (
                <Check className="w-4 h-4" aria-hidden="true" style={{ color: 'var(--teal)' }} />
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
