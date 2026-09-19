import { NextRequest, NextResponse } from 'next/server'
import type Anthropic from '@anthropic-ai/sdk'
import { z } from 'zod'
import { getApiSupabase } from '@/lib/supabase/api'
import { requireUser, authErrorResponse } from '@/lib/auth/require-user'
import { badges, PROMPT_CHALLENGE_XP_PER_STAR } from '@/content/ai-skills'
import { checkPremiumStatus } from '@/db/queries/users'
import { isDemoMode } from '@/db'
import { getClaudeClient, createTutorMessage, getClaudeModel, ClaudeError, type ClaudeErrorKind } from '@/lib/claude'
import { logClaudeUsage } from '@/lib/claude-usage-log'
import { getTodaySAST } from '@/lib/date/today-sast'
import {
  HintRequestSchema,
  type HintRequest,
  type HintMode,
  getModeSpecificPrompt,
  getSystemPromptForMode,
} from './prompts'

const FREE_HINT_LIMIT = 5
const FREE_CAMERA_LIMIT = 1

// A base64 data URL string longer than this is rejected with 413 before
// any DB/model work. 4,000,000 chars comfortably covers a photo
// downscaled to a 1280px long edge at JPEG quality 0.75 (see
// src/lib/image/downscale.ts) while staying well under Vercel's request
// body size limit - base64 inflates binary size by ~4/3, so 4,000,000
// chars is ~3MB of actual image data.
const MAX_IMAGE_BASE64_LENGTH = 4_000_000

// max_tokens per createTutorMessage() call. prompt_evaluation gets more
// room because its response is structured JSON with four free-text
// fields (see PromptEvaluationSchema); every other mode replies with a
// single short (<=80-word, see prompts.ts's ANGELO_SYSTEM_PROMPT rules)
// tutoring nudge.
const PROMPT_EVALUATION_MAX_TOKENS = 400
const HINT_MAX_TOKENS = 150

// Vercel serverless functions default to 10s (Hobby) / 15s (Pro), which a
// vision request (camera_scan) or a slower model response can exceed.
// The SDK client itself times out at 30s with up to 2 retries
// (src/lib/claude.ts) - maxDuration must be comfortably longer than that
// or Vercel would kill the function mid-retry instead of letting the SDK
// give up on its own terms.
export const maxDuration = 60

// Maps a ClaudeError's normalized kind to the HTTP status this route
// returns to the client. rate_limit/timeout/server are all "the model
// service is having trouble, try again shortly" (503); auth (our own
// misconfigured API key) and unknown are treated as an internal error
// (500) - neither is something the student can retry their way out of.
function claudeErrorStatus(kind: ClaudeErrorKind): number {
  switch (kind) {
    case 'rate_limit':
    case 'timeout':
    case 'server':
      return 503
    case 'auth':
    case 'unknown':
    default:
      return 500
  }
}

/**
 * Premium status is never trusted from the client - a request body field
 * was previously read directly (`isPremium` in HintRequestSchema), which
 * let anyone bypass the free-tier daily limits by sending
 * `{ isPremium: true }`. Resolved server-side instead, via the same
 * Drizzle-backed check used elsewhere (checkPremiumStatus). In demo mode
 * (no DATABASE_URL) there is no real user row to check, so premium is
 * always false; any other lookup failure also defaults to false (fail
 * closed on a benefit, not a restriction).
 */
async function resolveIsPremium(userId: string): Promise<boolean> {
  if (isDemoMode) {
    return false
  }

  try {
    return await checkPremiumStatus(userId)
  } catch (error) {
    console.error('Error checking premium status:', error)
    return false
  }
}

// Get or create usage record for today
interface UsageRecord {
  id: string
  hint_count: number
  camera_count: number
}

type UsageLookup =
  | { ok: true; record: UsageRecord | null }
  | { ok: false }

/**
 * Fails CLOSED on an unexpected DB error: only a genuine "no rows found"
 * (PGRST116) is treated as zero usage. Any other error used to be
 * swallowed and also treated as zero usage - which meant a transient DB
 * problem silently bypassed the free-tier daily limit instead of
 * blocking the request. checkFreeTierLimit() (below) returns 503 when
 * `ok` is false rather than proceeding.
 */
async function getUsageRecord(userId: string, today: string): Promise<UsageLookup> {
  const supabase = getApiSupabase()
  if (!supabase) return { ok: true, record: null } // Demo mode

  const { data, error } = await supabase
    .from('ai_hint_usage')
    .select('*')
    .eq('user_id', userId)
    .eq('usage_date', today)
    .single()

  if (error && error.code !== 'PGRST116') {
    // PGRST116 = no rows found, which is fine - anything else is a real
    // failure and must not be treated as "zero usage."
    console.error('Error fetching usage:', error)
    return { ok: false }
  }

  return { ok: true, record: data }
}

/**
 * Reads today's usage for a free-tier user and decides whether the
 * request may proceed. Returns a NextResponse to send immediately when
 * it must be blocked (503 on an unexpected lookup failure - fail closed;
 * 429 once the daily hint/camera-scan limit is reached), or null when
 * the request should continue. Never increments usage itself - that only
 * happens after a response is successfully produced (see
 * incrementUsageRecord()'s doc comment: a failed model call must not
 * consume quota).
 */
async function checkFreeTierLimit(
  userId: string,
  today: string,
  mode: HintMode
): Promise<NextResponse | null> {
  const usageLookup = await getUsageRecord(userId, today)

  if (!usageLookup.ok) {
    return NextResponse.json(
      { error: 'Usage check unavailable, try again' },
      { status: 503 }
    )
  }

  const usageRecord = usageLookup.record
  if (!usageRecord) {
    return null
  }

  if (mode === 'camera_scan') {
    if (usageRecord.camera_count >= FREE_CAMERA_LIMIT) {
      return NextResponse.json(
        {
          error: 'Daily camera scan limit reached',
          message: `You've used your free camera scan today! Come back tomorrow or upgrade to Premium for unlimited scans.`,
          remaining: 0,
          type: 'camera',
        },
        { status: 429 }
      )
    }
    return null
  }

  if (usageRecord.hint_count >= FREE_HINT_LIMIT) {
    return NextResponse.json(
      {
        error: 'Daily AI hint limit reached',
        message: `You've used your ${FREE_HINT_LIMIT} free hints today! Come back tomorrow or upgrade to Premium for unlimited AI help.`,
        remaining: 0,
        type: 'hint',
      },
      { status: 429 }
    )
  }

  return null
}

/**
 * Atomically increments today's hint_count or camera_count for a user via
 * the increment_hint_usage() Postgres function (see
 * supabase/migrations/0002_functions.sql), which does the whole
 * insert-if-missing-or-update-plus-one as one SQL statement
 * (INSERT ... ON CONFLICT (user_id, usage_date) DO UPDATE SET
 * <field> = <field> + 1). A plain "read the row, then write count + 1"
 * from application code (the previous implementation, via
 * updateUsageRecord) is a read-then-write race: two concurrent requests
 * can both read the same starting count and both land on the same
 * incremented value, silently granting an extra hint beyond the daily
 * limit.
 *
 * Callers must invoke this only AFTER a response is actually going to be
 * returned to the student (i.e. after a successful demo-mode response or
 * a successful real model call) - a failed model call must not consume
 * quota. Returns null in demo mode (nothing to persist) or on an
 * unexpected DB error (logged; the response still goes out since the
 * hint/evaluation was already generated - only the "remaining" count
 * display degrades).
 */
async function incrementUsageRecord(
  userId: string,
  today: string,
  mode: HintMode
): Promise<UsageRecord | null> {
  const supabase = getApiSupabase()
  if (!supabase) return null // Demo mode - skip usage tracking

  const field: 'hint_count' | 'camera_count' = mode === 'camera_scan' ? 'camera_count' : 'hint_count'

  const { data, error } = await supabase.rpc('increment_hint_usage', {
    p_user_id: userId,
    p_usage_date: today,
    p_field: field,
  })

  if (error) {
    console.error('Error incrementing usage record:', error)
    return null
  }

  return data as UsageRecord | null
}

/**
 * How many free-tier uses remain today, for display only - the gating
 * decision already happened against the pre-increment usage record in
 * checkFreeTierLimit(), above. Falls back to "this request was the last
 * free one" (1 consumed) when the increment's result is unavailable,
 * matching the previous best-effort behaviour rather than failing the
 * whole response over a display-only number.
 */
function computeRemaining(mode: HintMode, usageRecord: UsageRecord | null): number {
  if (mode === 'camera_scan') {
    return FREE_CAMERA_LIMIT - (usageRecord?.camera_count ?? 1)
  }
  return FREE_HINT_LIMIT - (usageRecord?.hint_count ?? 1)
}

// Validates the JSON the model returns for prompt_evaluation before it is
// ever trusted for persistence/XP: the model is an external, untrusted
// input just like the request body. Caps string lengths generously above
// what the prompt asks for (1-2 sentences) to reject a runaway/adversarial
// response without being brittle about normal-length answers.
const MODEL_FIELD_MAX_LENGTH = 600

const PromptEvaluationSchema = z.object({
  score: z.number().int().min(1).max(5),
  what_worked: z.string().max(MODEL_FIELD_MAX_LENGTH),
  what_to_improve: z.string().max(MODEL_FIELD_MAX_LENGTH),
  improved_prompt: z.string().max(MODEL_FIELD_MAX_LENGTH),
  encouragement: z.string().max(MODEL_FIELD_MAX_LENGTH),
})

type PromptEvaluation = z.infer<typeof PromptEvaluationSchema>

interface PersistedPromptChallengeAttempt {
  id: string
  xpEarned: number
  newBadges: string[]
  totalChallengesCompleted: number
}

/**
 * Idempotent per (user_id, challenge_id) - a UNIQUE constraint on the
 * table backs this up at the DB level (see
 * supabase/migrations/0001_rls.sql and prompt_challenge_attempts in
 * schema.ts). Without this, calling the same challenge twice (a retry, a
 * duplicated request, or a student redoing a challenge) inserted a second
 * row and awarded XP/a badge a second time.
 *
 * Simplest-acceptable policy (matches what the security review signed
 * off on): XP and the prompt-master badge are awarded once, on the
 * FIRST completion of a given challenge. A later attempt only updates
 * the stored row when it beats the previous best score - it never earns
 * additional XP, never re-awards a badge, and never increments
 * prompt_challenges_completed again. Trade-off: a student who first
 * scores below 5 and later nails a 5/5 on a repeat won't retroactively
 * get the prompt-master badge from that repeat.
 *
 * Persists using the score Angelo just computed server-side in this same
 * request — never a client-supplied score. Returns null when there is
 * nothing to persist (demo mode, or the caller didn't send a challengeId).
 */
async function persistPromptChallengeAttempt(
  userId: string,
  challengeId: string | undefined,
  studentPrompt: string | undefined,
  evaluation: PromptEvaluation
): Promise<PersistedPromptChallengeAttempt | null> {
  const supabase = getApiSupabase()
  if (!supabase || !challengeId) {
    return null
  }

  const { data: existing, error: existingError } = await supabase
    .from('prompt_challenge_attempts')
    .select('id, ai_score, xp_earned')
    .eq('user_id', userId)
    .eq('challenge_id', challengeId)
    .maybeSingle()

  if (existingError) {
    console.error('Error checking existing prompt challenge attempt:', existingError)
    return null
  }

  if (existing) {
    return updateExistingAttempt(supabase, existing, studentPrompt, evaluation)
  }

  return insertFirstAttempt(supabase, userId, challengeId, studentPrompt, evaluation)
}

type SupabaseLike = NonNullable<ReturnType<typeof getApiSupabase>>

async function updateExistingAttempt(
  supabase: SupabaseLike,
  existing: { id: string; ai_score: number | null },
  studentPrompt: string | undefined,
  evaluation: PromptEvaluation
): Promise<PersistedPromptChallengeAttempt> {
  const previousBest = existing.ai_score ?? 0

  if (evaluation.score > previousBest) {
    const { error: updateError } = await supabase
      .from('prompt_challenge_attempts')
      .update({
        student_prompt: studentPrompt || '',
        ai_score: evaluation.score,
        ai_feedback: `${evaluation.what_worked} ${evaluation.what_to_improve}`,
        improved_prompt: evaluation.improved_prompt,
      })
      .eq('id', existing.id)

    if (updateError) {
      console.error('Error updating prompt challenge attempt:', updateError)
    }
  }

  // No XP/badge/completion-count change on a repeat - those are awarded
  // once, on first completion (insertFirstAttempt).
  return { id: existing.id, xpEarned: 0, newBadges: [], totalChallengesCompleted: 0 }
}

async function insertFirstAttempt(
  supabase: SupabaseLike,
  userId: string,
  challengeId: string,
  studentPrompt: string | undefined,
  evaluation: PromptEvaluation
): Promise<PersistedPromptChallengeAttempt | null> {
  const xpEarned = evaluation.score * PROMPT_CHALLENGE_XP_PER_STAR

  const { data: attempt, error: insertError } = await supabase
    .from('prompt_challenge_attempts')
    .insert({
      user_id: userId,
      challenge_id: challengeId,
      student_prompt: studentPrompt || '',
      ai_score: evaluation.score,
      ai_feedback: `${evaluation.what_worked} ${evaluation.what_to_improve}`,
      improved_prompt: evaluation.improved_prompt,
      xp_earned: xpEarned,
    })
    .select('id')
    .single()

  if (insertError || !attempt) {
    console.error('Error saving prompt challenge attempt:', insertError)
    return null
  }

  const { data: userData, error: fetchError } = await supabase
    .from('users')
    .select('badges, xp, prompt_challenges_completed')
    .eq('id', userId)
    .single()

  if (fetchError || !userData) {
    console.error('Error fetching user for prompt challenge attempt:', fetchError)
    return { id: attempt.id, xpEarned, newBadges: [], totalChallengesCompleted: 0 }
  }

  const currentBadges: string[] = userData.badges || []
  const currentXP: number = userData.xp || 0
  const challengesCompleted: number = userData.prompt_challenges_completed || 0
  const newBadges: string[] = []

  if (evaluation.score === 5 && !currentBadges.includes('prompt-master')) {
    newBadges.push('prompt-master')
  }

  let totalXpEarned = xpEarned
  for (const badgeId of newBadges) {
    totalXpEarned += badges[badgeId as keyof typeof badges]?.xpReward || 0
  }

  const { error: updateError } = await supabase
    .from('users')
    .update({
      xp: currentXP + totalXpEarned,
      badges: [...currentBadges, ...newBadges],
      prompt_challenges_completed: challengesCompleted + 1,
    })
    .eq('id', userId)

  if (updateError) {
    console.error('Error updating user after prompt challenge attempt:', updateError)
  }

  return {
    id: attempt.id,
    xpEarned: totalXpEarned,
    newBadges,
    totalChallengesCompleted: challengesCompleted + 1,
  }
}

interface DemoResponse {
  responseBody: Record<string, unknown>
  /**
   * Whether this mode's demo response includes a `remaining` quota
   * count. Matches the pre-refactor behaviour: prompt_evaluation/
   * cv_help/general_question never reported it (even though they still
   * consumed quota) - only the plain hint modes (step_hint, wrong_answer,
   * camera_scan) do.
   */
  reportsRemaining: boolean
}

/**
 * Builds the demo-mode response body AND records usage for it - demo
 * responses always "succeed" (there is no real model call that can
 * fail), so usage is recorded once the content is decided, same
 * "only after success" rule the real-model path follows in POST.
 */
async function buildAndTrackDemoResponse(
  mode: HintMode,
  body: HintRequest,
  userId: string,
  isPremium: boolean,
  today: string
): Promise<Record<string, unknown>> {
  const { responseBody, reportsRemaining } = await buildDemoResponse(mode, body, userId)

  if (!isPremium) {
    const usageRecord = await incrementUsageRecord(userId, today, mode)
    if (reportsRemaining) {
      responseBody.remaining = computeRemaining(mode, usageRecord)
    }
  }

  return responseBody
}

/**
 * Builds the canned response for demo mode (no ANTHROPIC_API_KEY) for a
 * given mode - the "helpful mock response, without hollow affirmations"
 * every mode falls back to. prompt_evaluation also persists a demo
 * prompt-challenge attempt, same as the real-model path does.
 */
async function buildDemoResponse(
  mode: HintMode,
  body: HintRequest,
  userId: string
): Promise<DemoResponse> {
  if (mode === 'prompt_evaluation') {
    const mockEvaluation = {
      score: 3,
      what_worked: "You identified the general topic and asked for help.",
      what_to_improve: "Add more context about your situation, specify the format you want, and include any constraints.",
      improved_prompt: `I'm a Grade 11 student preparing for my ${body.scenarioContext?.includes('Maths') ? 'Maths' : 'upcoming'} exam. ${body.studentPrompt} Please give me a structured study plan with specific steps I can follow in the next 2 hours.`,
      encouragement: "You're thinking about how to ask — that alone puts you ahead of most students.",
    }

    const attempt = await persistPromptChallengeAttempt(
      userId,
      body.challengeId,
      body.studentPrompt,
      mockEvaluation
    )

    return {
      responseBody: {
        evaluation: mockEvaluation,
        isDemo: true,
        ...(attempt ? { attempt } : {}),
      },
      reportsRemaining: false,
    }
  }

  if (mode === 'cv_help') {
    return {
      responseBody: {
        hint: "Proficient in AI-assisted research and problem-solving. Experienced in crafting effective prompts to extract useful information from AI tools. Committed to ethical AI use and continuous learning in this rapidly evolving field.",
        isDemo: true,
      },
      reportsRemaining: false,
    }
  }

  if (mode === 'general_question') {
    return {
      responseBody: {
        hint: "AI works by predicting what comes next based on patterns it learned from text. It doesn't actually 'understand' — it matches patterns. That's why it can sound confident even when wrong. Your job is to verify anything important.",
        isDemo: true,
      },
      reportsRemaining: false,
    }
  }

  const mockResponses: Record<string, string[]> = {
    step_hint: [
      `Let's think about this step by step. What do you already know about the problem? Sometimes writing out what we know helps us see the path forward.`,
      `You're on the right track! Remember, in maths we often need to identify what type of problem this is first. Is it a reduction formula? An identity? That'll tell us which tool to use.`,
      `This trips up many students! Try drawing a quick sketch or writing out the given information. What does the question actually want us to find?`,
    ],
    wrong_answer: [
      `I see what happened there — you made a common mistake. Let's think about why "${body.selectedAnswer}" doesn't work here. What happens if you plug that answer back into the original equation?`,
      `Close! The key thing you might have missed is checking which quadrant we're in. Remember CAST? That tells us the sign of our answer. Try again with that in mind!`,
      `Almost there! This looks like a straightforward calculation, but there's a subtlety. What if you tried working backwards from the correct answer to see the pattern?`,
    ],
    camera_scan: [
      `I can see you've got a maths problem there! This looks like algebraic manipulation. Start by identifying all the terms — what do you need to solve for?`,
      `Nice, that's a geometry problem! First step: label everything you know on the diagram. What relationships can you spot between the angles or sides?`,
      `I see this is a trig problem. Remember to check: is this asking for an angle or a ratio? That determines which approach we use. What do you think?`,
    ],
  }

  const responses = mockResponses[mode] || mockResponses.step_hint
  const randomHint = responses[Math.floor(Math.random() * responses.length)]

  return {
    responseBody: { hint: randomHint, isDemo: true },
    reportsRemaining: true,
  }
}

/** Builds the Anthropic messages array for a request - a vision message
 * (image + text) for camera_scan with an image attached, text-only
 * otherwise. */
function buildMessages(
  mode: HintMode,
  imageBase64: string | undefined,
  body: HintRequest
): Anthropic.MessageParam[] {
  if (mode === 'camera_scan' && imageBase64) {
    return [
      {
        role: 'user',
        content: [
          {
            type: 'image',
            source: {
              type: 'base64',
              media_type: 'image/jpeg',
              data: imageBase64.replace(/^data:image\/\w+;base64,/, ''),
            },
          },
          {
            type: 'text',
            text: getModeSpecificPrompt(body),
          },
        ],
      },
    ]
  }

  return [{ role: 'user', content: getModeSpecificPrompt(body) }]
}

/**
 * Parses, validates, and persists the model's prompt_evaluation JSON
 * response. The model's output is untrusted input, exactly like the
 * request body: a malformed or out-of-range value (e.g. score: 99) must
 * never be persisted or earn XP. Any parse/validation failure falls back
 * to a canned response, flagged with parseError so the client knows
 * nothing was saved. Returns the response body to send (always 200 -
 * both the fallback and success shapes are "the request succeeded, here
 * is what came of it").
 */
async function handlePromptEvaluation(
  aiResponse: string,
  userId: string,
  body: HintRequest,
  remaining: number | string
): Promise<Record<string, unknown>> {
  const fallbackEvaluation: PromptEvaluation = {
    score: 3,
    what_worked: "Your prompt shows effort",
    what_to_improve: "Try being more specific about context and format",
    improved_prompt: body.studentPrompt || '',
    encouragement: "Keep practising — prompt engineering is a skill that improves with use.",
  }

  let rawEvaluation: unknown = null
  try {
    // Extract JSON from response (in case it's wrapped in markdown code blocks)
    const jsonMatch = aiResponse.match(/\{[\s\S]*\}/)
    rawEvaluation = jsonMatch ? JSON.parse(jsonMatch[0]) : null
  } catch (parseError) {
    console.error('Error parsing model evaluation JSON:', parseError)
    rawEvaluation = null
  }

  const validation = PromptEvaluationSchema.safeParse(rawEvaluation)

  if (!validation.success) {
    console.error('Model evaluation failed validation:', validation.error.issues)
    return { evaluation: fallbackEvaluation, remaining, parseError: true }
  }

  const evaluation = validation.data
  const attempt = await persistPromptChallengeAttempt(userId, body.challengeId, body.studentPrompt, evaluation)

  return { evaluation, remaining, ...(attempt ? { attempt } : {}) }
}

type ParsedHintRequest =
  | { ok: true; body: HintRequest }
  | { ok: false; response: NextResponse }

/** Zod-validates the raw request body against HintRequestSchema. */
function parseHintRequestBody(rawBody: unknown): ParsedHintRequest {
  const parseResult = HintRequestSchema.safeParse(rawBody)

  if (!parseResult.success) {
    return {
      ok: false,
      response: NextResponse.json(
        {
          error: 'Invalid request',
          details: parseResult.error.issues.map(i => ({
            field: i.path.join('.'),
            message: i.message,
          })),
        },
        { status: 400 }
      ),
    }
  }

  return { ok: true, body: parseResult.data }
}

/**
 * Server-side backstop for the client-side downscale (CameraScan.tsx +
 * src/lib/image/downscale.ts) - protects against a client that skips it
 * (stale cached bundle, direct API call). Returns a 413 response when
 * imageBase64 is oversized, null otherwise.
 */
function oversizedImageResponse(imageBase64: string | undefined): NextResponse | null {
  if (imageBase64 && imageBase64.length > MAX_IMAGE_BASE64_LENGTH) {
    return NextResponse.json(
      {
        error: 'Image too large',
        message: 'That photo is too large to send. Please retake it or crop it closer to the question and try again.',
      },
      { status: 413 }
    )
  }
  return null
}

type ModelCallResult =
  | { ok: true; aiResponse: string }
  | { ok: false; errorResponse: NextResponse }

/**
 * Calls Anthropic via the shared helper (src/lib/claude.ts) for a
 * non-demo request: builds the messages/system prompt/max_tokens, logs
 * usage (fire-and-forget) on success, and maps a thrown ClaudeError to
 * the HTTP status/body this route returns on failure.
 */
async function callModel(
  mode: HintMode,
  locale: 'en' | 'af',
  body: HintRequest,
  imageBase64: string | undefined,
  userId: string
): Promise<ModelCallResult> {
  const messages = buildMessages(mode, imageBase64, body)
  const systemPrompt = getSystemPromptForMode(mode, locale)
  const maxTokens = mode === 'prompt_evaluation' ? PROMPT_EVALUATION_MAX_TOKENS : HINT_MAX_TOKENS

  try {
    const result = await createTutorMessage({ system: systemPrompt, messages, maxTokens })
    // Fire-and-forget: never awaited, never allowed to fail this
    // response - see logClaudeUsage()'s doc comment.
    logClaudeUsage({ userId, mode, model: getClaudeModel(), usage: result.usage })
    return { ok: true, aiResponse: result.text }
  } catch (error) {
    console.error('Anthropic API error:', error)
    const status = error instanceof ClaudeError ? claudeErrorStatus(error.kind) : 500
    return { ok: false, errorResponse: NextResponse.json({ error: 'Failed to get AI hint' }, { status }) }
  }
}

export async function POST(request: NextRequest) {
  let user
  try {
    user = await requireUser()
  } catch (err) {
    return authErrorResponse(err)
  }

  try {
    const rawBody = await request.json()

    const parsed = parseHintRequestBody(rawBody)
    if (!parsed.ok) {
      return parsed.response
    }

    const body = parsed.body
    const userId = user.id
    const { mode, imageBase64, locale } = body

    const oversized = oversizedImageResponse(imageBase64)
    if (oversized) {
      return oversized
    }

    const isPremium = await resolveIsPremium(userId)

    // "Today" in SAST (Africa/Johannesburg), never UTC - the free-tier
    // daily limit resets at SAST midnight, not 02:00 SAST (UTC midnight).
    const today = getTodaySAST()

    if (!isPremium) {
      const limitResponse = await checkFreeTierLimit(userId, today, mode)
      if (limitResponse) {
        return limitResponse
      }
    }

    const claudeClient = getClaudeClient()
    if (!claudeClient) {
      const responseBody = await buildAndTrackDemoResponse(mode, body, userId, isPremium, today)
      return NextResponse.json(responseBody)
    }

    const modelResult = await callModel(mode, locale, body, imageBase64, userId)
    if (!modelResult.ok) {
      return modelResult.errorResponse
    }

    // The model call above succeeded - only now is usage recorded (see
    // incrementUsageRecord()'s doc comment: a failed call must not
    // consume quota, so this could not happen any earlier).
    let remaining: number | string = 'unlimited'
    if (!isPremium) {
      const usageRecord = await incrementUsageRecord(userId, today, mode)
      remaining = computeRemaining(mode, usageRecord)
    }

    if (mode === 'prompt_evaluation') {
      return NextResponse.json(
        await handlePromptEvaluation(modelResult.aiResponse, userId, body, remaining)
      )
    }

    return NextResponse.json({
      hint: modelResult.aiResponse || 'Sorry, I couldn\'t generate a response right now. Try again!',
      remaining,
    })
  } catch (error) {
    console.error('AI hint error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
