import { defineRouting } from 'next-intl/routing'

export const locales = ['en', 'af'] as const
export type Locale = (typeof locales)[number]

export const routing = defineRouting({
  locales,
  defaultLocale: 'en',
  // We use cookie-based locale detection, NOT URL prefixes
  localePrefix: 'never'
})

export const localeNames: Record<Locale, string> = {
  en: 'English',
  af: 'Afrikaans'
}

export const localeFlags: Record<Locale, string> = {
  en: '🇬🇧',
  af: '🇿🇦'
}
