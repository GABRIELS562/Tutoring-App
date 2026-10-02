import { cookies } from 'next/headers'
import { createServerClient } from '@supabase/ssr'

export type AiSkillsProgress = {
  completedModules: string[]
  promptChallengesCompleted: number
  earnedBadges: string[]
}

/**
 * What a visitor with no account sees.
 *
 * A coherent part-way profile rather than an empty one: two modules done,
 * one prompt challenge, and the two badges those actually unlock. It has to
 * stay internally consistent - claiming badges a student has not earned
 * anywhere else on the page would be the same mistake the dashboard used to
 * make, showing someone a stranger's progress as their own.
 *
 * This is for SIGNED-OUT visitors only. A signed-in student always sees
 * their real state, however empty.
 */
export const PREVIEW_PROGRESS: AiSkillsProgress = {
  completedModules: ['ai-what-is', 'ai-prompts'],
  promptChallengesCompleted: 1,
  earnedBadges: ['ai-explorer', 'prompt-pro'],
}

/**
 * The AI Skills index and the individual module page BOTH gate on this, and
 * they used to answer it separately: the index fell back to PREVIEW_PROGRESS
 * when Supabase was unconfigured, while the module page fell back to an
 * empty list. So a signed-out visitor was shown modules 1 and 2 complete and
 * 3 unlocked, and every one of modules 2-5 bounced straight back to the
 * index on click - every module carries an `unlockCondition` naming the one
 * before it. Only module 1 ever opened.
 *
 * One function now, so the list the page advertises and the list the gate
 * checks cannot disagree again.
 */
export async function getAiSkillsProgress(): Promise<AiSkillsProgress> {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!supabaseUrl || !supabaseKey) {
    return PREVIEW_PROGRESS
  }

  const cookieStore = await cookies()
  const supabase = createServerClient(supabaseUrl, supabaseKey, {
    cookies: {
      getAll() {
        return cookieStore.getAll()
      },
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) =>
            cookieStore.set(name, value, options)
          )
        } catch {
          // Called from a Server Component, where cookies cannot be set.
        }
      },
    },
  })

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return PREVIEW_PROGRESS
  }

  const { data: userData } = await supabase
    .from('users')
    .select('ai_modules_completed, prompt_challenges_completed, badges')
    .eq('id', user.id)
    .single()

  return {
    completedModules: userData?.ai_modules_completed || [],
    promptChallengesCompleted: userData?.prompt_challenges_completed || 0,
    earnedBadges: userData?.badges || [],
  }
}
