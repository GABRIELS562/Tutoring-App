// @vitest-environment node
//
// This module only ever runs server-side (API routes), and the real
// Anthropic SDK client refuses to construct in a browser-like global
// scope (jsdom, the project's default test environment) unless
// dangerouslyAllowBrowser is set - which would be the wrong fix here,
// since this code never runs in a browser. Run this file under vitest's
// node environment instead.
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import Anthropic from '@anthropic-ai/sdk'

const ORIGINAL_ENV = { ...process.env }

describe('src/lib/claude.ts', () => {
  beforeEach(() => {
    vi.resetModules()
    process.env = { ...ORIGINAL_ENV }
    delete process.env.ANTHROPIC_API_KEY
    delete process.env.ANTHROPIC_MODEL
  })

  afterEach(() => {
    process.env = { ...ORIGINAL_ENV }
  })

  describe('getClaudeClient', () => {
    it('returns null when ANTHROPIC_API_KEY is unset', async () => {
      const { getClaudeClient } = await import('@/lib/claude')
      expect(getClaudeClient()).toBeNull()
    })

    it('returns a client instance when ANTHROPIC_API_KEY is set', async () => {
      process.env.ANTHROPIC_API_KEY = 'sk-test-key'
      const { getClaudeClient } = await import('@/lib/claude')
      expect(getClaudeClient()).not.toBeNull()
    })

    it('returns the same singleton instance across calls', async () => {
      process.env.ANTHROPIC_API_KEY = 'sk-test-key'
      const { getClaudeClient } = await import('@/lib/claude')
      const first = getClaudeClient()
      const second = getClaudeClient()
      expect(first).toBe(second)
    })
  })

  describe('getClaudeModel', () => {
    it('defaults to claude-sonnet-5 when ANTHROPIC_MODEL is unset', async () => {
      const { getClaudeModel } = await import('@/lib/claude')
      expect(getClaudeModel()).toBe('claude-sonnet-5')
    })

    it('reads ANTHROPIC_MODEL when set', async () => {
      process.env.ANTHROPIC_MODEL = 'claude-haiku-4-5'
      const { getClaudeModel } = await import('@/lib/claude')
      expect(getClaudeModel()).toBe('claude-haiku-4-5')
    })
  })

  describe('createTutorMessage', () => {
    beforeEach(() => {
      process.env.ANTHROPIC_API_KEY = 'sk-test-key'
    })

    async function setup() {
      const mod = await import('@/lib/claude')
      const client = mod.getClaudeClient()!
      const createSpy = vi.spyOn(client.messages, 'create')
      return { ...mod, createSpy }
    }

    it('builds the request with a cached system prompt block and returns text/usage', async () => {
      const { createTutorMessage, createSpy } = await setup()
      createSpy.mockResolvedValueOnce({
        content: [{ type: 'text', text: 'Hello there' }],
        usage: { input_tokens: 10, output_tokens: 5 },
      } as Anthropic.Message)

      const result = await createTutorMessage({
        system: 'You are Angelo.',
        messages: [{ role: 'user', content: 'Help me with algebra' }],
        maxTokens: 150,
      })

      expect(result).toEqual({
        text: 'Hello there',
        usage: { input_tokens: 10, output_tokens: 5 },
      })

      expect(createSpy).toHaveBeenCalledTimes(1)
      const requestArg = createSpy.mock.calls[0][0]

      expect(requestArg.model).toBe('claude-sonnet-5')
      expect(requestArg.max_tokens).toBe(150)
      expect(requestArg.messages).toEqual([
        { role: 'user', content: 'Help me with algebra' },
      ])
      expect(requestArg.system).toEqual([
        {
          type: 'text',
          text: 'You are Angelo.',
          cache_control: { type: 'ephemeral' },
        },
      ])
    })

    it('uses ANTHROPIC_MODEL when set', async () => {
      process.env.ANTHROPIC_MODEL = 'claude-haiku-4-5'
      const { createTutorMessage, createSpy } = await setup()
      createSpy.mockResolvedValueOnce({
        content: [{ type: 'text', text: 'hi' }],
        usage: { input_tokens: 1, output_tokens: 1 },
      } as Anthropic.Message)

      await createTutorMessage({
        system: 'sys',
        messages: [{ role: 'user', content: 'hi' }],
        maxTokens: 50,
      })

      const requestArg = createSpy.mock.calls[0][0]
      expect(requestArg.model).toBe('claude-haiku-4-5')
    })

    it('concatenates multiple text blocks in the response', async () => {
      const { createTutorMessage, createSpy } = await setup()
      createSpy.mockResolvedValueOnce({
        content: [
          { type: 'text', text: 'Part one. ' },
          { type: 'text', text: 'Part two.' },
        ],
        usage: { input_tokens: 1, output_tokens: 1 },
      } as Anthropic.Message)

      const result = await createTutorMessage({
        system: 'sys',
        messages: [{ role: 'user', content: 'hi' }],
        maxTokens: 50,
      })

      expect(result.text).toBe('Part one. Part two.')
    })

    it('throws a ClaudeError with kind "auth" when no API key is configured', async () => {
      delete process.env.ANTHROPIC_API_KEY

      const { createTutorMessage, ClaudeError } = await import('@/lib/claude')

      const error = await createTutorMessage({
        system: 'sys',
        messages: [],
        maxTokens: 50,
      }).catch((e) => e)

      expect(error).toBeInstanceOf(ClaudeError)
      expect(error.kind).toBe('auth')
    })

    it('maps AuthenticationError to ClaudeError kind "auth"', async () => {
      const { createTutorMessage, ClaudeError, createSpy } = await setup()
      createSpy.mockRejectedValueOnce(
        new Anthropic.AuthenticationError(401, {}, 'Invalid API key', new Headers())
      )

      const error = await createTutorMessage({
        system: 'sys',
        messages: [],
        maxTokens: 50,
      }).catch((e) => e)

      expect(error).toBeInstanceOf(ClaudeError)
      expect(error.kind).toBe('auth')
      expect(error.status).toBe(401)
    })

    it('maps RateLimitError to ClaudeError kind "rate_limit"', async () => {
      const { createTutorMessage, ClaudeError, createSpy } = await setup()
      createSpy.mockRejectedValueOnce(
        new Anthropic.RateLimitError(429, {}, 'Rate limited', new Headers())
      )

      const error = await createTutorMessage({
        system: 'sys',
        messages: [],
        maxTokens: 50,
      }).catch((e) => e)

      expect(error).toBeInstanceOf(ClaudeError)
      expect(error.kind).toBe('rate_limit')
      expect(error.status).toBe(429)
    })

    it('maps APIConnectionTimeoutError to ClaudeError kind "timeout"', async () => {
      const { createTutorMessage, ClaudeError, createSpy } = await setup()
      createSpy.mockRejectedValueOnce(
        new Anthropic.APIConnectionTimeoutError({ message: 'Request timed out.' })
      )

      const error = await createTutorMessage({
        system: 'sys',
        messages: [],
        maxTokens: 50,
      }).catch((e) => e)

      expect(error).toBeInstanceOf(ClaudeError)
      expect(error.kind).toBe('timeout')
    })

    it('maps InternalServerError to ClaudeError kind "server"', async () => {
      const { createTutorMessage, ClaudeError, createSpy } = await setup()
      createSpy.mockRejectedValueOnce(
        new Anthropic.InternalServerError(500, {}, 'Overloaded', new Headers())
      )

      const error = await createTutorMessage({
        system: 'sys',
        messages: [],
        maxTokens: 50,
      }).catch((e) => e)

      expect(error).toBeInstanceOf(ClaudeError)
      expect(error.kind).toBe('server')
      expect(error.status).toBe(500)
    })

    it('maps a plain connection error to ClaudeError kind "server"', async () => {
      const { createTutorMessage, ClaudeError, createSpy } = await setup()
      createSpy.mockRejectedValueOnce(
        new Anthropic.APIConnectionError({ message: 'ECONNRESET' })
      )

      const error = await createTutorMessage({
        system: 'sys',
        messages: [],
        maxTokens: 50,
      }).catch((e) => e)

      expect(error).toBeInstanceOf(ClaudeError)
      expect(error.kind).toBe('server')
    })

    it('maps an unrecognized error to ClaudeError kind "unknown"', async () => {
      const { createTutorMessage, ClaudeError, createSpy } = await setup()
      createSpy.mockRejectedValueOnce(new Error('something exploded'))

      const error = await createTutorMessage({
        system: 'sys',
        messages: [],
        maxTokens: 50,
      }).catch((e) => e)

      expect(error).toBeInstanceOf(ClaudeError)
      expect(error.kind).toBe('unknown')
    })
  })
})
