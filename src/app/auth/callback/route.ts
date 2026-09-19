import { NextResponse, type NextRequest } from 'next/server'
import { createClient } from '@/lib/supabase/server'

// Never statically optimized/cached - always reads the incoming request's
// query string and must run per-request.
export const dynamic = 'force-dynamic'

/**
 * PKCE callback for Supabase email links (password recovery, email
 * confirmation, magic link). Supabase redirects the user's browser here
 * with a one-time `code` after they click the link in their email; this
 * route exchanges it for a session cookie, then forwards the user on to
 * `next` (defaults to /reset-password, since that's currently the only
 * flow that sends users through this route).
 *
 * Public - no auth required, matches src/proxy.ts's protected-route list
 * (this path is not in it).
 */
export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  const next = searchParams.get('next') ?? '/reset-password'

  if (code) {
    const supabase = await createClient()
    const { error } = await supabase.auth.exchangeCodeForSession(code)

    if (!error) {
      return NextResponse.redirect(`${origin}${next}`)
    }
  }

  // Missing or invalid code: send the user to reset-password anyway - it
  // shows its own "invalid or expired link" state rather than a dead end.
  return NextResponse.redirect(`${origin}/reset-password?error=invalid_link`)
}
