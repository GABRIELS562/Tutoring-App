import { NextResponse } from 'next/server'
import { sql } from 'drizzle-orm'
import { db, isDemoMode } from '@/db'

// Never statically optimized/cached - a health check must always reflect
// the current state of the app's dependencies, not a build-time snapshot.
export const dynamic = 'force-dynamic'

type CheckStatus = 'ok' | 'skipped' | 'error'

interface HealthChecks {
  db: CheckStatus
  supabase: CheckStatus
  time: string
}

/**
 * Pings Postgres with `select 1` when DATABASE_URL is configured.
 * 'skipped' in demo mode (matches every other layer's demo-mode
 * behaviour - see CLAUDE.md's demo-mode table), 'error' on any failure.
 * The underlying error is logged server-side only - never returned in
 * the response (it could contain connection details).
 */
async function checkDb(): Promise<CheckStatus> {
  if (isDemoMode) {
    return 'skipped'
  }

  try {
    await db.execute(sql`select 1`)
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
 * Supabase isn't configured, 'error' on a non-ok response or a network
 * failure (logged server-side only, same as checkDb()).
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
