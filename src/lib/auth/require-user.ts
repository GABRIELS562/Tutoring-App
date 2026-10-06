import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'
import { isUserAdmin } from '@/db/queries/admin'
import { isDemoDeployment } from '@/lib/env'

/**
 * A minimal, trusted view of the signed-in user, derived server-side
 * from the Supabase session (or the demo fallback in local dev).
 */
export interface SessionUser {
  id: string
  email: string | null
}

const DEMO_USER: SessionUser = { id: 'demo-user', email: 'demo@example.com' }

export type AuthErrorStatus = 401 | 403

/**
 * Thrown by requireUser()/requireAdmin() when a request has no valid
 * session (401) or a valid session lacking the required privilege (403).
 * Route handlers should catch this and return authErrorResponse(err).
 */
export class AuthError extends Error {
  status: AuthErrorStatus

  constructor(message: string, status: AuthErrorStatus = 401) {
    super(message)
    this.name = 'AuthError'
    this.status = status
  }
}

/**
 * Whether this process should treat callers as a signed-in demo user -
 * which also makes them an admin, since there is no role to look up.
 *
 * Supabase being unconfigured is necessary but not sufficient. Beyond
 * that there are exactly two cases:
 *
 *   - local development, where an empty .env.local is how the app runs;
 *   - a demo deployment, opted into by name with
 *     NEXT_PUBLIC_DEMO_DEPLOYMENT and only valid when NOT ONE Supabase
 *     value is set (assertProductionEnv refuses to boot otherwise).
 *
 * The second case is why this is not simply `NODE_ENV !== 'production'`.
 * A demo deployment is a production build that is meant to be explored,
 * admin panel included, by the handful of people who can reach it - it
 * has no login of its own and must sit behind an access gate, so "admin"
 * there means whoever the gate already let in.
 *
 * What has NOT changed is the accident this guards against: a real
 * deployment that loses its Supabase env does not land here. It fails to
 * boot, because assertProductionEnv() throws unless the demo flag is set
 * AND every Supabase value is absent. Demo auth in production stays
 * something you can only choose, never something you can slip into.
 */
export function isDemoAuth(): boolean {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  const supabaseConfigured = Boolean(supabaseUrl && supabaseKey)

  if (supabaseConfigured) {
    return false
  }

  return process.env.NODE_ENV !== 'production' || isDemoDeployment()
}

/**
 * Resolves the current session user server-side using @supabase/ssr,
 * same cookie pattern as `(app)/layout.tsx`. Returns null when there is
 * no authenticated session. In demo mode (local dev, Supabase env unset)
 * returns a fixed demo user instead of touching Supabase at all.
 */
export async function getSessionUser(): Promise<SessionUser | null> {
  if (isDemoAuth()) {
    return DEMO_USER
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  // Misconfigured production deploy (or Supabase env genuinely missing
  // outside dev): there is no demo fallback here, so no session is possible.
  if (!supabaseUrl || !supabaseKey) {
    return null
  }

  const cookieStore = await cookies()

  const supabase = createServerClient(supabaseUrl, supabaseKey, {
    cookies: {
      getAll() {
        return cookieStore.getAll()
      },
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) =>
            cookieStore.set(name, value, options)
          )
        } catch {
          // Ignore - called from a Server Component without response access.
        }
      },
    },
  })

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return null
  }

  return { id: user.id, email: user.email ?? null }
}

/**
 * Returns the current session user or throws a 401 AuthError.
 * Use in every route handler that requires a signed-in user; derive
 * `userId` from the returned value instead of trusting the request body.
 */
export async function requireUser(): Promise<SessionUser> {
  const user = await getSessionUser()

  if (!user) {
    throw new AuthError('Unauthorized', 401)
  }

  return user
}

/**
 * requireUser() plus an admin check: `users.is_admin` via isUserAdmin(),
 * or a session email matching process.env.ADMIN_EMAIL. Throws 403 when
 * neither matches. In demo mode (dev only) any demo session is admin.
 */
export async function requireAdmin(): Promise<SessionUser> {
  const user = await requireUser()

  if (isDemoAuth()) {
    return user
  }

  const adminEmail = process.env.ADMIN_EMAIL
  const isAdminByEmail = Boolean(
    adminEmail && user.email && user.email.toLowerCase() === adminEmail.toLowerCase()
  )
  const isAdminByRole = await isUserAdmin(user.id)

  if (!isAdminByRole && !isAdminByEmail) {
    throw new AuthError('Forbidden', 403)
  }

  return user
}

/**
 * Maps an AuthError thrown by requireUser()/requireAdmin() to the JSON
 * response a route handler should return. Any other error is treated
 * as unauthorized (fail closed).
 */
export function authErrorResponse(err: unknown): NextResponse {
  const status: AuthErrorStatus = err instanceof AuthError ? err.status : 401
  const message = status === 403 ? 'Forbidden' : 'Unauthorized'

  return NextResponse.json({ error: message }, { status })
}
