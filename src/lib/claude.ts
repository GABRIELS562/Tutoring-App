import Anthropic from '@anthropic-ai/sdk'

/**
 * Single shared Anthropic SDK client for the whole app. Every AI route
 * (ai-hint, admin/generate-steps) goes through this module instead of
 * constructing its own `fetch(ANTHROPIC_API_URL, ...)` call, so the model
 * id, timeout, retry policy, and error handling live in exactly one place.
 *
 * Returns null when ANTHROPIC_API_KEY is unset - callers use that as the
 * "demo mode" signal, same as the rest of this codebase's layered demo
 * mode (see CLAUDE.md's demo-mode table).
 */
let _client: Anthropic | null = null

// Generous enough for a multi-hundred-word tutoring reply, short enough
// that a hung request fails fast instead of holding a Vercel function
// open until its own maxDuration (see the `export const maxDuration = 60`
// comment on the route files that call this module).
const REQUEST_TIMEOUT_MS = 30_000

// The SDK's own default (retries 408/409/429/5xx and connection errors).
// Named here so both getClaudeClient() and this comment stay the single
// source of truth for the value, instead of a magic number.
const MAX_RETRIES = 2

const DEFAULT_MODEL = 'claude-sonnet-5'

export function getClaudeClient(): Anthropic | null {
  const apiKey = process.env.ANTHROPIC_API_KEY

  if (!apiKey) {
    return null
  }

  if (!_client) {
    _client = new Anthropic({
      apiKey,
      timeout: REQUEST_TIMEOUT_MS,
      maxRetries: MAX_RETRIES,
    })
  }

  return _client
}

/**
 * The model id every AI route should use. `ANTHROPIC_MODEL` lets an
 * operator switch models (e.g. down to a cheaper one) without a code
 * change; unset, it defaults to the current tutor model.
 */
export function getClaudeModel(): string {
  return process.env.ANTHROPIC_MODEL || DEFAULT_MODEL
}

export type ClaudeErrorKind = 'auth' | 'rate_limit' | 'timeout' | 'server' | 'unknown'

/**
 * Normalized error shape every caller of createTutorMessage() can branch
 * on without importing SDK error classes themselves. `status` is the
 * HTTP status when the SDK error carried one (network/timeout errors
 * don't have one).
 */
export class ClaudeError extends Error {
  kind: ClaudeErrorKind
  status?: number

  constructor(kind: ClaudeErrorKind, message: string, status?: number) {
    super(message)
    this.name = 'ClaudeError'
    this.kind = kind
    this.status = status
  }
}

/**
 * Maps an SDK error (or anything else thrown/rejected) to a ClaudeError.
 * Ordered most-specific-first, per the SDK's own error class hierarchy
 * (APIConnectionTimeoutError extends APIConnectionError extends
 * APIError) - checking APIConnectionError before APIConnectionTimeoutError
 * would swallow every timeout as a generic connection error.
 */
function mapClaudeError(error: unknown): ClaudeError {
  if (error instanceof Anthropic.APIConnectionTimeoutError) {
    return new ClaudeError('timeout', error.message)
  }

  if (error instanceof Anthropic.AuthenticationError) {
    return new ClaudeError('auth', error.message, error.status)
  }

  if (error instanceof Anthropic.PermissionDeniedError) {
    return new ClaudeError('auth', error.message, error.status)
  }

  if (error instanceof Anthropic.RateLimitError) {
    return new ClaudeError('rate_limit', error.message, error.status)
  }

  // Base APIConnectionError (network failure that isn't specifically a
  // timeout) and InternalServerError (5xx) are both "something is wrong
  // reaching/running the model service, retry later" - same bucket as
  // far as a caller deciding what to tell the student.
  if (error instanceof Anthropic.APIConnectionError) {
    return new ClaudeError('server', error.message)
  }

  if (error instanceof Anthropic.InternalServerError) {
    return new ClaudeError('server', error.message, error.status)
  }

  // Any other APIError (400 bad request, 404 model not found, etc.) is
  // an unexpected shape we don't have a specific bucket for - 'unknown'
  // rather than mislabeling it 'server' (which implies "retry later").
  if (error instanceof Anthropic.APIError) {
    return new ClaudeError('unknown', error.message, error.status)
  }

  const message = error instanceof Error ? error.message : 'Unknown error calling Claude'
  return new ClaudeError('unknown', message)
}

export interface CreateTutorMessageArgs {
  /** Static system prompt text - cached with cache_control: ephemeral. */
  system: string
  messages: Anthropic.MessageParam[]
  maxTokens: number
}

export interface CreateTutorMessageResult {
  text: string
  usage: Anthropic.Usage
}

/**
 * Calls the Anthropic Messages API for a tutoring turn. The system prompt
 * is sent as its own cached content block (`cache_control: { type:
 * "ephemeral" }`) since every mode's system prompt (see
 * api/ai-hint/prompts.ts) is static per (mode, locale) pair and reused on
 * every request in that mode - an ideal prefix-cache candidate.
 *
 * Throws ClaudeError (never a raw SDK error) so callers can branch on
 * `.kind` without importing `@anthropic-ai/sdk` themselves.
 */
export async function createTutorMessage({
  system,
  messages,
  maxTokens,
}: CreateTutorMessageArgs): Promise<CreateTutorMessageResult> {
  const client = getClaudeClient()

  if (!client) {
    throw new ClaudeError('auth', 'ANTHROPIC_API_KEY is not configured')
  }

  try {
    const response = await client.messages.create({
      model: getClaudeModel(),
      max_tokens: maxTokens,
      system: [
        {
          type: 'text',
          text: system,
          cache_control: { type: 'ephemeral' },
        },
      ],
      messages,
    })

    const text = response.content
      .filter((block): block is Anthropic.TextBlock => block.type === 'text')
      .map((block) => block.text)
      .join('')

    return { text, usage: response.usage }
  } catch (error) {
    throw mapClaudeError(error)
  }
}
