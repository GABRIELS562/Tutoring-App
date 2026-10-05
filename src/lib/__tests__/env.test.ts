import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { assertProductionEnv } from '@/lib/env'

const ORIGINAL_ENV = { ...process.env }

/** Mirrors REQUIRED_PRODUCTION_ENV in src/lib/env.ts. */
const REQUIRED_PRODUCTION_ENV_KEYS = [
  'NEXT_PUBLIC_SUPABASE_URL',
  'NEXT_PUBLIC_SUPABASE_ANON_KEY',
  'DATABASE_URL',
  'SUPABASE_SERVICE_ROLE_KEY',
] as const

function setEnv(overrides: Record<string, string | undefined>) {
  for (const [key, value] of Object.entries(overrides)) {
    if (value === undefined) {
      delete process.env[key]
    } else {
      process.env[key] = value
    }
  }
}

describe('assertProductionEnv', () => {
  beforeEach(() => {
    setEnv({
      NODE_ENV: 'test',
      NEXT_PUBLIC_SUPABASE_URL: undefined,
      NEXT_PUBLIC_SUPABASE_ANON_KEY: undefined,
      DATABASE_URL: undefined,
      NEXT_PHASE: undefined,
      SUPABASE_SERVICE_ROLE_KEY: undefined,
      NEXT_PUBLIC_DEMO_DEPLOYMENT: undefined,
    })
  })

  afterEach(() => {
    process.env = { ...ORIGINAL_ENV }
  })

  it('does nothing outside production, even with every env var missing', () => {
    expect(() => assertProductionEnv()).not.toThrow()
  })

  it('throws in production when Supabase env is missing', () => {
    setEnv({
      NODE_ENV: 'production',
      DATABASE_URL: 'postgres://example',
    })

    expect(() => assertProductionEnv()).toThrow(/NEXT_PUBLIC_SUPABASE_URL/)
  })

  it('throws in production when DATABASE_URL is missing', () => {
    setEnv({
      NODE_ENV: 'production',
      NEXT_PUBLIC_SUPABASE_URL: 'https://example.supabase.co',
      NEXT_PUBLIC_SUPABASE_ANON_KEY: 'anon-key',
    })

    expect(() => assertProductionEnv()).toThrow(/DATABASE_URL/)
  })

  it('does not throw in production when everything required is set', () => {
    setEnv({
      NODE_ENV: 'production',
      NEXT_PUBLIC_SUPABASE_URL: 'https://example.supabase.co',
      NEXT_PUBLIC_SUPABASE_ANON_KEY: 'anon-key',
      DATABASE_URL: 'postgres://example',
      SUPABASE_SERVICE_ROLE_KEY: 'service-role-key',
    })

    expect(() => assertProductionEnv()).not.toThrow()
  })

  it('does not throw during `next build` (NEXT_PHASE=phase-production-build) even with everything missing', () => {
    setEnv({
      NODE_ENV: 'production',
      NEXT_PHASE: 'phase-production-build',
    })

    expect(() => assertProductionEnv()).not.toThrow()
  })

  it('still throws at actual server runtime in production (NEXT_PHASE unset) when env is missing', () => {
    setEnv({
      NODE_ENV: 'production',
      NEXT_PHASE: undefined,
      DATABASE_URL: 'postgres://example',
    })

    expect(() => assertProductionEnv()).toThrow(/NEXT_PUBLIC_SUPABASE_URL/)
  })
})

/**
 * SUPABASE_SERVICE_ROLE_KEY is required, not optional.
 *
 * getApiSupabase() used to fall back to the anon key when it was missing.
 * That client carries no user JWT, so auth.uid() is NULL and every policy
 * in 0001_rls.sql - all of which compare against auth.uid() - denies the
 * write, while the routes log the failure and still return 200. The app
 * would look healthy while XP, quota, badges and certificates silently
 * stopped persisting. Refusing to boot is the better failure.
 */
describe('the service role key is a production requirement', () => {
  it('refuses to start in production without it', () => {
    setEnv({
      NODE_ENV: 'production',
      NEXT_PUBLIC_SUPABASE_URL: 'https://example.supabase.co',
      NEXT_PUBLIC_SUPABASE_ANON_KEY: 'anon-key',
      DATABASE_URL: 'postgres://example',
      SUPABASE_SERVICE_ROLE_KEY: undefined,
      NEXT_PHASE: undefined,
    })

    expect(() => assertProductionEnv()).toThrow(/SUPABASE_SERVICE_ROLE_KEY/)
  })

  it('starts when it is present', () => {
    setEnv({
      NODE_ENV: 'production',
      NEXT_PUBLIC_SUPABASE_URL: 'https://example.supabase.co',
      NEXT_PUBLIC_SUPABASE_ANON_KEY: 'anon-key',
      DATABASE_URL: 'postgres://example',
      SUPABASE_SERVICE_ROLE_KEY: 'service-role-key',
      NEXT_PHASE: undefined,
    })

    expect(() => assertProductionEnv()).not.toThrow()
  })
})

/**
 * The demo deployment: a production build with no database, so the client
 * can click through the app the way it looks on a developer's machine.
 *
 * It exists because the guard above is the ONLY thing that stops that from
 * working - every other layer already degrades on its own, and demo-admin
 * stays shut because isDemoAuth() checks NODE_ENV separately. So the escape
 * hatch has to be narrow: opt-in by name, and refused the moment any real
 * Supabase value appears, which is the half-configured deploy the guard is
 * actually there to catch.
 */
describe('demo deployment', () => {
  beforeEach(() => {
    setEnv({
      NODE_ENV: 'production',
      NEXT_PHASE: undefined,
      NEXT_PUBLIC_SUPABASE_URL: undefined,
      NEXT_PUBLIC_SUPABASE_ANON_KEY: undefined,
      DATABASE_URL: undefined,
      SUPABASE_SERVICE_ROLE_KEY: undefined,
      NEXT_PUBLIC_DEMO_DEPLOYMENT: undefined,
    })
    vi.spyOn(console, 'warn').mockImplementation(() => {})
  })

  afterEach(() => {
    vi.restoreAllMocks()
    process.env = { ...ORIGINAL_ENV }
  })

  it('boots a production build with no database when opted into explicitly', () => {
    setEnv({ NEXT_PUBLIC_DEMO_DEPLOYMENT: 'true' })

    expect(() => assertProductionEnv()).not.toThrow()
  })

  it('warns that the deployment is open and persists nothing', () => {
    setEnv({ NEXT_PUBLIC_DEMO_DEPLOYMENT: 'true' })

    assertProductionEnv()

    expect(console.warn).toHaveBeenCalledWith(
      expect.stringMatching(/demo deployment/i)
    )
  })

  it.each(REQUIRED_PRODUCTION_ENV_KEYS)(
    'refuses to start when %s is also set - that is a half-configured deploy, not a demo',
    (key) => {
      setEnv({ NEXT_PUBLIC_DEMO_DEPLOYMENT: 'true', [key]: 'a-real-value' })

      expect(() => assertProductionEnv()).toThrow(new RegExp(key))
    }
  )

  it('does not let the flag mask a real deployment that lost one variable', () => {
    setEnv({
      NEXT_PUBLIC_DEMO_DEPLOYMENT: 'true',
      NEXT_PUBLIC_SUPABASE_URL: 'https://example.supabase.co',
      NEXT_PUBLIC_SUPABASE_ANON_KEY: 'anon-key',
      SUPABASE_SERVICE_ROLE_KEY: 'service-role-key',
      // DATABASE_URL lost. Without the present-count check this would boot
      // into demo mode and quietly serve a fake student instead of failing.
    })

    expect(() => assertProductionEnv()).toThrow(/refusing to start/)
  })

  it.each(['false', 'TRUE', '1', 'yes', ''])(
    'is not enabled by %o - only the exact string "true"',
    (value) => {
      setEnv({ NEXT_PUBLIC_DEMO_DEPLOYMENT: value })

      expect(() => assertProductionEnv()).toThrow(/NEXT_PUBLIC_SUPABASE_URL/)
    }
  )

  it('is irrelevant outside production', () => {
    setEnv({ NODE_ENV: 'test', NEXT_PUBLIC_DEMO_DEPLOYMENT: undefined })

    expect(() => assertProductionEnv()).not.toThrow()
    expect(console.warn).not.toHaveBeenCalled()
  })
})
