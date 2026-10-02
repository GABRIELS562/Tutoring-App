'use client'

import { useEffect } from 'react'

/**
 * Registers the service worker next-pwa generates.
 *
 * next-pwa is configured with `register: true`, which is supposed to inject
 * a registration script - but it does that for the Pages Router only. Under
 * the App Router it writes public/sw.js and then nothing ever calls
 * navigator.serviceWorker.register(), so the file shipped as dead weight
 * and the whole PWA was inert: no offline support, and the formula sheet's
 * "works offline" badge was a promise the app could not keep.
 *
 * Deliberately minimal, and deliberately not failing loudly: a browser that
 * refuses the registration (private window, unsupported, blocked) should
 * lose offline support and nothing else.
 */
export default function ServiceWorkerRegistration() {
  useEffect(() => {
    // next-pwa does not emit sw.js in development, so registering there
    // would 404 and leave a broken registration behind.
    if (process.env.NODE_ENV !== 'production') return
    if (!('serviceWorker' in navigator)) return

    const register = () => {
      navigator.serviceWorker.register('/sw.js').catch((error) => {
        console.warn('Service worker registration failed:', error)
      })
    }

    // After load, so fetching and parsing the worker never competes with
    // the page's own first render.
    if (document.readyState === 'complete') {
      register()
      return
    }
    window.addEventListener('load', register)
    return () => window.removeEventListener('load', register)
  }, [])

  return null
}
