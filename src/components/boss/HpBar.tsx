'use client'

import { motion } from 'framer-motion'
import { useMotionSafe } from '@/hooks/useMotionSafe'
import { useTranslations } from 'next-intl'

type HpBarProps = {
  bossName: string
  hp: number
  maxHp: number
  accent: string
}

/** Boss HP bar with a spring-animated fill and an accessible progressbar
 * role. The live region announcing damage lives in BossBattleClient (one
 * shared announcer for the whole battle, not duplicated per bar). */
export default function HpBar({ bossName, hp, maxHp, accent }: HpBarProps) {
  const { transition } = useMotionSafe()
  const t = useTranslations('boss')
  const percent = maxHp > 0 ? Math.max(0, Math.min(100, (hp / maxHp) * 100)) : 0

  return (
    <div>
      <div className="flex items-center justify-between mb-1.5">
        <span className="text-sm font-bold truncate" style={{ color: 'var(--text)' }}>
          {bossName}
        </span>
        <span className="text-xs font-mono shrink-0" style={{ color: 'var(--muted-custom)' }}>
          {t('hpLabel', { hp: Math.max(0, Math.round(hp)), maxHp })}
        </span>
      </div>
      <div
        role="progressbar"
        aria-label={t('bossHpAriaLabel', { name: bossName })}
        aria-valuenow={Math.max(0, Math.round(hp))}
        aria-valuemin={0}
        aria-valuemax={maxHp}
        className="h-4 rounded-full overflow-hidden"
        style={{ background: 'var(--surface2)', border: '1px solid var(--border-custom)' }}
      >
        <motion.div
          className="h-full rounded-full"
          style={{ background: accent }}
          initial={false}
          animate={{ width: `${percent}%` }}
          transition={transition({ type: 'spring', stiffness: 120, damping: 20 })}
        />
      </div>
    </div>
  )
}
