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
    })

    expect(() => assertProductionEnv()).not.toThrow()
  })
})
