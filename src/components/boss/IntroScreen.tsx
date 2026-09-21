'use client'

import { useState } from 'react'
import { useTranslations } from 'next-intl'
import { Swords, PlayCircle, Shield } from 'lucide-react'
import BossFigure from './BossFigure'
import VideoModal from './VideoModal'
import type { Boss } from '@/content/bosses'
import type { Readiness } from '@/lib/boss/battle'

type IntroVideo = {
  videoId: string
  title?: string
}

type IntroScreenProps = {
  boss: Boss
  bossName: string
  bossTagline: string
  readiness: Readiness | null
  onSelectReadiness: (readiness: Readiness) => void
  onStart: () => void
  video: IntroVideo | null
  videoShieldGranted: boolean
  onGrantVideoShield: () => void
  shields: number
  questionCount: number
  totalMarks: number
  currentHp: number
}

const READINESS_OPTIONS: { value: Readiness }[] = [
  { value: 'not_sure' },
  { value: 'kind_of' },
  { value: 'got_this' },
]

export default function IntroScreen({
  boss,
  bossName,
  bossTagline,
  readiness,
  onSelectReadiness,
  onStart,
  video,
  videoShieldGranted,
  onGrantVideoShield,
  shields,
  questionCount,
  totalMarks,
  currentHp,
}: IntroScreenProps) {
  const t = useTranslations('boss')
  const [videoOpen, setVideoOpen] = useState(false)

  return (
    <div className="flex flex-col items-center text-center px-4 py-8 max-w-md mx-auto">
      <div className="w-44 h-44 mb-4">
        <BossFigure variant={boss.svgVariant} accent={boss.accent} state="idle" />
      </div>

      <h1 className="text-2xl font-extrabold mb-1" style={{ color: 'var(--text)' }}>
        {bossName}
      </h1>
      <p className="text-sm mb-6" style={{ color: 'var(--muted-custom)' }}>
        {bossTagline}
      </p>

      <div
        className="w-full rounded-xl p-3 mb-6 flex items-center justify-center gap-4 text-xs"
        style={{ background: 'var(--surface)', border: '1px solid var(--border-custom)' }}
      >
        <span style={{ color: 'var(--text)' }}>{t('questionCount', { count: questionCount })}</span>
        <span aria-hidden="true" style={{ color: 'var(--border-custom)' }}>|</span>
        <span style={{ color: 'var(--text)' }}>{t('bossHpPreview', { hp: currentHp, maxHp: totalMarks })}</span>
        <span aria-hidden="true" style={{ color: 'var(--border-custom)' }}>|</span>
        <span className="flex items-center gap-1" style={{ color: 'var(--teal)' }}>
          <Shield className="w-3.5 h-3.5" aria-hidden="true" />
          {shields}
        </span>
      </div>

      <fieldset className="w-full mb-6">
        <legend className="text-sm font-semibold mb-3" style={{ color: 'var(--text)' }}>
          {t('readinessQuestion')}
        </legend>
        <div className="grid grid-cols-1 gap-2">
          {READINESS_OPTIONS.map((option) => {
            const selected = readiness === option.value
            return (
              <button
                key={option.value}
                type="button"
                onClick={() => onSelectReadiness(option.value)}
                aria-pressed={selected}
                className="w-full px-4 py-3 rounded-lg text-sm font-medium text-left transition-all"
                style={{
                  background: selected ? 'rgba(230, 57, 70, 0.15)' : 'var(--surface2)',
                  border: `2px solid ${selected ? 'var(--accent-red)' : 'var(--border-custom)'}`,
                  color: 'var(--text)',
                }}
              >
                {t(`readiness.${option.value}`)}
              </button>
            )
          })}
        </div>
      </fieldset>

      {video && (
        <button
          type="button"
          onClick={() => setVideoOpen(true)}
          disabled={videoShieldGranted}
          className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium mb-4 transition-all disabled:opacity-60"
          style={{ background: 'rgba(45, 212, 191, 0.12)', color: 'var(--teal)', border: '1px solid var(--teal)' }}
        >
          <PlayCircle className="w-4 h-4" aria-hidden="true" />
          {videoShieldGranted ? t('videoShieldEarned') : t('watchTheoryFirst')}
        </button>
      )}

      <button
        type="button"
        onClick={onStart}
        disabled={!readiness}
        className="w-full flex items-center justify-center gap-2 px-6 py-3.5 rounded-lg font-bold text-white transition-all disabled:opacity-40"
        style={{ background: 'var(--accent-red)' }}
      >
        <Swords className="w-5 h-5" aria-hidden="true" />
        {t('startBattle')}
      </button>

      {video && (
        <VideoModal
          open={videoOpen}
          onClose={() => setVideoOpen(false)}
          videoId={video.videoId}
          title={video.title}
          shieldAlreadyEarned={videoShieldGranted}
          onShieldEarned={onGrantVideoShield}
        />
      )}
    </div>
  )
}
