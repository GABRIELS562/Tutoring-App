import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import { assertProductionEnv } from '@/lib/env'

const ORIGINAL_ENV = { ...process.env }

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
