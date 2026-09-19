import { NextResponse, type NextRequest } from 'next/server'
import { createClient } from '@/lib/supabase/server'

// Never statically optimized/cached - always reads the incoming request's
// query string and must run per-request.
export const dynamic = 'force-dynamic'

/**
 * `next` comes straight from the URL a user clicked, so it must never be
 * trusted as a redirect target as-is - `next=https://evil.com` or the
 * protocol-relative `next=//evil.com` (which browsers also resolve as an
 * absolute URL to a different host) would otherwise turn this route into
 * an open redirect off a legitimate Supabase/our-own-domain email link.
 * Only a same-origin, root-relative path is safe to pass through
 * unmodified; anything else falls back to /dashboard (not the default
 * /reset-password - an explicit-but-unsafe `next` implies the caller
 * already has a real session and just needs *somewhere* safe to land).
 */
function resolveNextPath(nextParam: string | null): string {
  if (!nextParam) return '/reset-password'
  const isSafeRelativePath = nextParam.startsWith('/') && !nextParam.startsWith('//')
  return isSafeRelativePath ? nextParam : '/dashboard'
}

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
  const next = resolveNextPath(searchParams.get('next'))

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
