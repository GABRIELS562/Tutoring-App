/**
 * Production environment guard.
 *
 * Every "demo mode" fallback in this app (middleware pass-through, the
 * demo user in (app)/layout.tsx, demo-admin in (admin)/admin/layout.tsx,
 * isDemoAuth() in src/lib/auth/require-user.ts) is conditioned on Supabase
 * env being unset AND NODE_ENV !== 'production'. That keeps local dev
 * working with an empty .env.local, but it depends on NODE_ENV actually
 * being 'production' on a real deploy.
 *
 * assertProductionEnv() is the backstop for a misconfigured production
 * deploy: if NODE_ENV is 'production' but the required env is missing, it
 * throws immediately so the app fails to boot loudly, instead of quietly
 * running with an open admin panel and no route protection.
 *
 * `next build` always runs with NODE_ENV='production' too (that is what
 * produces a production bundle), including on a dev machine or CI with no
 * real Supabase/DATABASE_URL configured — this repo's own DoD requires
 * `npm run build` to succeed against an empty .env.local. Next sets
 * NEXT_PHASE='phase-production-build' only during that build step (not
 * during `next start` or a deployed server/serverless invocation), so this
 * guard is skipped then and enforced only at actual server runtime.
 */

const REQUIRED_PRODUCTION_ENV = [
  'NEXT_PUBLIC_SUPABASE_URL',
  'NEXT_PUBLIC_SUPABASE_ANON_KEY',
  'DATABASE_URL',
  // Required, not optional. getApiSupabase() used to fall back to the anon
  // key when this was missing, which creates a client carrying no user JWT
  // at all - so auth.uid() is NULL and every RLS policy in 0001_rls.sql,
  // all of which compare against auth.uid(), denies the write. The routes
  // log the failure and still return 200, so hints get answered while XP,
  // quota, badges and certificates quietly stop persisting. Failing to boot
  // is much better than looking healthy and saving nothing.
  'SUPABASE_SERVICE_ROLE_KEY',
] as const

const NEXT_PRODUCTION_BUILD_PHASE = 'phase-production-build'

/**
 * Is this the demo deployment - a production build running with no
 * database, opted into with NEXT_PUBLIC_DEMO_DEPLOYMENT?
 *
 * Deliberately NOT folded into isDemoAuth(). That function decides whether
 * demo AUTH is permitted - whether a caller with no session is treated as a
 * signed-in admin - and it is false in production precisely so the admin
 * panel stays shut on a deployment like this one. This answers a different
 * question: whether the app is serving demo CONTENT. A demo deployment is
 * both (demo content, no demo auth), so the two must stay separate.
 */
export function isDemoDeployment(): boolean {
  return process.env.NEXT_PUBLIC_DEMO_DEPLOYMENT === 'true'
}

export function assertProductionEnv(): void {
  if (process.env.NODE_ENV !== 'production') {
    return
  }

  if (process.env.NEXT_PHASE === NEXT_PRODUCTION_BUILD_PHASE) {
    return
  }

  const present = REQUIRED_PRODUCTION_ENV.filter((key) => process.env[key])

  /**
   * A demo deployment: a real production build, deliberately with no
   * database, so a client can click through the app exactly as it looks on
   * a developer's machine - Demo Student, the demo question bank, the
   * static paper library. Nothing persists, and nothing is meant to.
   *
   * Opted into explicitly, and only honoured when NOT ONE Supabase value is
   * set. A half-configured deployment is the accident this guard exists to
   * catch, and it still fails: a real deployment that loses one variable
   * cannot silently slide into demo mode by having this flag set too.
   *
   * What is NOT relaxed: demo-admin. `isDemoAuth()` requires
   * NODE_ENV !== 'production', so the admin panel stays shut here and the
   * layout falls through to requireAdmin(), which has no session to find.
   *
   * This does mean the app serves content to anyone who reaches it, signed
   * in as a fake student. Put the hostname behind Cloudflare Access (or
   * equivalent) - the deployment itself has no login of its own.
   */
  if (process.env.NEXT_PUBLIC_DEMO_DEPLOYMENT === 'true') {
    if (present.length === 0) {
      console.warn(
        '[demo deployment] Running a production build with no database. ' +
          'Nothing persists, and the app is open to anyone who can reach it - ' +
          'it must sit behind an access gate.'
      )
      return
    }

    throw new Error(
      `NEXT_PUBLIC_DEMO_DEPLOYMENT is set, but these are also configured: ${present.join(', ')}. ` +
        'A demo deployment must have no database at all - refusing to start ' +
        'rather than run half-configured.'
    )
  }

  const missing = REQUIRED_PRODUCTION_ENV.filter((key) => !process.env[key])

  if (missing.length > 0) {
    throw new Error(
      `Missing required production environment variable(s): ${missing.join(', ')}. ` +
        'Without these, demo mode and demo-admin become reachable in production. ' +
        'Refusing to start.'
    )
  }
}

// Runs as a side effect of importing this module, so `import '@/lib/env'`
// from the root layout is enough to enforce this on every server start.
assertProductionEnv()
