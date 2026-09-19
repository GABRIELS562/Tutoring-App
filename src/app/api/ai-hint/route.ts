import { NextRequest, NextResponse } from 'next/server'
import type Anthropic from '@anthropic-ai/sdk'
import { z } from 'zod'
import { getApiSupabase } from '@/lib/supabase/api'
import { requireUser, authErrorResponse } from '@/lib/auth/require-user'
import { badges, PROMPT_CHALLENGE_XP_PER_STAR } from '@/content/ai-skills'
import { checkPremiumStatus } from '@/db/queries/users'
import { isDemoMode } from '@/db'
import { getClaudeClient, createTutorMessage, ClaudeError, type ClaudeErrorKind } from '@/lib/claude'
import {
  HintRequestSchema,
  type HintMode,
  getModeSpecificPrompt,
  getSystemPromptForMode,
} from './prompts'

const FREE_HINT_LIMIT = 5
const FREE_CAMERA_LIMIT = 1

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
 * blocking the request. The caller doing the rate-limit gate check
 * (POST, below) returns 503 when `ok` is false rather than proceeding.
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

// Create or update usage record
async function updateUsageRecord(
  userId: string,
  today: string,
  mode: HintMode,
  existingRecord: UsageRecord | null
) {
  const supabase = getApiSupabase()
  if (!supabase) return // Demo mode - skip usage tracking

  if (existingRecord) {
    const updates = mode === 'camera_scan'
      ? { camera_count: existingRecord.camera_count + 1, updated_at: new Date().toISOString() }
      : { hint_count: existingRecord.hint_count + 1, updated_at: new Date().toISOString() }

    const { error } = await supabase
      .from('ai_hint_usage')
      .update(updates)
      .eq('id', existingRecord.id)

    if (error) {
      console.error('Error updating usage record:', error)
    }
  } else {
    const newRecord = {
      user_id: userId,
      usage_date: today,
      hint_count: mode === 'camera_scan' ? 0 : 1,
      camera_count: mode === 'camera_scan' ? 1 : 0,
    }

    const { error } = await supabase.from('ai_hint_usage').insert(newRecord)

    if (error) {
      console.error('Error inserting usage record:', error)
    }
  }
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
 * Persists a prompt-challenge attempt using the score Angelo just computed
 * server-side in this same request — never a client-supplied score. This is
 * what /api/ai-skills/save-attempt used to do by trusting a client `aiScore`
 * field; folding it in here removes that trust boundary entirely.
 * Returns null when there is nothing to persist (demo mode, or the caller
 * didn't send a challengeId).
 */
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

export async function POST(request: NextRequest) {
  let user
  try {
    user = await requireUser()
  } catch (err) {
    return authErrorResponse(err)
  }

  try {
    const rawBody = await request.json()

    // Validate request with Zod
    const parseResult = HintRequestSchema.safeParse(rawBody)
    if (!parseResult.success) {
      return NextResponse.json(
        {
          error: 'Invalid request',
          details: parseResult.error.issues.map(i => ({
            field: i.path.join('.'),
            message: i.message,
          })),
        },
        { status: 400 }
      )
    }

    const body = parseResult.data
    const userId = user.id
    const { mode, imageBase64, locale } = body
    const isPremium = await resolveIsPremium(userId)

    const today = new Date().toISOString().split('T')[0]

    // Check rate limit for free tier users
    if (!isPremium) {
      const usageLookup = await getUsageRecord(userId, today)

      if (!usageLookup.ok) {
        // Fail closed: an unexpected DB error must not silently bypass
        // the free-tier daily limit by being treated as "zero usage."
        return NextResponse.json(
          { error: 'Usage check unavailable, try again' },
          { status: 503 }
        )
      }

      const usageRecord = usageLookup.record

      if (usageRecord) {
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
        } else {
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
        }
      }

      // Update usage after rate limit check passes
      await updateUsageRecord(userId, today, mode, usageRecord)
    }

    const claudeClient = getClaudeClient()

    // If no API key, return a helpful mock response (without hollow affirmations)
    if (!claudeClient) {
      // Special handling for prompt_evaluation mode - return structured JSON
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

        return NextResponse.json({
          evaluation: mockEvaluation,
          isDemo: true,
          ...(attempt ? { attempt } : {}),
        })
      }

      // Special handling for cv_help mode
      if (mode === 'cv_help') {
        return NextResponse.json({
          hint: "Proficient in AI-assisted research and problem-solving. Experienced in crafting effective prompts to extract useful information from AI tools. Committed to ethical AI use and continuous learning in this rapidly evolving field.",
          isDemo: true,
        })
      }

      // Special handling for general_question mode
      if (mode === 'general_question') {
        return NextResponse.json({
          hint: "AI works by predicting what comes next based on patterns it learned from text. It doesn't actually 'understand' — it matches patterns. That's why it can sound confident even when wrong. Your job is to verify anything important.",
          isDemo: true,
        })
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

      // Calculate remaining for the response. This is best-effort display
      // info for a request that has already been granted (the rate-limit
      // gate above already ran) - a lookup failure here just falls back
      // to the existing "unknown count" default rather than failing the
      // whole response, unlike the gating check.
      const usageLookupForDisplay = await getUsageRecord(userId, today)
      const usageRecord = usageLookupForDisplay.ok ? usageLookupForDisplay.record : null
      let remaining: number | string = 'unlimited'
      if (!isPremium) {
        if (mode === 'camera_scan') {
          remaining = FREE_CAMERA_LIMIT - (usageRecord?.camera_count || 1)
        } else {
          remaining = FREE_HINT_LIMIT - (usageRecord?.hint_count || 1)
        }
      }

      return NextResponse.json({
        hint: randomHint,
        remaining,
        isDemo: true,
      })
    }

    // Build the messages array
    const messages: Anthropic.MessageParam[] = []

    if (mode === 'camera_scan' && imageBase64) {
      // Vision request with image
      messages.push({
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
      })
    } else {
      // Text-only request
      messages.push({
        role: 'user',
        content: getModeSpecificPrompt(body),
      })
    }

    // Call Anthropic via the shared helper (src/lib/claude.ts): correct
    // model (env-driven, see getClaudeModel()), cached system prompt,
    // SDK-managed timeout/retries.
    const systemPrompt = getSystemPromptForMode(mode, locale)
    const maxTokens = mode === 'prompt_evaluation' ? 400 : 150

    let aiResponse: string
    try {
      const result = await createTutorMessage({
        system: systemPrompt,
        messages,
        maxTokens,
      })
      aiResponse = result.text
    } catch (error) {
      console.error('Anthropic API error:', error)
      const status = error instanceof ClaudeError ? claudeErrorStatus(error.kind) : 500
      return NextResponse.json(
        { error: 'Failed to get AI hint' },
        { status }
      )
    }

    // Calculate remaining for response - best-effort display info for an
    // already-granted, already-completed request; see the comment on the
    // equivalent lookup in the no-API-key branch above.
    const usageLookupForDisplay = await getUsageRecord(userId, today)
    const usageRecord = usageLookupForDisplay.ok ? usageLookupForDisplay.record : null
    let remaining: number | string = 'unlimited'
    if (!isPremium) {
      if (mode === 'camera_scan') {
        remaining = FREE_CAMERA_LIMIT - (usageRecord?.camera_count || 1)
      } else {
        remaining = FREE_HINT_LIMIT - (usageRecord?.hint_count || 1)
      }
    }

    // Handle prompt_evaluation mode - parse and VALIDATE the model's JSON.
    // The model's output is untrusted input, exactly like the request body:
    // a malformed or out-of-range value (e.g. score: 99) must never be
    // persisted or earn XP. Any parse/validation failure falls back to the
    // same canned response, flagged with parseError so the client knows
    // nothing was saved.
    if (mode === 'prompt_evaluation') {
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
        return NextResponse.json({
          evaluation: fallbackEvaluation,
          remaining,
          parseError: true,
        })
      }

      const evaluation = validation.data

      const attempt = await persistPromptChallengeAttempt(
        userId,
        body.challengeId,
        body.studentPrompt,
        evaluation
      )

      return NextResponse.json({
        evaluation,
        remaining,
        ...(attempt ? { attempt } : {}),
      })
    }

    return NextResponse.json({
      hint: aiResponse || 'Sorry, I couldn\'t generate a response right now. Try again!',
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
