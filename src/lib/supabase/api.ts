import { createClient, SupabaseClient } from '@supabase/supabase-js'

/**
 * Singleton Supabase client for API routes
 * Uses service role key for full database access
 * Cached to avoid creating new connections on each request
 */
let _apiClient: SupabaseClient | null = null

export function getApiSupabase(): SupabaseClient | null {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

  // Outside production the anon key is an acceptable stand-in for local work.
  // In production it is not: this client carries no user JWT, so auth.uid()
  // is NULL and every RLS policy denies the write while the route still
  // returns 200. Treat a missing service-role key as "not configured" rather
  // than quietly downgrading to a key that cannot write.
  const supabaseKey =
    serviceRoleKey ??
    (process.env.NODE_ENV === 'production'
      ? undefined
      : process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY)

  if (!supabaseUrl || !supabaseKey) {
    return null // Demo mode - Supabase not configured
  }

  if (!_apiClient) {
    _apiClient = createClient(supabaseUrl, supabaseKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    })
  }

  return _apiClient
}

/**
 * Check if Supabase is configured
 */
export function isSupabaseConfigured(): boolean {
  return !!(process.env.NEXT_PUBLIC_SUPABASE_URL &&
    (process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY))
}

/**
 * The outcome of a Supabase operation, with "there is no database" and
 * "the database said no" kept apart.
 *
 * `withSupabase` used to collapse both into `{ data: fallback, isDemo: true }`,
 * so a caller could not tell an unconfigured environment from an RLS denial,
 * a dropped connection or a malformed query. Anything branching on `isDemo`
 * to show a "you are viewing a demo" banner would have shown it to a real
 * user whose write had just failed.
 *
 * `data` is present on every branch so a caller can still render something;
 * `status` is what it must branch on before claiming anything to the user.
 */
export type SupabaseOutcome<T> =
  | { status: 'ok'; data: T }
  /** Supabase is not configured. Demo mode - nothing was attempted. */
  | { status: 'not-configured'; data: T }
  /** Configured, attempted, and it failed. `data` is the fallback. */
  | { status: 'failed'; data: T; error: unknown }

/**
 * Run a Supabase operation, returning a fallback rather than throwing.
 *
 * Callers that persist anything a student can see MUST check `status`:
 * treating 'failed' as 'not-configured' is how a lost write turns into a
 * silent success.
 */
export async function withSupabase<T>(
  operation: (client: SupabaseClient) => Promise<T>,
  demoFallback: T
): Promise<SupabaseOutcome<T>> {
  const client = getApiSupabase()

  if (!client) {
    return { status: 'not-configured', data: demoFallback }
  }

  try {
    return { status: 'ok', data: await operation(client) }
  } catch (error) {
    console.error('Supabase operation failed:', error)
    return { status: 'failed', data: demoFallback, error }
  }
}

/** True when the operation ran and the data is real. */
export function isRealResult<T>(outcome: SupabaseOutcome<T>): boolean {
  return outcome.status === 'ok'
}
