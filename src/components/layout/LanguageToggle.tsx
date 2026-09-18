'use client'

import { useState, useRef, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Globe, Check } from 'lucide-react'
import { locales, localeNames, localeFlags, type Locale } from '@/i18n/routing'
import { setLocaleCookie } from '@/lib/locale'
import { useLocaleCookie } from '@/hooks/useLocaleCookie'

type LanguageToggleProps = {
  variant?: 'dropdown' | 'inline'
  showLabel?: boolean
}

export default function LanguageToggle({ variant = 'dropdown', showLabel = false }: LanguageToggleProps) {
  const currentLocale = useLocaleCookie()
  const [dropdownOpen, setDropdownOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)
  const router = useRouter()

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
        onClick={() => setDropdownOpen(!dropdownOpen)}
        className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-sm font-medium transition-colors hover:bg-white/5"
        style={{ color: 'var(--text)' }}
        aria-label="Change language"
      >
        <Globe className="w-4 h-4" style={{ color: 'var(--muted-custom)' }} />
        <span>{localeFlags[currentLocale]}</span>
        {showLabel && <span>{localeNames[currentLocale]}</span>}
      </button>

      {dropdownOpen && (
        <div
          className="absolute right-0 top-full mt-2 w-40 rounded-lg shadow-lg py-1 z-50"
          style={{ background: 'var(--surface2)', border: '1px solid var(--border-custom)' }}
        >
          {locales.map((locale) => (
            <button
              key={locale}
              onClick={() => handleLocaleChange(locale)}
              className="w-full flex items-center justify-between px-4 py-2 text-sm transition-colors hover:bg-white/5"
              style={{ color: 'var(--text)' }}
            >
              <span className="flex items-center gap-2">
                <span>{localeFlags[locale]}</span>
                <span>{localeNames[locale]}</span>
              </span>
              {currentLocale === locale && (
                <Check className="w-4 h-4" style={{ color: 'var(--teal)' }} />
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
