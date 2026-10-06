import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'

/**
 * The pool was created with no `max`, so node-postgres used its default
 * of 10 - per Pool, and this module is a singleton per warm serverless
 * instance. Total Postgres connections therefore grew as
 * (concurrent instances x 10), which exhausts a Supabase plan's client
 * limit under exactly the traffic you want to survive.
 *
 * It cannot be caught locally: one dev process opens one pool. These
 * assertions are the only thing standing between the default coming back
 * and finding out in production.
 */
const { PoolMock } = vi.hoisted(() => ({ PoolMock: vi.fn() }))

vi.mock('pg', () => ({
  Pool: class {
    on = vi.fn()
    constructor(options: unknown) {
      PoolMock(options)
    }
  },
}))

vi.mock('drizzle-orm/node-postgres', () => ({ drizzle: vi.fn(() => ({})) }))

const ORIGINAL = { ...process.env }

async function loadDbWith(env: Record<string, string | undefined>) {
  vi.resetModules()
  PoolMock.mockClear()
  for (const [k, v] of Object.entries(env)) {
    if (v === undefined) delete process.env[k]
    else process.env[k] = v
  }
  await import('@/db')
  return PoolMock.mock.calls[0]?.[0] as Record<string, unknown> | undefined
}

describe('the Postgres pool is bounded', () => {
  beforeEach(() => {
    process.env = { ...ORIGINAL }
  })

  afterEach(() => {
    process.env = { ...ORIGINAL }
  })

  it('sets an explicit max well below node-postgres default of 10', async () => {
    const options = await loadDbWith({
      DATABASE_URL: 'postgres://user:pw@db.example.supabase.co:6543/postgres',
      DB_POOL_MAX: undefined,
    })

    expect(options?.max).toBe(3)
    expect(options!.max as number).toBeLessThan(10)
  })

  it('releases idle clients and gives up on a saturated pooler', async () => {
    const options = await loadDbWith({
      DATABASE_URL: 'postgres://user:pw@db.example.supabase.co:6543/postgres',
      DB_POOL_MAX: undefined,
    })

    expect(options?.idleTimeoutMillis).toBeGreaterThan(0)
    expect(options?.connectionTimeoutMillis).toBeGreaterThan(0)
  })

  it('lets a long-lived server raise the ceiling with DB_POOL_MAX', async () => {
    const options = await loadDbWith({
      DATABASE_URL: 'postgres://user:pw@db.example.supabase.co:5432/postgres',
      DB_POOL_MAX: '20',
    })

    expect(options?.max).toBe(20)
  })

  it('falls back to the safe default when DB_POOL_MAX is not a number', async () => {
    const options = await loadDbWith({
      DATABASE_URL: 'postgres://user:pw@db.example.supabase.co:5432/postgres',
      DB_POOL_MAX: 'lots',
    })

    expect(options?.max).toBe(3)
  })

  it('still enables TLS for a remote host and skips it for localhost', async () => {
    const remote = await loadDbWith({
      DATABASE_URL: 'postgres://user:pw@db.example.supabase.co:5432/postgres',
      DB_POOL_MAX: undefined,
    })
    expect(remote?.ssl).toEqual({ rejectUnauthorized: false })

    const local = await loadDbWith({
      DATABASE_URL: 'postgres://user:pw@localhost:5432/postgres',
      DB_POOL_MAX: undefined,
    })
    expect(local?.ssl).toBe(false)
  })

  it('creates no pool at all without DATABASE_URL', async () => {
    const options = await loadDbWith({ DATABASE_URL: undefined })

    expect(options).toBeUndefined()
  })
})
