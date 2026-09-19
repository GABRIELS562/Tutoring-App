import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'

const executeMock = vi.fn()
let isDemoModeValue = true

vi.mock('@/db', () => ({
  get isDemoMode() {
    return isDemoModeValue
  },
  db: { execute: executeMock },
}))

const { checkDb, checkSupabase, HEALTH_CHECK_TIMEOUT_MS } = await import('@/lib/health-check')

const ORIGINAL_FETCH = global.fetch
const ORIGINAL_ENV = { ...process.env }

describe('health-check', () => {
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
    vi.useRealTimers()
  })

  describe('checkDb', () => {
    it('returns "skipped" in demo mode without touching the db', async () => {
      const status = await checkDb()
      expect(status).toBe('skipped')
      expect(executeMock).not.toHaveBeenCalled()
    })

    it('returns "ok" when the query succeeds', async () => {
      process.env.DATABASE_URL = 'postgres://user:pass@localhost:5432/db'
      isDemoModeValue = false
      executeMock.mockResolvedValueOnce({ rows: [] })

      expect(await checkDb()).toBe('ok')
      expect(executeMock).toHaveBeenCalledTimes(1)
    })

    it('returns "error" when the query rejects', async () => {
      process.env.DATABASE_URL = 'postgres://user:pass@localhost:5432/db'
      isDemoModeValue = false
      executeMock.mockRejectedValueOnce(new Error('connection refused'))
      const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {})

      expect(await checkDb()).toBe('error')
      expect(consoleErrorSpy).toHaveBeenCalledWith(
        'Health check: database ping failed',
        expect.any(Error)
      )
    })

    it('returns "error" when the query hangs past HEALTH_CHECK_TIMEOUT_MS', async () => {
      process.env.DATABASE_URL = 'postgres://user:pass@localhost:5432/db'
      isDemoModeValue = false
      executeMock.mockReturnValueOnce(new Promise(() => {})) // never resolves
      const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {})

      vi.useFakeTimers()
      const statusPromise = checkDb()
      await vi.advanceTimersByTimeAsync(HEALTH_CHECK_TIMEOUT_MS)
      const status = await statusPromise

      expect(status).toBe('error')
      expect(consoleErrorSpy).toHaveBeenCalledWith(
        'Health check: database ping failed',
        expect.any(Error)
      )
    })

    it('does not false-positive timeout on a fast query', async () => {
      process.env.DATABASE_URL = 'postgres://user:pass@localhost:5432/db'
      isDemoModeValue = false
      executeMock.mockResolvedValueOnce({ rows: [] })

      vi.useFakeTimers()
      const statusPromise = checkDb()
      await vi.advanceTimersByTimeAsync(0)

      expect(await statusPromise).toBe('ok')
    })
  })

  describe('checkSupabase', () => {
    it('returns "skipped" when NEXT_PUBLIC_SUPABASE_URL is unset', async () => {
      expect(await checkSupabase()).toBe('skipped')
    })

    it('returns "ok" on a 200 response and passes AbortSignal.timeout(HEALTH_CHECK_TIMEOUT_MS)', async () => {
      process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://example.supabase.co'
      const timeoutSpy = vi.spyOn(AbortSignal, 'timeout')
      global.fetch = vi.fn().mockResolvedValue({ ok: true, status: 200 })

      expect(await checkSupabase()).toBe('ok')
      expect(global.fetch).toHaveBeenCalledWith(
        'https://example.supabase.co/auth/v1/health',
        expect.objectContaining({ method: 'GET' })
      )
      expect(timeoutSpy).toHaveBeenCalledWith(HEALTH_CHECK_TIMEOUT_MS)
    })

    it('returns "error" on a non-ok response', async () => {
      process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://example.supabase.co'
      global.fetch = vi.fn().mockResolvedValue({ ok: false, status: 500 })

      expect(await checkSupabase()).toBe('error')
    })

    it('returns "error" when fetch throws (network failure)', async () => {
      process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://example.supabase.co'
      global.fetch = vi.fn().mockRejectedValue(new Error('network unreachable'))
      const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {})

      expect(await checkSupabase()).toBe('error')
      expect(consoleErrorSpy).toHaveBeenCalledWith(
        'Health check: Supabase auth ping failed',
        expect.any(Error)
      )
    })

    it('returns "error" when the fetch is aborted (timeout fires)', async () => {
      process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://example.supabase.co'
      const controller = new AbortController()
      vi.spyOn(AbortSignal, 'timeout').mockReturnValue(controller.signal)
      const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {})

      global.fetch = vi.fn().mockImplementation(
        (_url: string, init: RequestInit) =>
          new Promise((_, reject) => {
            init.signal?.addEventListener('abort', () => {
              reject(new DOMException('The operation was aborted.', 'AbortError'))
            })
          })
      )

      const statusPromise = checkSupabase()
      controller.abort()

      expect(await statusPromise).toBe('error')
      expect(consoleErrorSpy).toHaveBeenCalledWith(
        'Health check: Supabase auth ping failed',
        expect.anything()
      )
    })
  })
})
