import { describe, it, expect, vi, beforeEach } from 'vitest'
import { NextRequest } from 'next/server'

const requireAdminMock = vi.fn()
const getApiSupabaseMock = vi.fn()
const createTutorMessageMock = vi.fn()

vi.mock('@/lib/auth/require-user', async () => {
  const actual = await vi.importActual<typeof import('@/lib/auth/require-user')>(
    '@/lib/auth/require-user'
  )
  return {
    ...actual,
    requireAdmin: requireAdminMock,
  }
})

vi.mock('@/lib/supabase/api', () => ({
  getApiSupabase: getApiSupabaseMock,
}))

vi.mock('@/lib/claude', async () => {
  const actual = await vi.importActual<typeof import('@/lib/claude')>('@/lib/claude')
  return {
    ...actual,
    getClaudeClient: vi.fn(() => ({})),
    createTutorMessage: createTutorMessageMock,
  }
})

const { POST } = await import('@/app/api/admin/generate-steps/route')

function makeRequest(body: Record<string, unknown>) {
  return new NextRequest('http://localhost/api/admin/generate-steps', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })
}

describe('POST /api/admin/generate-steps logs usage to ai_usage_log', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    process.env.ANTHROPIC_API_KEY = 'test-anthropic-key'
    requireAdminMock.mockResolvedValue({ id: 'admin-1', email: 'admin@b.com' })
  })

  it('inserts a row (fire-and-forget) with mode "generate_steps" after a successful call', async () => {
    const insertMock = vi.fn().mockResolvedValue({ error: null })
    getApiSupabaseMock.mockReturnValue({
      from: (table: string) => {
        if (table === 'ai_usage_log') {
          return { insert: insertMock }
        }
        throw new Error(`Unexpected table in test mock: ${table}`)
      },
    })
    createTutorMessageMock.mockResolvedValueOnce({
      text: '{"steps":[]}',
      usage: { input_tokens: 200, output_tokens: 80, cache_read_input_tokens: 150 },
    })

    const res = await POST(makeRequest({ questionText: 'Solve x + 2 = 5' }))
    expect(res.status).toBe(200)

    expect(insertMock).toHaveBeenCalledWith({
      user_id: 'admin-1',
      mode: 'generate_steps',
      model: 'claude-sonnet-5',
      input_tokens: 200,
      output_tokens: 80,
      cache_read_tokens: 150,
    })
  })
})
