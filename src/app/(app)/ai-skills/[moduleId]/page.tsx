import { notFound, redirect } from 'next/navigation'
import { getAiSkillsProgress } from '@/lib/ai-skills/progress'
import Link from 'next/link'
import { ArrowLeft, ArrowRight } from 'lucide-react'
import { getTranslations, getLocale } from 'next-intl/server'
import Topbar from '@/components/layout/Topbar'
import { aiModules, moduleOrder } from '@/content/ai-skills'
import AIModuleRenderer from '@/components/ai/AIModuleRenderer'

interface PageProps {
  params: Promise<{ moduleId: string }>
}

export async function generateStaticParams() {
  return moduleOrder.map((id) => ({ moduleId: id }))
}

export async function generateMetadata({ params }: PageProps) {
  const { moduleId } = await params
  const aiModule = aiModules[moduleId]

  if (!aiModule) {
    return { title: 'Module Not Found' }
  }

  return {
    title: `${aiModule.title} | AI Skills | Angelo Tutoring`,
    description: aiModule.description,
  }
}

export default async function AIModulePage({ params }: PageProps) {
  const { moduleId } = await params
  const aiModule = aiModules[moduleId]

  if (!aiModule) {
    notFound()
  }

  const { completedModules } = await getAiSkillsProgress()

  // Check if module is locked
  if (aiModule.unlockCondition && !completedModules.includes(aiModule.unlockCondition)) {
    redirect('/ai-skills')
  }

  const t = await getTranslations('aiSkills')
  const af = (await getLocale()) === 'af'
  const localised = (en: string, afText?: string) => (af && afText ? afText : en)

  const isCompleted = completedModules.includes(moduleId)
  const currentIndex = moduleOrder.indexOf(moduleId as typeof moduleOrder[number])
  const prevModule = currentIndex > 0 ? aiModules[moduleOrder[currentIndex - 1]] : null
  const nextModule = currentIndex < moduleOrder.length - 1 ? aiModules[moduleOrder[currentIndex + 1]] : null

  return (
    <div>
      <Topbar
        title={localised(aiModule.title, aiModule.titleAf)}
        subtitle={t('title')}
      />

      <div className="p-4 md:p-6 max-w-3xl mx-auto space-y-6">
      {/* Back Link */}
      <Link
        href="/ai-skills"
        className="inline-flex items-center gap-2 text-sm hover:text-ai-purple transition-colors tap-target"
        style={{ color: 'var(--muted-custom)' }}
      >
        <ArrowLeft className="w-4 h-4" />
        {t('backToAiSkills')}
      </Link>

      {/* Module Content */}
      <AIModuleRenderer
        module={aiModule}
        isCompleted={isCompleted}
      />

      {/* Navigation */}
      <div
        className="flex items-center justify-between pt-6"
        style={{ borderTop: '1px solid var(--border-custom)' }}
      >
        {prevModule ? (
          <Link
            href={`/ai-skills/${prevModule.id}`}
            className="flex items-center gap-2 text-sm hover:text-ai-purple transition-colors tap-target"
            style={{ color: 'var(--muted-custom)' }}
          >
            <ArrowLeft className="w-4 h-4" />
            {localised(prevModule.title, prevModule.titleAf)}
          </Link>
        ) : (
          <div />
        )}

        {nextModule ? (
          <Link
            href={`/ai-skills/${nextModule.id}`}
            className="flex items-center gap-2 text-sm hover:text-ai-purple transition-colors tap-target"
            style={{ color: 'var(--muted-custom)' }}
          >
            {localised(nextModule.title, nextModule.titleAf)}
            <ArrowRight className="w-4 h-4" />
          </Link>
        ) : (
          <Link
            href="/ai-skills/prompt-challenge"
            className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium"
            style={{ background: 'var(--ai-purple)', color: 'white' }}
          >
            {t('takeTheChallenge')}
            <ArrowRight className="w-4 h-4" />
          </Link>
        )}
      </div>
    </div>
  </div>
  )
}
