import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { getApiSupabase } from '@/lib/supabase/api'
import { moduleOrder, badges, AI_MODULE_XP, ALL_MODULES_BONUS_XP } from '@/content/ai-skills'
import { requireUser, authErrorResponse } from '@/lib/auth/require-user'

// Zod schema for request validation
const CompleteModuleSchema = z.object({
  moduleId: z.enum(['ai-what-is', 'ai-prompts', 'ai-study', 'ai-ethics', 'ai-careers'], {
    message: 'Invalid moduleId',
  }),
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
    const parseResult = CompleteModuleSchema.safeParse(rawBody)
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
    const { moduleId } = parseResult.data

    // Get Supabase client
    const supabase = getApiSupabase()

    // Demo mode - Supabase not configured
    if (!supabase) {
      return NextResponse.json({
        success: true,
        xpEarned: AI_MODULE_XP,
        newBadges: [],
        isDemo: true,
      })
    }

    // Get current user data
    const { data: userData, error: fetchError } = await supabase
      .from('users')
      .select('ai_modules_completed, badges, xp')
      .eq('id', userId)
      .single()

    if (fetchError) {
      console.error('Error fetching user:', fetchError)
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }

    const currentModules: string[] = userData.ai_modules_completed || []
    const currentBadges: string[] = userData.badges || []
    const currentXP: number = userData.xp || 0

    // Check if already completed
    if (currentModules.includes(moduleId)) {
      return NextResponse.json({
        success: true,
        xpEarned: 0,
        newBadges: [],
        alreadyCompleted: true,
      })
    }

    // Add module to completed list
    const updatedModules = [...currentModules, moduleId]
    let xpEarned = AI_MODULE_XP
    const newBadges: string[] = []

    // Award badge for this module
    const moduleBadgeMap: Record<string, string> = {
      'ai-what-is': 'ai-explorer',
      'ai-prompts': 'prompt-pro',
      'ai-study': 'study-hacker',
      'ai-ethics': 'integrity-aware',
      'ai-careers': 'career-ready',
    }

    const badgeId = moduleBadgeMap[moduleId]
    if (badgeId && !currentBadges.includes(badgeId)) {
      newBadges.push(badgeId)
      xpEarned += badges[badgeId as keyof typeof badges]?.xpReward || 0
    }

    // Check if all modules completed
    const allCompleted = moduleOrder.every(id => updatedModules.includes(id))
    if (allCompleted && !currentBadges.includes('ai-literate')) {
      newBadges.push('ai-literate')
      xpEarned += ALL_MODULES_BONUS_XP
    }

    // Update user
    const { error: updateError } = await supabase
      .from('users')
      .update({
        ai_modules_completed: updatedModules,
        badges: [...currentBadges, ...newBadges],
        xp: currentXP + xpEarned,
      })
      .eq('id', userId)

    if (updateError) {
      console.error('Error updating user:', updateError)
      return NextResponse.json(
        { error: 'Failed to save progress' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      xpEarned,
      newBadges,
      totalModulesCompleted: updatedModules.length,
      allCompleted,
    })
  } catch (error) {
    console.error('Complete module error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
