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

export function assertProductionEnv(): void {
  if (process.env.NODE_ENV !== 'production') {
    return
  }

  if (process.env.NEXT_PHASE === NEXT_PRODUCTION_BUILD_PHASE) {
    return
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
