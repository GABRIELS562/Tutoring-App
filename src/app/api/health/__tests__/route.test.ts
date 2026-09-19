import { describe, it, expect, vi, beforeEach } from 'vitest'

const checkDbMock = vi.fn()
const checkSupabaseMock = vi.fn()

vi.mock('@/lib/health-check', () => ({
  checkDb: checkDbMock,
  checkSupabase: checkSupabaseMock,
}))

const { GET } = await import('@/app/api/health/route')

describe('GET /api/health (orchestration - see src/lib/__tests__/health-check.test.ts for check behaviour)', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('returns 200 with ok: true when both checks are "skipped"', async () => {
    checkDbMock.mockResolvedValue('skipped')
    checkSupabaseMock.mockResolvedValue('skipped')

    const res = await GET()
    const body = await res.json()

    expect(res.status).toBe(200)
    expect(body).toEqual({
      ok: true,
      checks: { db: 'skipped', supabase: 'skipped', time: expect.any(String) },
    })
  })

  it('returns 200 with ok: true when both checks are "ok"', async () => {
    checkDbMock.mockResolvedValue('ok')
    checkSupabaseMock.mockResolvedValue('ok')

    const res = await GET()
    const body = await res.json()

    expect(res.status).toBe(200)
    expect(body.ok).toBe(true)
  })

  it('returns 503 with ok: false when db errors', async () => {
    checkDbMock.mockResolvedValue('error')
    checkSupabaseMock.mockResolvedValue('skipped')

    const res = await GET()
    const body = await res.json()

    expect(res.status).toBe(503)
    expect(body.ok).toBe(false)
    expect(body.checks.db).toBe('error')
  })

  it('returns 503 with ok: false when supabase errors', async () => {
    checkDbMock.mockResolvedValue('skipped')
    checkSupabaseMock.mockResolvedValue('error')

    const res = await GET()
    const body = await res.json()

    expect(res.status).toBe(503)
    expect(body.ok).toBe(false)
    expect(body.checks.supabase).toBe('error')
  })

  it('includes an ISO time string and never leaks anything beyond the check statuses', async () => {
    checkDbMock.mockResolvedValue('ok')
    checkSupabaseMock.mockResolvedValue('ok')

    const res = await GET()
    const body = await res.json()

    expect(new Date(body.checks.time).toISOString()).toBe(body.checks.time)
    expect(Object.keys(body.checks).sort()).toEqual(['db', 'supabase', 'time'])
  })
})
