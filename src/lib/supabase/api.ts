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
 * Execute a database operation with demo mode fallback
 * @param operation - The Supabase operation to execute
 * @param demoFallback - Value to return in demo mode
 */
export async function withSupabase<T>(
  operation: (client: SupabaseClient) => Promise<T>,
  demoFallback: T
): Promise<{ data: T; isDemo: boolean }> {
  const client = getApiSupabase()

  if (!client) {
    return { data: demoFallback, isDemo: true }
  }

  try {
    const data = await operation(client)
    return { data, isDemo: false }
  } catch (error) {
    console.error('Supabase operation failed:', error)
    return { data: demoFallback, isDemo: true }
  }
}
