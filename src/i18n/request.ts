import { getRequestConfig } from 'next-intl/server'
import { cookies } from 'next/headers'
import { locales, type Locale } from './routing'

export default getRequestConfig(async () => {
  // Read locale from cookie (set by LanguageToggle)
  const cookieStore = await cookies()
  const localeCookie = cookieStore.get('NEXT_LOCALE')?.value

  // Validate and fallback to 'en'
  const locale: Locale = locales.includes(localeCookie as Locale)
    ? (localeCookie as Locale)
    : 'en'

  return {
    locale,
    messages: (await import(`../messages/${locale}.json`)).default
  }
})
