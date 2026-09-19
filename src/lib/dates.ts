/**
 * South African Standard Time (SAST, UTC+2, no DST) date helpers.
 *
 * Streaks, hearts refills and (Phase 4) hint quotas all need to agree
 * on what "today" means for a South African student - using the
 * server's UTC day (or worse, `Date.now()` UTC midnight) rolls the day
 * over at 02:00 SAST instead of local midnight. Kept dependency-free so
 * it's safe to import from anywhere (client or server, any query
 * module) without pulling in unrelated code.
 */

const SAST_TIME_ZONE = 'Africa/Johannesburg'
const ONE_DAY_MS = 24 * 60 * 60 * 1000

// en-CA formats as YYYY-MM-DD, matching the date string shape already
// used for `lastActiveDate` comparisons elsewhere in the codebase.
const sastFormatter = new Intl.DateTimeFormat('en-CA', { timeZone: SAST_TIME_ZONE })

function formatSast(instant: Date): string {
  return sastFormatter.format(instant)
}

/**
 * The current SAST calendar date, as 'YYYY-MM-DD'. Pass an explicit
 * `now` in tests instead of relying on the system clock.
 */
export function todaySast(now: Date = new Date()): string {
  return formatSast(now)
}

/**
 * The SAST calendar date immediately before `now`'s SAST date, as
 * 'YYYY-MM-DD'. South Africa has no DST, so a fixed 24h subtraction on
 * the underlying instant is always exactly one SAST calendar day back.
 */
export function yesterdaySast(now: Date = new Date()): string {
  return formatSast(new Date(now.getTime() - ONE_DAY_MS))
}
