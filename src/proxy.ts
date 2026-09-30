import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'
// Side-effect import: fail loudly in production if Supabase/DB env is missing,
// so the demo-mode pass-through below can never be reached on a real deploy.
import '@/lib/env'

/** Auth pages that have nothing to do in demo mode. */
const DEMO_BYPASSED_ROUTES = new Set(['/login', '/signup', '/forgot-password', '/reset-password'])

export async function proxy(request: NextRequest) {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  // If Supabase isn't configured, let requests through - except the auth
  // pages, which become a dead end in demo mode. There is nothing to sign
  // in to, so /login offers a form that cannot work and a "Continue as
  // Demo User" button that is the only way out; signing out lands there
  // and looks like the app is asking for an account it never needed.
  //
  // This cannot weaken a real deployment: production refuses to boot
  // without Supabase env (assertProductionEnv, imported above for that
  // side effect), so this branch is unreachable there.
  if (!supabaseUrl || !supabaseKey) {
    if (DEMO_BYPASSED_ROUTES.has(request.nextUrl.pathname)) {
      const url = request.nextUrl.clone()
      url.pathname = '/dashboard'
      url.search = ''
      return NextResponse.redirect(url)
    }
    return NextResponse.next()
  }

  let supabaseResponse = NextResponse.next({
    request,
  })

  const supabase = createServerClient(supabaseUrl, supabaseKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll()
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value }) =>
          request.cookies.set(name, value)
        )
        supabaseResponse = NextResponse.next({
          request,
        })
        cookiesToSet.forEach(({ name, value, options }) =>
          supabaseResponse.cookies.set(name, value, options)
        )
      },
    },
  })

  const {
    data: { user },
  } = await supabase.auth.getUser()

  const { pathname } = request.nextUrl

  // Protected routes
  const protectedRoutes = ['/dashboard', '/subjects', '/topics', '/papers', '/progress', '/admin', '/api/admin']
  const authRoutes = ['/login', '/signup']

  const isProtectedRoute = protectedRoutes.some(route => pathname.startsWith(route))
  const isAuthRoute = authRoutes.some(route => pathname === route)

  // Unauthenticated access to a protected route: API routes get a 401 JSON
  // body (a redirect makes no sense for a fetch caller), page routes get
  // redirected to /login. Route-level requireAdmin() still enforces the
  // admin role check for /api/admin — this only guarantees a session exists.
  if (isProtectedRoute && !user) {
    if (pathname.startsWith('/api/')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const url = request.nextUrl.clone()
    url.pathname = '/login'
    return NextResponse.redirect(url)
  }

  // Redirect authenticated users away from auth pages
  if (isAuthRoute && user) {
    const url = request.nextUrl.clone()
    url.pathname = '/dashboard'
    return NextResponse.redirect(url)
  }

  return supabaseResponse
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
