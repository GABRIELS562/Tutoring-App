'use client'

import { useSyncExternalStore } from 'react'

function subscribe(callback: () => void): () => void {
  window.addEventListener('online', callback)
  window.addEventListener('offline', callback)
  return () => {
    window.removeEventListener('online', callback)
    window.removeEventListener('offline', callback)
  }
}

function getSnapshot(): boolean {
  return navigator.onLine
}

function getServerSnapshot(): boolean {
  // Assume online during SSR / initial hydration so the markup matches
  // the server-rendered output; the real value is picked up right after mount.
  return true
}

/**
 * SSR-safe browser online/offline status.
 *
 * Replaces the `useState(true) + useEffect(() => setIsOnline(navigator.onLine))`
 * pattern (flagged by react-hooks/set-state-in-effect) with useSyncExternalStore,
 * which is the React-recommended way to read a mutable external value without
 * triggering a hydration mismatch.
 */
export function useOnlineStatus(): boolean {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot)
}
