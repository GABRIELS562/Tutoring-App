'use client'

import { useSyncExternalStore } from 'react'
import { getLocaleFromCookie, subscribeToLocaleCookie } from '@/lib/locale'
import type { Locale } from '@/i18n/routing'

function getServerSnapshot(): Locale {
  return 'en'
}

/**
 * SSR-safe read of the NEXT_LOCALE cookie.
 *
 * Replaces the `useState('en') + useEffect(() => setLocale(getLocaleFromCookie()))`
 * pattern (flagged by react-hooks/set-state-in-effect) with useSyncExternalStore:
 * renders 'en' during SSR/initial hydration (matching the server output), then
 * switches to the real cookie value on the client with no hydration warning.
 * Also re-reads instantly when `setLocaleCookie` is called elsewhere in the app.
 */
export function useLocaleCookie(): Locale {
  return useSyncExternalStore(subscribeToLocaleCookie, getLocaleFromCookie, getServerSnapshot)
}
