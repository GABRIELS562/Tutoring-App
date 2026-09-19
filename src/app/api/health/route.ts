import { NextResponse } from 'next/server'
import { sql } from 'drizzle-orm'
import { db, isDemoMode } from '@/db'

// Never statically optimized/cached - a health check must always reflect
// the current state of the app's dependencies, not a build-time snapshot.
export const dynamic = 'force-dynamic'

// Each dependency check must resolve within this window - a health
// endpoint that itself hangs (a stuck DB connection, an unreachable
// Supabase project) defeats the point of having one. Any check that
// doesn't finish in time is treated the same as a failure: that check
// reports 'error' and the overall response is 503.
export const HEALTH_CHECK_TIMEOUT_MS = 5000

type CheckStatus = 'ok' | 'skipped' | 'error'

interface HealthChecks {
  db: CheckStatus
  supabase: CheckStatus
  time: string
}

/**
 * Races `promise` against a HEALTH_CHECK_TIMEOUT_MS timer - whichever
 * settles first wins. Used for db.execute(), which (unlike fetch) has no
 * built-in way to pass an AbortSignal/timeout through this app's
 * drizzle/pg setup, so a plain Promise.race-style timeout is the
 * simplest way to bound it. The timer is always cleared, whichever side
 * wins, so a fast query doesn't leave a dangling timer.
 */
function withTimeout<T>(promise: Promise<T>, ms: number, label: string): Promise<T> {
  return new Promise<T>((resolve, reject) => {
    const timer = setTimeout(() => {
      reject(new Error(`${label} timed out after ${ms}ms`))
    }, ms)

    promise.then(
      (value) => {
        clearTimeout(timer)
        resolve(value)
      },
      (error) => {
        clearTimeout(timer)
        reject(error)
      }
    )
  })
}

/**
 * Pings Postgres with `select 1` when DATABASE_URL is configured.
 * 'skipped' in demo mode (matches every other layer's demo-mode
 * behaviour - see CLAUDE.md's demo-mode table), 'error' on any failure
 * OR if the query doesn't complete within HEALTH_CHECK_TIMEOUT_MS. The
 * underlying error is logged server-side only - never returned in the
 * response (it could contain connection details).
 */
async function checkDb(): Promise<CheckStatus> {
  if (isDemoMode) {
    return 'skipped'
  }

  try {
    await withTimeout(db.execute(sql`select 1`), HEALTH_CHECK_TIMEOUT_MS, 'Database ping')
    return 'ok'
  } catch (error) {
    console.error('Health check: database ping failed', error)
    return 'error'
  }
}

/**
 * Pings Supabase's Auth (GoTrue) health endpoint - a public,
 * unauthenticated `GET /auth/v1/health` that Supabase's own auth server
 * exposes, so no API key is needed for this check. 'skipped' when
 * Supabase isn't configured, 'error' on a non-ok response, a network
 * failure, or a HEALTH_CHECK_TIMEOUT_MS timeout (AbortSignal.timeout
 * aborts the fetch itself, which fetch surfaces as a rejected promise -
 * caught below like any other failure). Logged server-side only, same
 * as checkDb().
 */
async function checkSupabase(): Promise<CheckStatus> {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL

  if (!supabaseUrl) {
    return 'skipped'
  }

  try {
    const response = await fetch(`${supabaseUrl}/auth/v1/health`, {
      method: 'GET',
      cache: 'no-store',
      signal: AbortSignal.timeout(HEALTH_CHECK_TIMEOUT_MS),
    })
    return response.ok ? 'ok' : 'error'
  } catch (error) {
    console.error('Health check: Supabase auth ping failed', error)
    return 'error'
  }
}

/**
 * Public health endpoint - no auth required. Returns 200 when nothing
 * errored ('skipped' checks are fine, e.g. in local dev with no
 * DATABASE_URL/Supabase env set) and 503 the moment any configured
 * dependency fails. Never includes env values (URLs, connection
 * strings, keys) in the response - only the ok/skipped/error status per
 * check.
 */
export async function GET() {
  const [dbStatus, supabaseStatus] = await Promise.all([checkDb(), checkSupabase()])

  const checks: HealthChecks = {
    db: dbStatus,
    supabase: supabaseStatus,
    time: new Date().toISOString(),
  }

  const ok = dbStatus !== 'error' && supabaseStatus !== 'error'

  return NextResponse.json({ ok, checks }, { status: ok ? 200 : 503 })
}
