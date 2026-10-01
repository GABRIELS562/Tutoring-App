'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Check, ChevronRight, BookOpen, Lightbulb, Zap, Video, Loader2, Award } from 'lucide-react'
import { useTranslations, useLocale } from 'next-intl'
import type { AIModule, TopicSection, NoteBlock } from '@/types'
import AIPracticalBlock from './AIPracticalBlock'

interface AIModuleRendererProps {
  module: AIModule
  isCompleted?: boolean
  onComplete?: () => void
}

function BlockRenderer({ block }: { block: NoteBlock }) {
  switch (block.type) {
    case 'theory':
      return (
        <div className="space-y-3">
          {block.title && (
            <h4 className="font-semibold text-lg flex items-center gap-2 text-primary-text">
              <BookOpen className="w-4 h-4 text-ai-purple" />
              {block.title}
            </h4>
          )}
          {block.body && (
            <div className="text-sm leading-relaxed whitespace-pre-wrap text-primary-text">
              {block.body}
            </div>
          )}
        </div>
      )

    case 'tip':
      return (
        <div className="p-4 rounded-lg flex gap-3 bg-gold-glow border border-gold">
          <Lightbulb className="w-5 h-5 text-gold flex-shrink-0 mt-0.5" />
          <p className="text-sm text-primary-text">
            {block.body}
          </p>
        </div>
      )

    case 'worked_example':
      return (
        <div className="rounded-xl overflow-hidden bg-surface border border-custom">
          {block.title && (
            <div className="px-4 py-3 flex items-center gap-2 bg-surface2 border-b border-custom">
              <Zap className="w-4 h-4 text-ai-purple" />
              <span className="font-medium text-sm text-primary-text">
                {block.title}
              </span>
            </div>
          )}
          <div className="p-4 space-y-4">
            {block.steps?.map((step) => (
              <div key={step.stepNumber} className="space-y-2">
                <div className="flex items-center gap-2">
                  <span className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold bg-ai-purple-glow text-ai-purple">
                    {step.stepNumber}
                  </span>
                  <span className="text-sm font-medium text-primary-text">
                    {step.instruction}
                  </span>
                </div>
                <div className="ml-8 p-3 rounded-lg text-sm bg-surface2 text-muted-custom">
                  <p className="font-mono">{step.working}</p>
                  {step.answer && (
                    <p className="mt-2 text-ai-purple">{step.answer}</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )

    case 'ai_practical':
      if (!block.aiConfig) return null
      return (
        <AIPracticalBlock
          config={block.aiConfig}
          title={block.title}
        />
      )

    case 'video':
      if (!block.videoId) return null
      return (
        <div className="space-y-2">
          {block.title && (
            <h4 className="font-medium flex items-center gap-2 text-primary-text">
              <Video className="w-4 h-4 text-ai-purple" />
              {block.title}
            </h4>
          )}
          <div className="aspect-video rounded-lg overflow-hidden bg-surface">
            <iframe
              src={`https://www.youtube.com/embed/${block.videoId}`}
              className="w-full h-full"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          </div>
        </div>
      )

    default:
      return null
  }
}

function SectionRenderer({ section }: { section: TopicSection }) {
  const [isExpanded, setIsExpanded] = useState(true)

  return (
    <div className="rounded-xl overflow-hidden bg-surface border border-custom">
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full px-5 py-4 flex items-center justify-between hover:bg-surface2 transition-colors"
      >
        <h3 className="font-semibold text-left text-primary-text">
          {section.title}
        </h3>
        <ChevronRight
          className={`w-5 h-5 transition-transform text-muted-custom ${isExpanded ? 'rotate-90' : ''}`}
        />
      </button>

      {isExpanded && (
        <div className="px-5 pb-5 space-y-5">
          {section.blocks.map((block, idx) => (
            <BlockRenderer key={idx} block={block} />
          ))}
        </div>
      )}
    </div>
  )
}

export default function AIModuleRenderer({
  module,
  isCompleted: initialCompleted = false,
  onComplete,
}: AIModuleRendererProps) {
  const router = useRouter()
  const t = useTranslations('aiSkills')
  const af = useLocale() === 'af'
  const localised = (en: string, afText?: string) => (af && afText ? afText : en)
  const [isCompleted, setIsCompleted] = useState(initialCompleted)
  const [isLoading, setIsLoading] = useState(false)
  const [xpEarned, setXpEarned] = useState<number | null>(null)
  const [newBadges, setNewBadges] = useState<string[]>([])
  const [failed, setFailed] = useState(false)

  const handleComplete = async () => {
    if (isLoading || isCompleted) return

    setIsLoading(true)
    setFailed(false)

    try {
      const res = await fetch('/api/ai-skills/complete-module', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          moduleId: module.id,
        }),
      })

      const data = await res.json()

      // res.ok was never checked and there was no else branch, so a 400,
      // a 500 or a dropped connection just flipped the button back to
      // "Mark as Complete": no XP, no badge, module not completed, and no
      // way for the student to know. Since all five modules gate the
      // certificate, that silently blocked it.
      if (!res.ok || !data.success) {
        setFailed(true)
        return
      }

      setIsCompleted(true)
      setXpEarned(data.xpEarned)
      setNewBadges(data.newBadges || [])
      onComplete?.()

      // Refresh page data after a short delay
      setTimeout(() => {
        router.refresh()
      }, 2000)
    } catch (error) {
      console.error('Error completing module:', error)
      setFailed(true)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* Module Header */}
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <span className="text-xs px-2 py-1 rounded-full font-medium bg-ai-purple-glow text-ai-purple">
            {localised(module.timeEstimate, module.timeEstimateAf)}
          </span>
          {isCompleted && (
            <span className="text-xs px-2 py-1 rounded-full font-medium flex items-center gap-1 bg-ai-success-glow text-ai-success">
              <Check className="w-3 h-3" />
              {t('completed')}
            </span>
          )}
        </div>
        <h1 className="text-2xl font-bold text-primary-text">
          {localised(module.title, module.titleAf)}
        </h1>
        <p className="text-sm text-muted-custom">
          {localised(module.description, module.descriptionAf)}
        </p>
      </div>

      {/* Sections */}
      <div className="space-y-4">
        {module.sections.map((section) => (
          <SectionRenderer key={section.id} section={section} />
        ))}
      </div>

      {/* Completion Success Message */}
      {xpEarned !== null && xpEarned > 0 && (
        <div className="p-4 rounded-lg flex items-center gap-3 bg-ai-success-glow border border-ai-success">
          <Award className="w-6 h-6 text-ai-success" />
          <div>
            <p className="font-medium text-ai-success">
              {t('xpEarnedToast', { xp: xpEarned })}
            </p>
            {newBadges.length > 0 && (
              <p className="text-sm text-ai-purple">
                {t('newBadge', { badge: newBadges.join(', ') })}
              </p>
            )}
          </div>
        </div>
      )}

      {failed && (
        <p
          role="alert"
          className="text-sm"
          style={{ color: 'var(--accent-red-text)' }}
        >
          {t('somethingWentWrong')} {t('tryAgain')}
        </p>
      )}

      {/* Complete Button */}
      {!isCompleted && (
        <button
          onClick={handleComplete}
          disabled={isLoading}
          className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-lg font-medium transition-all disabled:opacity-50 bg-ai-purple text-white"
        >
          {isLoading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              {t('saving')}
            </>
          ) : (
            <>
              <Check className="w-4 h-4" />
              {t('markAsComplete')}
            </>
          )}
        </button>
      )}
    </div>
  )
}
