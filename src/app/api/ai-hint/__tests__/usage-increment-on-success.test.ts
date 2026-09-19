import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { NextRequest } from 'next/server'

const requireUserMock = vi.fn()
const getApiSupabaseMock = vi.fn()
const createTutorMessageMock = vi.fn()

vi.mock('@/lib/auth/require-user', async () => {
  const actual = await vi.importActual<typeof import('@/lib/auth/require-user')>(
    '@/lib/auth/require-user'
  )
  return {
    ...actual,
    requireUser: requireUserMock,
  }
})

vi.mock('@/lib/supabase/api', () => ({
  getApiSupabase: getApiSupabaseMock,
}))

vi.mock('@/db/queries/users', () => ({
  checkPremiumStatus: vi.fn(async () => false),
}))

vi.mock('@/db', () => ({
  isDemoMode: false,
}))

vi.mock('@/lib/claude', async () => {
  const actual = await vi.importActual<typeof import('@/lib/claude')>('@/lib/claude')
  return {
    ...actual,
    getClaudeClient: vi.fn(() => ({})),
    createTutorMessage: createTutorMessageMock,
  }
})

const { ClaudeError } = await import('@/lib/claude')
const { POST } = await import('@/app/api/ai-hint/route')

function makeRequest(body: Record<string, unknown>) {
  return new NextRequest('http://localhost/api/ai-hint', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })
}

/** A minimal ai_hint_usage-shaped Supabase client for these tests. */
function makeSupabaseMock(rpcMock: ReturnType<typeof vi.fn>) {
  return {
    from(table: string) {
      if (table === 'ai_hint_usage') {
        return {
          select: () => ({
            eq: () => ({
              eq: () => ({
                single: async () => ({ data: null, error: { code: 'PGRST116' } }),
              }),
            }),
          }),
        }
      }
      throw new Error(`Unexpected table in test mock: ${table}`)
    },
    rpc: rpcMock,
  }
}

describe('POST /api/ai-hint usage increment timing and day key', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    process.env.ANTHROPIC_API_KEY = 'test-anthropic-key'
    requireUserMock.mockResolvedValue({ id: 'free-user-1', email: 'a@b.com' })
  })

  afterEach(() => {
    delete process.env.ANTHROPIC_API_KEY
    vi.useRealTimers()
  })

  it('does not call the increment RPC when the model call fails', async () => {
    const rpcMock = vi.fn()
    getApiSupabaseMock.mockReturnValue(makeSupabaseMock(rpcMock))
    createTutorMessageMock.mockRejectedValueOnce(new ClaudeError('server', 'model overloaded'))

    const res = await POST(
      makeRequest({ mode: 'step_hint', questionText: 'q', stepNumber: 1 })
    )

    expect(res.status).toBe(503)
    expect(rpcMock).not.toHaveBeenCalled()
  })

  it('calls the increment RPC only after a successful model call', async () => {
    const rpcMock = vi.fn().mockResolvedValue({
      data: { id: 'usage-1', hint_count: 1, camera_count: 0 },
      error: null,
    })
    getApiSupabaseMock.mockReturnValue(makeSupabaseMock(rpcMock))
    createTutorMessageMock.mockResolvedValueOnce({
      text: 'Here is a nudge.',
      usage: { input_tokens: 10, output_tokens: 5 },
    })

    const res = await POST(
      makeRequest({ mode: 'step_hint', questionText: 'q', stepNumber: 1 })
    )

    expect(res.status).toBe(200)
    expect(rpcMock).toHaveBeenCalledTimes(1)
    expect(rpcMock).toHaveBeenCalledWith(
      'increment_hint_usage',
      expect.objectContaining({ p_user_id: 'free-user-1', p_field: 'hint_count' })
    )
  })

  it('increments camera_count for camera_scan mode', async () => {
    const rpcMock = vi.fn().mockResolvedValue({
      data: { id: 'usage-1', hint_count: 0, camera_count: 1 },
      error: null,
    })
    getApiSupabaseMock.mockReturnValue(makeSupabaseMock(rpcMock))
    createTutorMessageMock.mockResolvedValueOnce({
      text: 'Nice diagram!',
      usage: { input_tokens: 10, output_tokens: 5 },
    })

    await POST(
      makeRequest({
        mode: 'camera_scan',
        imageBase64: 'data:image/jpeg;base64,AAAA',
      })
    )

    expect(rpcMock).toHaveBeenCalledWith(
      'increment_hint_usage',
      expect.objectContaining({ p_field: 'camera_count' })
    )
  })

  it('computes the usage day key in SAST, not UTC', async () => {
    // 23:30 UTC on 14 March = 01:30 SAST on 15 March - a UTC day key
    // would still say 2026-03-14.
    vi.useFakeTimers()
    vi.setSystemTime(new Date('2026-03-14T23:30:00Z'))

    const rpcMock = vi.fn().mockResolvedValue({
      data: { id: 'usage-1', hint_count: 1, camera_count: 0 },
      error: null,
    })
    getApiSupabaseMock.mockReturnValue(makeSupabaseMock(rpcMock))
    createTutorMessageMock.mockResolvedValueOnce({
      text: 'hi',
      usage: { input_tokens: 1, output_tokens: 1 },
    })

    await POST(makeRequest({ mode: 'step_hint', questionText: 'q', stepNumber: 1 }))

    expect(rpcMock).toHaveBeenCalledWith(
      'increment_hint_usage',
      expect.objectContaining({ p_usage_date: '2026-03-15' })
    )
  })
})
