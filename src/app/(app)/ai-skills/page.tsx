import Link from 'next/link'
import { cookies } from 'next/headers'
import { getTranslations, getLocale } from 'next-intl/server'
import Topbar from '@/components/layout/Topbar'
import { createServerClient } from '@supabase/ssr'
import {
  Brain,
  Lock,
  CheckCircle,
  ArrowRight,
  Trophy,
  Sparkles,
  Compass,
  MessageSquare,
  Shield,
  Briefcase,
  Award,
  GraduationCap,
  Zap,
  type LucideIcon,
} from 'lucide-react'
import { aiModules, moduleOrder, badges, AI_MODULE_XP } from '@/content/ai-skills'

/** The `icon` name each badge declares, resolved to its component. */
const BADGE_ICONS: Record<string, LucideIcon> = {
  Compass,
  MessageSquare,
  Brain,
  Shield,
  Briefcase,
  Award,
  GraduationCap,
  Zap,
}

export const metadata = {
  title: 'AI Skills | Angelo Tutoring',
  description: 'Learn to use AI effectively with our AI Literacy Curriculum. Master prompt engineering, study smarter, and prepare for an AI-powered workplace.',
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
const PREVIEW_PROGRESS = {
  completedModules: ['ai-what-is', 'ai-prompts'] as string[],
  promptChallengesCompleted: 1,
  earnedBadges: ['ai-explorer', 'prompt-pro'] as string[],
}

async function getUserProgress() {
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
          // Ignore
        }
      },
    },
  })

  const { data: { user } } = await supabase.auth.getUser()

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

export default async function AISkillsPage() {
  const { completedModules, promptChallengesCompleted, earnedBadges } = await getUserProgress()
  const t = await getTranslations('aiSkills')
  const locale = await getLocale()
  const af = locale === 'af'

  /** Module and badge names carry Afrikaans; the lesson bodies do not yet. */
  const localised = (en: string, afText?: string) => (af && afText ? afText : en)

  const allBadges = Object.values(badges)
  const allModulesCompleted = moduleOrder.every((id) => completedModules.includes(id))
  const totalXP = completedModules.length * AI_MODULE_XP

  return (
    <div>
      {/* Without this the whole AI Skills section had no Topbar, so an
          Afrikaans student who navigated in got an English section AND no
          language toggle to get back out - plus no XP, streak or account
          menu. */}
      <Topbar title={t('title')} subtitle={t('subtitle')} />

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
              {t('title')}
            </h1>
            <p className="text-sm text-muted-custom">
              {t('subtitle')}
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
              <p className="text-xs text-muted-custom">{t('modules')}</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-gold">{totalXP}</p>
              <p className="text-xs text-muted-custom">{t('xpEarned')}</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-teal">{promptChallengesCompleted}</p>
              <p className="text-xs text-muted-custom">{t('challenges')}</p>
            </div>
          </div>

          {allModulesCompleted && (
            <Link
              href="/ai-skills/certificate"
              className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all"
              style={{ background: 'var(--ai-purple)', color: 'white' }}
            >
              <Trophy className="w-4 h-4" />
              {t('getCertificate')}
            </Link>
          )}
        </div>
      </div>

      {/* Modules Grid */}
      <div className="space-y-4">
        <h2 className="font-semibold" style={{ color: 'var(--text)' }}>
          {t('modules')}
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
                      {localised(aiModule.title, aiModule.titleAf)}
                    </h3>
                    <p className="text-sm text-muted-custom truncate">
                      {localised(aiModule.description, aiModule.descriptionAf)}
                    </p>
                    <div className="flex items-center gap-3 mt-1">
                      <span className="text-xs text-muted-custom">{localised(aiModule.timeEstimate, aiModule.timeEstimateAf)}</span>
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
                    {t('completeFirst', { module: localised(prevModule.title, prevModule.titleAf) })}
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
            <h3 className="font-semibold text-ai-purple">{t('promptChallenge')}</h3>
            <p className="text-sm text-muted-custom">
              {t('promptChallengeBlurb')}
            </p>
          </div>
          <ArrowRight className="w-5 h-5 text-ai-purple" />
        </div>
      </Link>

      {/* Badges. The whole set is always shown, earned and unearned.
          Previously the section was hidden entirely until a student had
          earned one, which is backwards: a badge only motivates if you can
          see it before you have it, and it meant the feature was invisible
          to every new student. The modules list above already works this
          way, showing locked modules with what unlocks them. */}
      <div className="space-y-4">
        <div className="flex items-baseline justify-between">
          <h2 className="font-semibold" style={{ color: 'var(--text)' }}>
            {t('badges')}
          </h2>
          <span className="text-sm" style={{ color: 'var(--muted-custom)' }}>
            {t('badgesEarned', { earned: earnedBadges.length, total: allBadges.length })}
          </span>
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
          {allBadges.map((badge) => {
            const earned = earnedBadges.includes(badge.id)
            const Icon = BADGE_ICONS[badge.icon] ?? Award

            return (
              <div
                key={badge.id}
                className="rounded-xl p-4 flex items-start gap-3"
                style={{
                  background: 'var(--surface)',
                  border: `1px solid ${earned ? 'var(--ai-purple, #8b7cf6)' : 'var(--border-custom)'}`,
                  opacity: earned ? 1 : 0.62,
                }}
              >
                <div
                  className="p-2 rounded-lg shrink-0"
                  style={{ background: earned ? 'rgba(139, 124, 246, 0.16)' : 'var(--surface2)' }}
                >
                  {earned ? (
                    <Icon className="w-5 h-5 text-ai-purple" aria-hidden="true" />
                  ) : (
                    <Lock
                      className="w-5 h-5"
                      style={{ color: 'var(--muted-custom)' }}
                      aria-hidden="true"
                    />
                  )}
                </div>

                <div className="min-w-0">
                  <p className="text-sm font-semibold" style={{ color: 'var(--text)' }}>
                    {localised(badge.name, badge.nameAf)}
                    {earned && (
                      <span className="ml-2 text-xs font-normal text-ai-purple">{t('earned')}</span>
                    )}
                  </p>
                  <p className="text-xs mt-0.5" style={{ color: 'var(--muted-custom)' }}>
                    {localised(badge.description, badge.descriptionAf)}
                  </p>
                  <p className="text-xs mt-1" style={{ color: 'var(--gold)' }}>
                    +{badge.xpReward} XP
                  </p>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  </div>
  )
}
