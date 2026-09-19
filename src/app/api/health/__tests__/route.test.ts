import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'

const executeMock = vi.fn()
let isDemoModeValue = true

vi.mock('@/db', () => ({
  get isDemoMode() {
    return isDemoModeValue
  },
  db: { execute: executeMock },
}))

const { GET } = await import('@/app/api/health/route')

const ORIGINAL_FETCH = global.fetch
const ORIGINAL_ENV = { ...process.env }

describe('GET /api/health', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    isDemoModeValue = true
    process.env = { ...ORIGINAL_ENV }
    delete process.env.DATABASE_URL
    delete process.env.NEXT_PUBLIC_SUPABASE_URL
    delete process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  })

  afterEach(() => {
    global.fetch = ORIGINAL_FETCH
    process.env = { ...ORIGINAL_ENV }
  })

  it('reports both checks as "skipped" and 200 when nothing is configured', async () => {
    const res = await GET()
    const body = await res.json()

    expect(res.status).toBe(200)
    expect(body.ok).toBe(true)
    expect(body.checks.db).toBe('skipped')
    expect(body.checks.supabase).toBe('skipped')
    expect(typeof body.checks.time).toBe('string')
    expect(executeMock).not.toHaveBeenCalled()
  })

  it('pings the db with select 1 and reports "ok" when DATABASE_URL is set and the query succeeds', async () => {
    process.env.DATABASE_URL = 'postgres://user:pass@localhost:5432/db'
    isDemoModeValue = false
    executeMock.mockResolvedValueOnce({ rows: [{ '?column?': 1 }] })

    const res = await GET()
    const body = await res.json()

    expect(res.status).toBe(200)
    expect(body.checks.db).toBe('ok')
    expect(executeMock).toHaveBeenCalledTimes(1)
  })

  it('reports "error" and 503 when the db ping fails', async () => {
    process.env.DATABASE_URL = 'postgres://user:pass@localhost:5432/db'
    isDemoModeValue = false
    executeMock.mockRejectedValueOnce(new Error('connection refused'))
    const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {})

    const res = await GET()
    const body = await res.json()

    expect(res.status).toBe(503)
    expect(body.ok).toBe(false)
    expect(body.checks.db).toBe('error')
    consoleErrorSpy.mockRestore()
  })

  it('pings Supabase auth health and reports "ok" on a 200 response', async () => {
    process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://example.supabase.co'
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = 'anon-key'
    global.fetch = vi.fn().mockResolvedValue({ ok: true, status: 200 })

    const res = await GET()
    const body = await res.json()

    expect(res.status).toBe(200)
    expect(body.checks.supabase).toBe('ok')
    expect(global.fetch).toHaveBeenCalledWith(
      'https://example.supabase.co/auth/v1/health',
      expect.objectContaining({ method: 'GET' })
    )
  })

  it('reports "error" and 503 when the Supabase auth ping returns a non-ok status', async () => {
    process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://example.supabase.co'
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = 'anon-key'
    global.fetch = vi.fn().mockResolvedValue({ ok: false, status: 500 })

    const res = await GET()
    const body = await res.json()

    expect(res.status).toBe(503)
    expect(body.ok).toBe(false)
    expect(body.checks.supabase).toBe('error')
  })

  it('reports "error" when the Supabase auth ping throws (network failure)', async () => {
    process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://example.supabase.co'
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = 'anon-key'
    global.fetch = vi.fn().mockRejectedValue(new Error('network unreachable'))
    const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {})

    const res = await GET()
    const body = await res.json()

    expect(res.status).toBe(503)
    expect(body.checks.supabase).toBe('error')
    consoleErrorSpy.mockRestore()
  })

  it('is 200 overall when db is ok and supabase is skipped (and vice versa)', async () => {
    process.env.DATABASE_URL = 'postgres://user:pass@localhost:5432/db'
    isDemoModeValue = false
    executeMock.mockResolvedValueOnce({ rows: [] })

    const res = await GET()
    const body = await res.json()

    expect(res.status).toBe(200)
    expect(body.ok).toBe(true)
    expect(body.checks.db).toBe('ok')
    expect(body.checks.supabase).toBe('skipped')
  })

  it('never leaks env values (DATABASE_URL / Supabase URL) in the response body', async () => {
    process.env.DATABASE_URL = 'postgres://secret-user:secret-pass@localhost:5432/db'
    process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://super-secret-project.supabase.co'
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = 'anon-key'
    isDemoModeValue = false
    executeMock.mockResolvedValueOnce({ rows: [] })
    global.fetch = vi.fn().mockResolvedValue({ ok: true, status: 200 })

    const res = await GET()
    const rawBody = await res.text()

    expect(rawBody).not.toContain('secret-user')
    expect(rawBody).not.toContain('secret-pass')
    expect(rawBody).not.toContain('super-secret-project')
  })
})
