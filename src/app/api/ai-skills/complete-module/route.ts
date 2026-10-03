import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { getApiSupabase } from '@/lib/supabase/api'
import { moduleOrder, badges, AI_MODULE_XP, ALL_MODULES_BONUS_XP } from '@/content/ai-skills'
import { requireUser, authErrorResponse } from '@/lib/auth/require-user'
import { completeAiModule } from '@/db/queries/ai-skills'

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

    const moduleBadgeMap: Record<string, string> = {
      'ai-what-is': 'ai-explorer',
      'ai-prompts': 'prompt-pro',
      'ai-study': 'study-hacker',
      'ai-ethics': 'integrity-aware',
      'ai-careers': 'career-ready',
    }
    const badgeId = moduleBadgeMap[moduleId]

    // One locked transaction rather than SELECT-then-UPDATE. The old shape
    // let two concurrent requests both read a module list that did not yet
    // contain this module, both take the "first completion" branch, and the
    // second write overwrite the first - duplicating a badge, and losing a
    // different module's XP outright when two finished at once.
    const result = await completeAiModule({
      userId,
      moduleId,
      badgeId,
      moduleXp: AI_MODULE_XP,
      badgeXp: badgeId ? badges[badgeId as keyof typeof badges]?.xpReward || 0 : 0,
      allModuleIds: moduleOrder,
      completionBadgeId: 'ai-literate',
      completionBonusXp: ALL_MODULES_BONUS_XP,
    })

    if (!result) {
      return NextResponse.json({ error: 'Failed to save progress' }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      xpEarned: result.xpEarned,
      newBadges: result.newBadges,
      alreadyCompleted: result.alreadyCompleted,
    })
  } catch (error) {
    console.error('Complete module error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
