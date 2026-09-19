import type Anthropic from '@anthropic-ai/sdk'
import { getApiSupabase } from '@/lib/supabase/api'

export interface LogClaudeUsageArgs {
  userId: string
  mode: string
  model: string
  usage: Anthropic.Usage
}

/**
 * Fire-and-forget insert into ai_usage_log after a successful
 * createTutorMessage() call, for after-the-fact spend visibility (see
 * DEPLOYMENT.md "Monthly spend cap" - the Anthropic console spend limit
 * is the actual enforcement backstop; this table does not and cannot
 * prevent overspend, it just makes it visible).
 *
 * Deliberately synchronous (returns void, not a Promise) - callers
 * (api/ai-hint/route.ts, api/admin/generate-steps/route.ts) must not
 * await this on the response's critical path, so a slow or failing
 * insert never delays or breaks a response the student is waiting on.
 * Errors are still logged server-side, so a systemic problem (e.g. the
 * ai_usage_log table/migration missing) stays visible in logs even
 * though it can't fail the request.
 *
 * No-op in demo mode (no Supabase configured) - there is nothing to log
 * to, same as every other Supabase write in this app when
 * getApiSupabase() returns null.
 */
export function logClaudeUsage({ userId, mode, model, usage }: LogClaudeUsageArgs): void {
  const supabase = getApiSupabase()
  if (!supabase) return

  // The whole thing is wrapped in try/catch, not just the async .then()
  // branch below: a synchronous throw from the client (a malformed
  // client, or - in tests - a strict mock) must be just as harmless to
  // the caller as an async insert error. Nothing here may ever reach the
  // caller as a thrown exception.
  try {
    // Wrapped in Promise.resolve(): the Supabase query builder returns a
    // thenable (PromiseLike), not a full Promise, so it has no .catch()
    // of its own - Promise.resolve() upgrades it to a real Promise.
    Promise.resolve(
      supabase.from('ai_usage_log').insert({
        user_id: userId,
        mode,
        model,
        input_tokens: usage.input_tokens ?? 0,
        output_tokens: usage.output_tokens ?? 0,
        cache_read_tokens: usage.cache_read_input_tokens ?? 0,
      })
    )
      .then(({ error }: { error: unknown }) => {
        if (error) {
          console.error('Error logging AI usage:', error)
        }
      })
      // The Supabase client normally resolves with { error } rather than
      // rejecting, but this .catch() covers the case where the returned
      // promise itself rejects (a lower-level network/transport failure) -
      // without it, that rejection is unhandled: Node logs a scary
      // "UnhandledPromiseRejection" (and, depending on version/flags, can
      // crash the process) for something that is, by design, not supposed
      // to affect the request at all.
      .catch((error: unknown) => {
        console.error('Error logging AI usage:', error)
      })
  } catch (error) {
    console.error('Error logging AI usage:', error)
  }
}
