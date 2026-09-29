'use client'

import { useSyncExternalStore } from 'react'

/** Nothing ever changes, so the subscription is a no-op. */
const subscribe = () => () => {}
const onClient = () => true
const onServer = () => false

/**
 * False on the server and on the first client render, true afterwards.
 *
 * For anything whose value only exists in the browser - `navigator.share`,
 * `window.location.origin`. Reading those in the render body makes the
 * server and the first client render disagree, and React throws a
 * hydration mismatch and rebuilds the tree: the certificate page did this
 * on every load, which is why its verification URL flashed blank before
 * appearing.
 *
 * useSyncExternalStore rather than useState + useEffect: it is the
 * primitive built for "the server and the client see different things",
 * it gives React the two snapshots explicitly, and it avoids setting
 * state from an effect just to trigger a second render.
 */
export function useMounted(): boolean {
  return useSyncExternalStore(subscribe, onClient, onServer)
}
