/**
 * localStorage persistence for boss battle progress.
 *
 * Prototype scope: both demo mode and real mode persist remaining boss HP
 * client-side only, under `boss:<slug>:hp` — there is no server table for
 * boss battles yet. A student's remaining boss HP is therefore per-device,
 * not per-account. This is a deliberate, documented limitation for the
 * Phase 7 prototype (see docs/BUILD-PLAN.md); wiring it into the DB is
 * future work, not part of this phase.
 *
 * Every call is wrapped in try/catch: localStorage can throw (private
 * browsing, blocked site data, SSR) and callers should degrade gracefully
 * rather than crash the battle screen.
 */

function storageKey(topicSlug: string): string {
  return `boss:${topicSlug}:hp`
}

export function getSavedBossHp(topicSlug: string): number | null {
  if (typeof window === 'undefined') return null
  try {
    const raw = window.localStorage.getItem(storageKey(topicSlug))
    if (raw === null) return null
    const parsed = Number(raw)
    return Number.isFinite(parsed) ? parsed : null
  } catch {
    return null
  }
}

export function saveBossHp(topicSlug: string, hp: number): void {
  if (typeof window === 'undefined') return
  try {
    window.localStorage.setItem(storageKey(topicSlug), String(Math.max(0, Math.round(hp))))
  } catch {
    // Best-effort only — a student who can't persist progress can still
    // finish the current session.
  }
}

export function clearSavedBossHp(topicSlug: string): void {
  if (typeof window === 'undefined') return
  try {
    window.localStorage.removeItem(storageKey(topicSlug))
  } catch {
    // no-op
  }
}
