'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'
import { useTranslations } from 'next-intl'
import { RefreshCw, BookOpen } from 'lucide-react'
import BossFigure from './BossFigure'
import type { Boss } from '@/content/bosses'

type RetreatScreenProps = {
  boss: Boss
  bossName: string
  topicSlug: string
  xp: number
  marksDealt: number
  totalMarks: number
  remainingHp: number
  onTryAgain: () => void
}

export default function RetreatScreen({
  boss,
  bossName,
  topicSlug,
  xp,
  marksDealt,
  totalMarks,
  remainingHp,
  onTryAgain,
}: RetreatScreenProps) {
  const t = useTranslations('boss')

  return (
    <div className="max-w-md mx-auto px-4 py-10 text-center">
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="w-24 h-24 mx-auto mb-4">
        <BossFigure variant={boss.svgVariant} accent={boss.accent} state="idle" />
      </motion.div>

      <h1 className="text-xl font-bold mb-1" style={{ color: 'var(--text)' }}>
        {t('retreatTitle')}
      </h1>
      <p className="text-sm mb-6" style={{ color: 'var(--muted-custom)' }}>
        {t('retreatBody', { bossName, hp: remainingHp })}
      </p>

      <div className="grid grid-cols-2 gap-2 mb-8">
        <div className="rounded-lg p-3" style={{ background: 'var(--surface)', border: '1px solid var(--border-custom)' }}>
          <p className="text-lg font-bold" style={{ color: 'var(--gold)' }}>+{xp}</p>
          <p className="text-[11px]" style={{ color: 'var(--muted-custom)' }}>{t('xpEarned')}</p>
        </div>
        <div className="rounded-lg p-3" style={{ background: 'var(--surface)', border: '1px solid var(--border-custom)' }}>
          <p className="text-lg font-bold" style={{ color: 'var(--text)' }}>{marksDealt}/{totalMarks}</p>
          <p className="text-[11px]" style={{ color: 'var(--muted-custom)' }}>{t('marksDealt')}</p>
        </div>
      </div>

      <div className="space-y-2">
        <button
          type="button"
          onClick={onTryAgain}
          className="w-full flex items-center justify-center gap-2 px-5 py-3 rounded-lg font-semibold text-white"
          style={{ background: 'var(--accent-red)' }}
        >
          <RefreshCw className="w-4 h-4" aria-hidden="true" />
          {t('tryAgain')}
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
