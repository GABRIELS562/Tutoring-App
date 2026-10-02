import { cookies } from 'next/headers'
import { createServerClient } from '@supabase/ssr'
import Link from 'next/link'
import { getTranslations } from 'next-intl/server'
import Topbar from '@/components/layout/Topbar'
import { ArrowLeft } from 'lucide-react'
import PromptChallengeGame from '@/components/ai/PromptChallengeGame'
import { promptScenarios } from '@/content/ai-skills'

export const metadata = {
  title: 'Prompt Challenge | AI Skills | Angelo Tutoring',
  description: 'Test your prompt engineering skills with 10 real-world scenarios. Get AI feedback and improve your ability to communicate with AI effectively.',
}

async function getUserId() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!supabaseUrl || !supabaseKey) {
    return 'demo-user'
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
  return user?.id || 'demo-user'
}

export default async function PromptChallengePage() {
  const t = await getTranslations('aiSkills')
  const userId = await getUserId()

  return (
    <div>
      <Topbar title={t('promptChallenge')} subtitle={t('title')} />

      <div className="p-4 md:p-6 max-w-4xl mx-auto space-y-6">
      {/* Back Link */}
      <Link
        href="/ai-skills"
        className="inline-flex items-center gap-2 text-sm hover:text-ai-purple transition-colors tap-target"
        style={{ color: 'var(--muted-custom)' }}
      >
        <ArrowLeft className="w-4 h-4" />{t('backToAiSkills')}</Link>

      {/* Header */}
      <div className="text-center space-y-2">
        <h2 className="text-2xl font-bold" style={{ color: 'var(--text)' }}>{t('promptChallenge')}</h2>
        <p className="text-sm text-muted-custom max-w-lg mx-auto">
          {t('challengeIntro', { count: promptScenarios.length })}
        </p>
      </div>

      {/* Game */}
      <PromptChallengeGame userId={userId} />
    </div>
  </div>
  )
}
