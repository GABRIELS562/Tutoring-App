import { type Locale, locales } from '@/i18n/routing'

const LOCALE_COOKIE_NAME = 'NEXT_LOCALE'
const LOCALE_COOKIE_MAX_AGE = 365 * 24 * 60 * 60 // 1 year in seconds

// The NEXT_LOCALE cookie has no native browser change event, so components
// reading it via useSyncExternalStore (see src/hooks/useLocaleCookie.ts)
// need an explicit notify when it's written from within the app itself.
type LocaleChangeListener = () => void
const localeChangeListeners = new Set<LocaleChangeListener>()

export function subscribeToLocaleCookie(listener: LocaleChangeListener): () => void {
  localeChangeListeners.add(listener)
  return () => {
    localeChangeListeners.delete(listener)
  }
}

/**
 * Get the current locale from cookie (client-side)
 */
export function getLocaleFromCookie(): Locale {
  if (typeof document === 'undefined') return 'en'

  const match = document.cookie.match(new RegExp(`${LOCALE_COOKIE_NAME}=([^;]+)`))
  const value = match?.[1]

  return locales.includes(value as Locale) ? (value as Locale) : 'en'
}

/**
 * Set the locale cookie (client-side)
 */
export function setLocaleCookie(locale: Locale): void {
  if (typeof document === 'undefined') return

  document.cookie = `${LOCALE_COOKIE_NAME}=${locale}; path=/; max-age=${LOCALE_COOKIE_MAX_AGE}; SameSite=Lax`
  localeChangeListeners.forEach((listener) => listener())
}

/**
 * Detect preferred locale from browser settings
 */
export function detectBrowserLocale(): Locale {
  if (typeof navigator === 'undefined') return 'en'

  const browserLang = navigator.language.toLowerCase()

  // Check for Afrikaans
  if (browserLang.startsWith('af')) return 'af'

  // Default to English
  return 'en'
}

/**
 * Initialize locale on first visit (checks browser preference)
 */
export function initializeLocale(): Locale {
  const existingLocale = getLocaleFromCookie()

  // If cookie already exists, use it
  if (document.cookie.includes(LOCALE_COOKIE_NAME)) {
    return existingLocale
  }

  // First visit: detect from browser
  const detectedLocale = detectBrowserLocale()
  setLocaleCookie(detectedLocale)

  return detectedLocale
}
