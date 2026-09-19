import { NextResponse } from 'next/server'
import { checkDb, checkSupabase, type HealthChecks } from '@/lib/health-check'

// Never statically optimized/cached - a health check must always reflect
// the current state of the app's dependencies, not a build-time snapshot.
export const dynamic = 'force-dynamic'

/**
 * Public health endpoint - no auth required. Returns 200 when nothing
 * errored ('skipped' checks are fine, e.g. in local dev with no
 * DATABASE_URL/Supabase env set) and 503 the moment any configured
 * dependency fails or times out (see src/lib/health-check.ts). Never
 * includes env values (URLs, connection strings, keys) in the response -
 * only the ok/skipped/error status per check.
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
