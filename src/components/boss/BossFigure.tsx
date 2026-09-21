'use client'

import { motion, useReducedMotion } from 'framer-motion'
import type { BossSvgVariant } from '@/content/bosses'

export type BossVisualState = 'idle' | 'hit' | 'defeated'

type BossFigureProps = {
  variant: BossSvgVariant
  accent: string
  state: BossVisualState
  className?: string
}

/** Subject motif drawn on top of the shared angular mask, centred in a
 * 200x200 viewBox. Kept intentionally simple (a handful of geometric
 * shapes) so every boss reads clearly at small mobile sizes. */
function BossMotif({ variant, accent }: { variant: BossSvgVariant; accent: string }) {
  switch (variant) {
    case 'tangent':
      // A tangent line grazing an arc of the unit circle.
      return (
        <g stroke={accent} strokeWidth={4} strokeLinecap="round" fill="none">
          <path d="M 60 128 A 40 40 0 0 1 128 96" opacity={0.85} />
          <line x1="52" y1="150" x2="150" y2="80" />
          <circle cx="150" cy="80" r="5" fill={accent} stroke="none" />
        </g>
      )
    case 'delta':
      // A delta / partial-derivative triangle.
      return (
        <g>
          <path
            d="M 100 68 L 140 138 L 60 138 Z"
            fill="none"
            stroke={accent}
            strokeWidth={5}
            strokeLinejoin="round"
          />
          <line x1="100" y1="98" x2="100" y2="138" stroke={accent} strokeWidth={3} opacity={0.6} />
        </g>
      )
    case 'circle':
      // A circle with two crossing chords - geometry's favourite trap.
      return (
        <g stroke={accent} strokeWidth={4} fill="none">
          <circle cx="100" cy="108" r="38" />
          <line x1="68" y1="90" x2="132" y2="126" strokeWidth={3} opacity={0.85} />
          <line x1="68" y1="126" x2="132" y2="90" strokeWidth={3} opacity={0.85} />
          <circle cx="68" cy="90" r="3" fill={accent} stroke="none" />
          <circle cx="132" cy="126" r="3" fill={accent} stroke="none" />
        </g>
      )
    case 'newton':
      // An apple silhouette with a falling trail - Newton's cue.
      return (
        <g>
          <path
            d="M100 84 C 84 84 72 98 72 116 C 72 136 86 150 100 150 C 114 150 128 136 128 116 C 128 98 116 84 100 84 Z"
            fill={accent}
            opacity={0.9}
          />
          <path d="M100 84 C 98 76 90 70 82 70" stroke={accent} strokeWidth={3} fill="none" strokeLinecap="round" />
          <path d="M100 78 C 108 68 112 58 108 48" stroke={accent} strokeWidth={2} fill="none" strokeDasharray="2 5" opacity={0.6} />
        </g>
      )
    case 'circuit':
      // A lightning-bolt zigzag.
      return (
        <path
          d="M 112 62 L 78 112 L 98 112 L 86 152 L 128 98 L 106 98 Z"
          fill={accent}
          stroke={accent}
          strokeWidth={2}
          strokeLinejoin="round"
        />
      )
    case 'dice':
      // A die face showing five pips.
      return (
        <g>
          <rect x="66" y="76" width="68" height="68" rx="12" fill="none" stroke={accent} strokeWidth={4} />
          {[
            [82, 92],
            [118, 92],
            [100, 110],
            [82, 128],
            [118, 128],
          ].map(([cx, cy]) => (
            <circle key={`${cx}-${cy}`} cx={cx} cy={cy} r="5" fill={accent} />
          ))}
        </g>
      )
    case 'generic':
    default:
      return (
        <path
          d="M100 76 L124 100 L100 140 L76 100 Z"
          fill="none"
          stroke={accent}
          strokeWidth={4}
          strokeLinejoin="round"
        />
      )
  }
}

const IDLE_BREATH = {
  scale: [1, 1.035, 1],
  transition: { duration: 2.6, repeat: Infinity, ease: 'easeInOut' as const },
}

const HIT_SHAKE = {
  x: [0, -10, 9, -7, 6, -3, 0],
  transition: { duration: 0.5, ease: 'easeInOut' as const },
}

const DEFEATED = {
  scale: 0.82,
  y: 18,
  rotate: -7,
  opacity: 0.4,
  transition: { duration: 1, ease: 'easeOut' as const },
}

export default function BossFigure({ variant, accent, state, className }: BossFigureProps) {
  const prefersReducedMotion = useReducedMotion()

  const animate = prefersReducedMotion
    ? state === 'defeated'
      ? { opacity: 0.4, scale: 0.9 }
      : { opacity: 1, scale: 1 }
    : state === 'defeated'
      ? DEFEATED
      : state === 'hit'
        ? HIT_SHAKE
        : IDLE_BREATH

  return (
    <motion.div
      className={className}
      animate={animate}
      role="img"
      aria-hidden="true"
      style={{ display: 'inline-block', filter: state === 'hit' ? 'brightness(1.3)' : undefined }}
    >
      <svg viewBox="0 0 200 200" width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <radialGradient id={`boss-glow-${variant}`} cx="50%" cy="45%" r="60%">
            <stop offset="0%" stopColor={accent} stopOpacity="0.35" />
            <stop offset="100%" stopColor={accent} stopOpacity="0" />
          </radialGradient>
          <linearGradient id={`boss-mask-${variant}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#21262d" />
            <stop offset="100%" stopColor="#0d1117" />
          </linearGradient>
        </defs>

        <circle cx="100" cy="100" r="96" fill={`url(#boss-glow-${variant})`} />

        {/* Angular mask - shared silhouette across every boss */}
        <polygon
          points="100,22 162,62 162,142 100,182 38,142 38,62"
          fill={`url(#boss-mask-${variant})`}
          stroke={accent}
          strokeWidth={3}
        />
        <polygon
          points="100,34 150,68 150,136 100,170 50,136 50,68"
          fill="none"
          stroke={accent}
          strokeWidth={1}
          opacity={0.35}
        />

        {/* Glowing eyes */}
        <ellipse cx="76" cy="92" rx="7" ry="9" fill={accent} opacity={state === 'defeated' ? 0.3 : 0.95} />
        <ellipse cx="124" cy="92" rx="7" ry="9" fill={accent} opacity={state === 'defeated' ? 0.3 : 0.95} />

        <BossMotif variant={variant} accent={accent} />

        {state === 'hit' && (
          <polygon
            points="100,22 162,62 162,142 100,182 38,142 38,62"
            fill={accent}
            opacity={0.25}
          />
        )}
      </svg>
    </motion.div>
  )
}
