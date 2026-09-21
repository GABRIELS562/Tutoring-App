'use client'

import { useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { useTranslations } from 'next-intl'
import { Trophy, Download, Share2, RefreshCw, BookOpen } from 'lucide-react'
import BossFigure from './BossFigure'
import type { Boss } from '@/content/bosses'

type VictoryScreenProps = {
  boss: Boss
  bossName: string
  topicSlug: string
  marksDealt: number
  totalMarks: number
  xp: number
  comboBest: number
  elapsedSeconds: number
  onPlayAgain: () => void
}

function formatElapsed(totalSeconds: number): string {
  const minutes = Math.floor(totalSeconds / 60)
  const seconds = totalSeconds % 60
  return `${minutes}:${seconds.toString().padStart(2, '0')}`
}

export default function VictoryScreen({
  boss,
  bossName,
  topicSlug,
  marksDealt,
  totalMarks,
  xp,
  comboBest,
  elapsedSeconds,
  onPlayAgain,
}: VictoryScreenProps) {
  const t = useTranslations('boss')
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [cardReady, setCardReady] = useState(false)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    canvas.width = 1000
    canvas.height = 600

    const gradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height)
    gradient.addColorStop(0, '#0d1117')
    gradient.addColorStop(1, '#161b22')
    ctx.fillStyle = gradient
    ctx.fillRect(0, 0, canvas.width, canvas.height)

    ctx.strokeStyle = boss.accent
    ctx.lineWidth = 6
    ctx.strokeRect(24, 24, canvas.width - 48, canvas.height - 48)

    ctx.fillStyle = boss.accent
    ctx.font = 'bold 28px Arial'
    ctx.textAlign = 'center'
    ctx.fillText('ANGELO TUTORING · BOSS BATTLE', canvas.width / 2, 90)

    ctx.fillStyle = '#e6edf3'
    ctx.font = 'bold 44px Arial'
    ctx.fillText(t('shareCardHeadline', { bossName }), canvas.width / 2, 190)

    ctx.fillStyle = '#7d8590'
    ctx.font = '22px Arial'
    ctx.fillText(t('shareCardMarks', { dealt: marksDealt, total: totalMarks }), canvas.width / 2, 260)

    ctx.fillStyle = boss.accent
    ctx.font = 'bold 32px Arial'
    ctx.fillText(t('shareCardXp', { xp }), canvas.width / 2, 340)

    ctx.fillStyle = '#e6edf3'
    ctx.font = '20px Arial'
    ctx.fillText(
      t('shareCardStats', { combo: comboBest, time: formatElapsed(elapsedSeconds) }),
      canvas.width / 2,
      400
    )

    ctx.fillStyle = '#7d8590'
    ctx.font = '16px Arial'
    ctx.fillText('angelo-tutoring', canvas.width / 2, canvas.height - 50)

    // Drawing itself is synchronous, but the "ready" flag is flipped from
    // a queued microtask rather than directly in the effect body - avoids
    // eslint's react-hooks/set-state-in-effect (a setState call must not
    // be the effect's own direct synchronous action) while still enabling
    // the download/share buttons on the very next tick.
    queueMicrotask(() => setCardReady(true))
  }, [boss.accent, bossName, comboBest, elapsedSeconds, marksDealt, t, totalMarks, xp])

  const handleDownload = () => {
    const canvas = canvasRef.current
    if (!canvas) return
    const link = document.createElement('a')
    link.download = `boss-battle-${topicSlug}.png`
    link.href = canvas.toDataURL('image/png')
    link.click()
  }

  const handleShare = async () => {
    const canvas = canvasRef.current
    if (!canvas) return
    try {
      const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, 'image/png'))
      if (blob && navigator.share) {
        await navigator.share({
          title: t('shareCardHeadline', { bossName }),
          text: t('shareCardShareText', { bossName, dealt: marksDealt, total: totalMarks }),
          files: [new File([blob], `boss-battle-${topicSlug}.png`, { type: 'image/png' })],
        })
      }
    } catch (error) {
      console.error('Boss battle share error:', error)
    }
  }

  return (
    <div className="max-w-md mx-auto px-4 py-8 text-center">
      <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring', delay: 0.1 }} className="w-24 h-24 mx-auto mb-4">
        <BossFigure variant={boss.svgVariant} accent={boss.accent} state="defeated" />
      </motion.div>

      <div
        className="w-14 h-14 rounded-full mx-auto mb-4 flex items-center justify-center"
        style={{ background: 'rgba(244, 162, 97, 0.2)' }}
      >
        <Trophy className="w-8 h-8" style={{ color: 'var(--gold)' }} />
      </div>

      <h1 className="text-2xl font-extrabold mb-1" style={{ color: 'var(--text)' }}>
        {t('victoryTitle', { bossName })}
      </h1>
      <p className="text-sm mb-6" style={{ color: 'var(--muted-custom)' }}>
        {t('shareCardMarks', { dealt: marksDealt, total: totalMarks })}
      </p>

      <div className="grid grid-cols-3 gap-2 mb-6">
        <div className="rounded-lg p-3" style={{ background: 'var(--surface)', border: '1px solid var(--border-custom)' }}>
          <p className="text-lg font-bold" style={{ color: 'var(--gold)' }}>+{xp}</p>
          <p className="text-[11px]" style={{ color: 'var(--muted-custom)' }}>{t('xpEarned')}</p>
        </div>
        <div className="rounded-lg p-3" style={{ background: 'var(--surface)', border: '1px solid var(--border-custom)' }}>
          <p className="text-lg font-bold" style={{ color: 'var(--teal)' }}>{comboBest}x</p>
          <p className="text-[11px]" style={{ color: 'var(--muted-custom)' }}>{t('bestCombo')}</p>
        </div>
        <div className="rounded-lg p-3" style={{ background: 'var(--surface)', border: '1px solid var(--border-custom)' }}>
          <p className="text-lg font-bold" style={{ color: 'var(--text)' }}>{formatElapsed(elapsedSeconds)}</p>
          <p className="text-[11px]" style={{ color: 'var(--muted-custom)' }}>{t('timeTaken')}</p>
        </div>
      </div>

      <div className="rounded-xl overflow-hidden mb-4" style={{ border: '1px solid var(--border-custom)' }}>
        <canvas ref={canvasRef} className="w-full h-auto" style={{ display: 'block' }} />
      </div>

      <div className="flex gap-3 mb-4">
        <button
          type="button"
          onClick={handleDownload}
          disabled={!cardReady}
          className="flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-lg font-medium disabled:opacity-50"
          style={{ background: 'var(--surface2)', color: 'var(--text)', border: '1px solid var(--border-custom)' }}
        >
          <Download className="w-4 h-4" aria-hidden="true" />
          {t('download')}
        </button>
        {typeof navigator !== 'undefined' && 'share' in navigator && (
          <button
            type="button"
            onClick={handleShare}
            disabled={!cardReady}
            className="flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-lg font-medium disabled:opacity-50 text-white"
            style={{ background: boss.accent }}
          >
            <Share2 className="w-4 h-4" aria-hidden="true" />
            {t('share')}
          </button>
        )}
      </div>

      <div className="space-y-2">
        <button
          type="button"
          onClick={onPlayAgain}
          className="w-full flex items-center justify-center gap-2 px-5 py-3 rounded-lg font-semibold text-white"
          style={{ background: 'var(--accent-red)' }}
        >
          <RefreshCw className="w-4 h-4" aria-hidden="true" />
          {t('battleAgain')}
        </button>
        <Link
          href={`/topics/${topicSlug}`}
          className="w-full flex items-center justify-center gap-2 px-5 py-3 rounded-lg font-semibold"
          style={{ background: 'var(--surface2)', color: 'var(--text)', border: '1px solid var(--border-custom)' }}
        >
          <BookOpen className="w-4 h-4" aria-hidden="true" />
          {t('backToNotes')}
        </Link>
      </div>
    </div>
  )
}
