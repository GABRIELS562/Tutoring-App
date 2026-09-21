'use client'

import { useReducedMotion } from 'framer-motion'
import type { Transition } from 'framer-motion'

export type MotionSafe = {
  /** True when the OS/browser `prefers-reduced-motion: reduce` is set. */
  prefersReducedMotion: boolean
  /** Returns `transition` unchanged, or the same transition with its
   * duration forced to 0 (instant) when reduced motion is preferred. Spring
   * transitions (no `duration`) still resolve instantly in practice once
   * `duration: 0` is present, since Framer Motion treats an explicit
   * duration as an override. */
  transition: <T extends Transition>(transition: T) => T
  /** Returns `full` unchanged, or `reduced` (an opacity-only animation
   * target, e.g. `{ opacity: 1 }` / `{ opacity: 0.4 }`) when reduced motion
   * is preferred - for variants that otherwise shake/bounce/float/translate. */
  variant: <T, R>(full: T, reduced: R) => T | R
}

/**
 * Wraps Framer Motion's `useReducedMotion` with two small helpers so every
 * boss battle animation can honour `prefers-reduced-motion` the same way:
 * transitions collapse to duration 0 (instant) and motion variants that
 * move/shake/scale fall back to an opacity-only equivalent.
 */
export function useMotionSafe(): MotionSafe {
  const prefersReducedMotion = Boolean(useReducedMotion())

  return {
    prefersReducedMotion,
    transition: (transition) => (prefersReducedMotion ? { ...transition, duration: 0 } : transition),
    variant: (full, reduced) => (prefersReducedMotion ? reduced : full),
  }
}
