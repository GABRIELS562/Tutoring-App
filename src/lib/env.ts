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
 */

const REQUIRED_PRODUCTION_ENV = [
  'NEXT_PUBLIC_SUPABASE_URL',
  'NEXT_PUBLIC_SUPABASE_ANON_KEY',
  'DATABASE_URL',
] as const

export function assertProductionEnv(): void {
  if (process.env.NODE_ENV !== 'production') {
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
