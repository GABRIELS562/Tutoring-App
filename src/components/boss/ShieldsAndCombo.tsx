'use client'

import { Shield } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { comboMultiplierFor } from '@/lib/boss/battle'

type ShieldsAndComboProps = {
  shields: number
  combo: number
}

/** Shield pips + the current combo multiplier badge (only shown once a
 * multiplier is actually active, so it doesn't clutter the HUD at 1x). */
export default function ShieldsAndCombo({ shields, combo }: ShieldsAndComboProps) {
  const t = useTranslations('boss')
  const multiplier = comboMultiplierFor(combo)

  return (
    <div className="flex items-center justify-between">
      <div
        className="flex items-center gap-1"
        role="group"
        aria-label={t('shieldsRemainingAriaLabel', { count: shields })}
      >
        {Array.from({ length: Math.max(shields, 0) }).map((_, index) => (
          <Shield
            key={index}
            className="w-5 h-5"
            fill="var(--teal)"
            style={{ color: 'var(--teal)' }}
            aria-hidden="true"
          />
        ))}
        {shields === 0 && (
          <span className="text-xs font-medium" style={{ color: 'var(--accent-red)' }}>
            {t('noShieldsLeft')}
          </span>
        )}
      </div>

      {combo > 0 && (
        <div
          className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold"
          style={{ background: 'rgba(244, 162, 97, 0.15)', color: 'var(--gold)' }}
        >
          <span>{t('comboStreak', { count: combo })}</span>
          {multiplier > 1 && <span>{t('comboMultiplier', { multiplier })}</span>}
        </div>
      )}
    </div>
  )
}
