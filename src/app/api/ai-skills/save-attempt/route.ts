import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { getApiSupabase } from '@/lib/supabase/api'
import { badges, PROMPT_CHALLENGE_XP_PER_STAR } from '@/content/ai-skills'
import { requireUser, authErrorResponse } from '@/lib/auth/require-user'

// Zod schema for request validation
const SaveAttemptSchema = z.object({
  challengeId: z.string().min(1, 'challengeId is required'),
  studentPrompt: z.string().min(1, 'studentPrompt is required'),
  aiScore: z.number().min(1).max(5),
  aiFeedback: z.string().optional(),
  improvedPrompt: z.string().optional(),
})

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
    const parseResult = SaveAttemptSchema.safeParse(rawBody)
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

    const userId = user.id
    const { challengeId, studentPrompt, aiScore, aiFeedback, improvedPrompt } = parseResult.data
    const xpEarned = aiScore * PROMPT_CHALLENGE_XP_PER_STAR

    // Get Supabase client
    const supabase = getApiSupabase()

    // Demo mode - Supabase not configured
    if (!supabase) {
      return NextResponse.json({
        success: true,
        xpEarned,
        newBadges: [],
        isDemo: true,
      })
    }

    // Save attempt
    const { error: insertError } = await supabase
      .from('prompt_challenge_attempts')
      .insert({
        user_id: userId,
        challenge_id: challengeId,
        student_prompt: studentPrompt,
        ai_score: aiScore,
        ai_feedback: aiFeedback,
        improved_prompt: improvedPrompt,
        xp_earned: xpEarned,
      })

    if (insertError) {
      console.error('Error saving attempt:', insertError)
      return NextResponse.json(
        { error: 'Failed to save attempt' },
        { status: 500 }
      )
    }

    // Get user data for badge check and XP update
    const { data: userData, error: fetchError } = await supabase
      .from('users')
      .select('badges, xp, prompt_challenges_completed')
      .eq('id', userId)
      .single()

    if (fetchError) {
      console.error('Error fetching user:', fetchError)
      return NextResponse.json({
        success: true,
        xpEarned,
        newBadges: [],
      })
    }

    const currentBadges: string[] = userData.badges || []
    const currentXP: number = userData.xp || 0
    const challengesCompleted: number = userData.prompt_challenges_completed || 0
    const newBadges: string[] = []

    // Check for prompt-master badge (score 5/5)
    if (aiScore === 5 && !currentBadges.includes('prompt-master')) {
      newBadges.push('prompt-master')
    }

    // Calculate total XP including badge rewards
    let totalXpEarned = xpEarned
    for (const badgeId of newBadges) {
      totalXpEarned += badges[badgeId as keyof typeof badges]?.xpReward || 0
    }

    // Update user
    const { error: updateError } = await supabase
      .from('users')
      .update({
        xp: currentXP + totalXpEarned,
        badges: [...currentBadges, ...newBadges],
        prompt_challenges_completed: challengesCompleted + 1,
      })
      .eq('id', userId)

    if (updateError) {
      console.error('Error updating user:', updateError)
    }

    return NextResponse.json({
      success: true,
      xpEarned: totalXpEarned,
      newBadges,
      totalChallengesCompleted: challengesCompleted + 1,
    })
  } catch (error) {
    console.error('Save attempt error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
