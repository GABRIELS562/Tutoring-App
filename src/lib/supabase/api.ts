import { createClient, SupabaseClient } from '@supabase/supabase-js'

/**
 * Singleton Supabase client for API routes
 * Uses service role key for full database access
 * Cached to avoid creating new connections on each request
 */
let _apiClient: SupabaseClient | null = null

export function getApiSupabase(): SupabaseClient | null {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

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
