'use client'

import { AnimatePresence, motion } from 'framer-motion'
import { useMotionSafe } from '@/hooks/useMotionSafe'

type DamageNumberProps = {
  /** A fresh key (e.g. an incrementing counter) each time damage is dealt,
   * so AnimatePresence treats every hit as a new element to animate even
   * if the damage amount repeats. null/0 renders nothing. */
  damageKey: number
  damage: number | null
}

/** Floating "-5" that rises and fades over the HP bar whenever damage is
 * dealt. Purely decorative (aria-hidden) - the live region in
 * BossBattleClient carries the same information for screen readers. */
export default function DamageNumber({ damageKey, damage }: DamageNumberProps) {
  const { transition, variant } = useMotionSafe()

  return (
    <div className="relative h-0" aria-hidden="true">
      <AnimatePresence>
        {damage !== null && damage > 0 && (
          <motion.div
            key={damageKey}
            initial={variant({ opacity: 0, y: 0, scale: 0.8 }, { opacity: 0 })}
            animate={variant({ opacity: 1, y: -28, scale: 1.1 }, { opacity: 1 })}
            exit={variant({ opacity: 0, y: -44 }, { opacity: 0 })}
            transition={transition({ duration: 0.7, ease: 'easeOut' })}
            className="absolute right-2 -top-2 text-lg font-extrabold pointer-events-none"
            style={{ color: 'var(--accent-red)' }}
          >
            -{damage}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
