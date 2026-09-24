'use client'

import { useTranslations } from 'next-intl'
import MathRenderer from '@/components/math/MathRenderer'
import FormulaBox from './FormulaBox'
import WorkedExample from './WorkedExample'
import VoicePlayer from '@/components/ui/VoicePlayer'
import type { NoteBlock as NoteBlockType } from '@/types'
import { Lightbulb } from 'lucide-react'
import { useLocaleCookie } from '@/hooks/useLocaleCookie'

type NoteBlockProps = {
  block: NoteBlockType
  topicSlug?: string
  sectionId?: string
}

export default function NoteBlock({ block, topicSlug = 'topic', sectionId = 'section' }: NoteBlockProps) {
  const t = useTranslations('video')
  const locale = useLocaleCookie()

  // Generate unique ID for voice player
  const blockId = `${sectionId}-${block.type}-${block.title?.toLowerCase().replace(/\s+/g, '-') || 'content'}`

  // Get locale-aware content
  const getLocalizedContent = (en?: string, af?: string) => {
    if (locale === 'af' && af) return af
    return en || ''
  }

  const getLocalizedVideoId = () => {
    if (locale === 'af' && block.videoIdAf) return block.videoIdAf
    return block.videoId
  }

  switch (block.type) {
    case 'theory':
      return (
        <div className="my-4 prose prose-invert max-w-none">
          <div className="flex items-start justify-between gap-2">
            {block.title && (
              <h4 className="text-base font-semibold mb-2 flex-1" style={{ color: 'var(--text)' }}>
                {block.title}
              </h4>
            )}
            <VoicePlayer
              text={block.body || ''}
              topicSlug={topicSlug}
              sectionId={blockId}
            />
          </div>
          <div
            className="text-sm leading-relaxed whitespace-pre-line"
            style={{ color: 'var(--text)', opacity: 0.9 }}
          >
            <MathRenderer content={block.body || ''} />
          </div>
        </div>
      )

    case 'formula':
      return (
        <FormulaBox
          title={block.title || 'Key Formulas'}
          formulas={block.formulas || []}
        />
      )

    case 'tip':
      return (
        <div
          className="rounded-lg p-4 my-4 flex gap-3"
          style={{
            background: 'rgba(42, 157, 143, 0.1)',
            border: '1px solid var(--teal)',
          }}
        >
          <Lightbulb
            className="w-5 h-5 flex-shrink-0 mt-0.5"
            style={{ color: 'var(--teal)' }}
          />
          <div className="flex-1 text-sm" style={{ color: 'var(--text)' }}>
            <MathRenderer content={getLocalizedContent(block.body, block.bodyAf)} />
          </div>
          <VoicePlayer
            text={block.body || ''}
            topicSlug={topicSlug}
            sectionId={blockId}
          />
        </div>
      )

    case 'worked_example':
      return (
        <div className="relative">
          <div className="absolute top-4 right-4 z-10">
            <VoicePlayer
              text={`${block.title || 'Example'}. ${block.body || ''}`}
              topicSlug={topicSlug}
              sectionId={blockId}
            />
          </div>
          <WorkedExample
            title={block.title || 'Example'}
            question={block.body || ''}
            steps={block.steps || []}
            answer={block.steps?.[block.steps.length - 1]?.answer || ''}
          />
        </div>
      )

    case 'video': {
      const videoId = getLocalizedVideoId()
      const title = getLocalizedContent(block.title, block.titleAf)

      // No video available
      if (!videoId) {
        return (
          <div
            className="my-4 p-4 rounded-lg text-center"
            style={{ background: 'var(--surface2)', border: '1px solid var(--border-custom)' }}
          >
            <p className="text-sm" style={{ color: 'var(--muted-custom)' }}>
              {t('noVideoAvailable')}
            </p>
          </div>
        )
      }

      return (
        <div className="my-4">
          {title && (
            <h4
              className="text-sm font-semibold mb-2"
              style={{ color: 'var(--muted-custom)' }}
            >
              {title}
            </h4>
          )}
          <div
            style={{
              position: 'relative',
              paddingBottom: '56.25%',
              height: 0,
              overflow: 'hidden',
              borderRadius: '8px',
            }}
          >
            <iframe
              src={`https://www.youtube.com/embed/${videoId}?rel=0&modestbranding=1`}
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                height: '100%',
              }}
              frameBorder={0}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              loading="lazy"
              title={title || 'Video'}
            />
          </div>
        </div>
      )
    }

    case 'example':
      return (
        <div
          className="rounded-lg p-4 my-4"
          style={{
            background: 'var(--surface2)',
            borderLeft: '3px solid var(--accent-red)',
          }}
        >
          {block.title && (
            <h4
              className="text-sm font-semibold mb-2"
              style={{ color: 'var(--accent-red)' }}
            >
              {block.title}
            </h4>
          )}
          <div className="text-sm" style={{ color: 'var(--text)' }}>
            <MathRenderer content={block.body || ''} />
          </div>
        </div>
      )

    default:
      return null
  }
}
