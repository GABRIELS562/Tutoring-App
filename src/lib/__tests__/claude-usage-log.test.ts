import { describe, it, expect, vi, beforeEach } from 'vitest'

const getApiSupabaseMock = vi.fn()

vi.mock('@/lib/supabase/api', () => ({
  getApiSupabase: getApiSupabaseMock,
}))

const { logClaudeUsage } = await import('@/lib/claude-usage-log')

describe('logClaudeUsage', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('is a no-op in demo mode (no Supabase configured)', () => {
    getApiSupabaseMock.mockReturnValue(null)

    expect(() =>
      logClaudeUsage({
        userId: 'user-1',
        mode: 'step_hint',
        model: 'claude-sonnet-5',
        usage: { input_tokens: 10, output_tokens: 5, cache_read_input_tokens: 0 } as never,
      })
    ).not.toThrow()
  })

  it('inserts a row into ai_usage_log with the mapped token fields, without being awaited', () => {
    const insertMock = vi.fn().mockReturnValue(Promise.resolve({ error: null }))
    getApiSupabaseMock.mockReturnValue({
      from: vi.fn((table: string) => {
        if (table === 'ai_usage_log') {
          return { insert: insertMock }
        }
        throw new Error(`Unexpected table: ${table}`)
      }),
    })

    // Deliberately not awaited by the caller here either - this is the
    // fire-and-forget contract callers (api/ai-hint, admin/generate-steps)
    // rely on: it must not return a Promise the caller is expected to await
    // on the request's critical path.
    const result = logClaudeUsage({
      userId: 'user-1',
      mode: 'step_hint',
      model: 'claude-sonnet-5',
      usage: {
        input_tokens: 120,
        output_tokens: 40,
        cache_read_input_tokens: 80,
      } as never,
    })

    expect(result).toBeUndefined()
    expect(insertMock).toHaveBeenCalledWith({
      user_id: 'user-1',
      mode: 'step_hint',
      model: 'claude-sonnet-5',
      input_tokens: 120,
      output_tokens: 40,
      cache_read_tokens: 80,
    })
  })

  it('defaults missing/null token counts to 0', () => {
    const insertMock = vi.fn().mockReturnValue(Promise.resolve({ error: null }))
    getApiSupabaseMock.mockReturnValue({
      from: vi.fn(() => ({ insert: insertMock })),
    })

    logClaudeUsage({
      userId: 'user-1',
      mode: 'camera_scan',
      model: 'claude-sonnet-5',
      usage: { input_tokens: 5, output_tokens: 2, cache_read_input_tokens: null } as never,
    })

    expect(insertMock).toHaveBeenCalledWith(
      expect.objectContaining({ cache_read_tokens: 0 })
    )
  })

  it('logs but does not throw when the insert itself fails', async () => {
    const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
    const insertMock = vi.fn().mockReturnValue(
      Promise.resolve({ error: { message: 'relation "ai_usage_log" does not exist' } })
    )
    getApiSupabaseMock.mockReturnValue({
      from: vi.fn(() => ({ insert: insertMock })),
    })

    logClaudeUsage({
      userId: 'user-1',
      mode: 'step_hint',
      model: 'claude-sonnet-5',
      usage: { input_tokens: 1, output_tokens: 1, cache_read_input_tokens: 0 } as never,
    })

    // Flush the microtask queue so the fire-and-forget .then() runs.
    await Promise.resolve()
    await Promise.resolve()

    expect(consoleErrorSpy).toHaveBeenCalledWith(
      'Error logging AI usage:',
      expect.objectContaining({ message: expect.stringContaining('ai_usage_log') })
    )
  })

  it('does not throw when the Supabase client itself throws synchronously', () => {
    const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
    getApiSupabaseMock.mockReturnValue({
      from: vi.fn(() => {
        throw new Error('boom')
      }),
    })

    expect(() =>
      logClaudeUsage({
        userId: 'user-1',
        mode: 'step_hint',
        model: 'claude-sonnet-5',
        usage: { input_tokens: 1, output_tokens: 1, cache_read_input_tokens: 0 } as never,
      })
    ).not.toThrow()

    expect(consoleErrorSpy).toHaveBeenCalledWith('Error logging AI usage:', expect.any(Error))
  })
})
