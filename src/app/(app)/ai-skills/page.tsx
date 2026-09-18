import Link from 'next/link'
import { cookies } from 'next/headers'
import { createServerClient } from '@supabase/ssr'
import { Brain, Lock, CheckCircle, ArrowRight, Trophy, Sparkles } from 'lucide-react'
import { aiModules, moduleOrder, badges, AI_MODULE_XP } from '@/content/ai-skills'

export const metadata = {
  title: 'AI Skills | Angelo Tutoring',
  description: 'Learn to use AI effectively with our AI Literacy Curriculum. Master prompt engineering, study smarter, and prepare for an AI-powered workplace.',
}

async function getUserProgress() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!supabaseUrl || !supabaseKey) {
    return {
      completedModules: [] as string[],
      promptChallengesCompleted: 0,
      earnedBadges: [] as string[],
    }
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
          // Ignore
        }
      },
    },
  })

  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return {
      completedModules: [] as string[],
      promptChallengesCompleted: 0,
      earnedBadges: [] as string[],
    }
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

export default async function AISkillsPage() {
  const { completedModules, promptChallengesCompleted, earnedBadges } = await getUserProgress()

  const allModulesCompleted = moduleOrder.every((id) => completedModules.includes(id))
  const totalXP = completedModules.length * AI_MODULE_XP

  return (
    <div className="p-4 md:p-6 max-w-4xl mx-auto space-y-8">
      {/* Header */}
      <div className="space-y-4">
        <div className="flex items-center gap-3">
          <div
            className="w-12 h-12 rounded-xl flex items-center justify-center"
            style={{ background: 'var(--ai-purple-glow)' }}
          >
            <Brain className="w-6 h-6 text-ai-purple" />
          </div>
          <div>
            <h1 className="text-2xl font-bold" style={{ color: 'var(--text)' }}>
              AI Skills
            </h1>
            <p className="text-sm text-muted-custom">
              Learn to use AI like a pro
            </p>
          </div>
        </div>

        {/* Progress Summary */}
        <div
          className="p-4 rounded-xl flex items-center justify-between"
          style={{ background: 'var(--surface)', border: '1px solid var(--border-custom)' }}
        >
          <div className="flex items-center gap-6">
            <div>
              <p className="text-2xl font-bold text-ai-purple">{completedModules.length}/5</p>
              <p className="text-xs text-muted-custom">Modules</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-gold">{totalXP}</p>
              <p className="text-xs text-muted-custom">XP Earned</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-teal">{promptChallengesCompleted}</p>
              <p className="text-xs text-muted-custom">Challenges</p>
            </div>
          </div>

          {allModulesCompleted && (
            <Link
              href="/ai-skills/certificate"
              className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all"
              style={{ background: 'var(--ai-purple)', color: 'white' }}
            >
              <Trophy className="w-4 h-4" />
              Get Certificate
            </Link>
          )}
        </div>
      </div>

      {/* Modules Grid */}
      <div className="space-y-4">
        <h2 className="font-semibold" style={{ color: 'var(--text)' }}>
          Modules
        </h2>

        <div className="space-y-3">
          {moduleOrder.map((moduleId, index) => {
            const aiModule = aiModules[moduleId]
            const isCompleted = completedModules.includes(moduleId)
            const isLocked = aiModule.unlockCondition && !completedModules.includes(aiModule.unlockCondition)
            const prevModule = index > 0 ? aiModules[moduleOrder[index - 1]] : null

            return (
              <Link
                key={moduleId}
                href={isLocked ? '#' : `/ai-skills/${moduleId}`}
                className={`block rounded-xl p-4 transition-all ${
                  isLocked ? 'opacity-60 cursor-not-allowed' : 'hover:ring-2 hover:ring-ai-purple'
                }`}
                style={{ background: 'var(--surface)', border: '1px solid var(--border-custom)' }}
              >
                <div className="flex items-center gap-4">
                  {/* Module Number */}
                  <div
                    className="w-10 h-10 rounded-lg flex items-center justify-center font-bold"
                    style={{
                      background: isCompleted ? 'var(--ai-success)' : isLocked ? 'var(--surface2)' : 'var(--ai-purple)',
                      color: 'white',
                    }}
                  >
                    {isCompleted ? (
                      <CheckCircle className="w-5 h-5" />
                    ) : isLocked ? (
                      <Lock className="w-4 h-4" />
                    ) : (
                      index + 1
                    )}
                  </div>

                  {/* Module Info */}
                  <div className="flex-1 min-w-0">
                    <h3 className="font-medium truncate" style={{ color: 'var(--text)' }}>
                      {aiModule.title}
                    </h3>
                    <p className="text-sm text-muted-custom truncate">
                      {aiModule.description}
                    </p>
                    <div className="flex items-center gap-3 mt-1">
                      <span className="text-xs text-muted-custom">{aiModule.timeEstimate}</span>
                      <span className="text-xs text-gold">+{AI_MODULE_XP} XP</span>
                    </div>
                  </div>

                  {/* Arrow */}
                  {!isLocked && (
                    <ArrowRight className="w-5 h-5 text-muted-custom flex-shrink-0" />
                  )}
                </div>

                {isLocked && prevModule && (
                  <p className="text-xs text-muted-custom mt-2 ml-14">
                    Complete &quot;{prevModule.title}&quot; first
                  </p>
                )}
              </Link>
            )
          })}
        </div>
      </div>

      {/* Prompt Challenge CTA */}
      <Link
        href="/ai-skills/prompt-challenge"
        className="block rounded-xl p-5 transition-all hover:ring-2 hover:ring-ai-purple"
        style={{ background: 'var(--ai-purple-glow)', border: '1px solid var(--ai-purple)' }}
      >
        <div className="flex items-center gap-4">
          <div
            className="w-12 h-12 rounded-xl flex items-center justify-center"
            style={{ background: 'var(--ai-purple)' }}
          >
            <Sparkles className="w-6 h-6 text-white" />
          </div>
          <div className="flex-1">
            <h3 className="font-semibold text-ai-purple">Prompt Challenge</h3>
            <p className="text-sm text-muted-custom">
              Test your prompt engineering skills and earn XP
            </p>
          </div>
          <ArrowRight className="w-5 h-5 text-ai-purple" />
        </div>
      </Link>

      {/* Badges Section */}
      {earnedBadges.length > 0 && (
        <div className="space-y-4">
          <h2 className="font-semibold" style={{ color: 'var(--text)' }}>
            Your Badges
          </h2>
          <div className="flex flex-wrap gap-3">
            {earnedBadges.map((badgeId: string) => {
              const badge = badges[badgeId as keyof typeof badges]
              if (!badge) return null
              return (
                <div
                  key={badgeId}
                  className="px-3 py-2 rounded-lg flex items-center gap-2"
                  style={{ background: 'var(--surface)', border: '1px solid var(--border-custom)' }}
                >
                  <span className="text-ai-purple text-sm">{badge.name}</span>
                </div>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}
