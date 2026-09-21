import { describe, it, expect, vi, afterEach } from 'vitest'
import { renderHook } from '@testing-library/react'
import { useMotionSafe } from '../useMotionSafe'

const { useReducedMotionMock } = vi.hoisted(() => ({
  useReducedMotionMock: vi.fn<() => boolean>(() => false),
}))

vi.mock('framer-motion', () => ({
  useReducedMotion: useReducedMotionMock,
}))

afterEach(() => {
  useReducedMotionMock.mockReset()
  useReducedMotionMock.mockReturnValue(false)
})

describe('useMotionSafe (motion allowed)', () => {
  it('reports prefersReducedMotion: false and passes transitions/variants through unchanged', () => {
    useReducedMotionMock.mockReturnValue(false)
    const { result } = renderHook(() => useMotionSafe())

    expect(result.current.prefersReducedMotion).toBe(false)
    expect(result.current.transition({ duration: 0.5, ease: 'easeOut' })).toEqual({
      duration: 0.5,
      ease: 'easeOut',
    })
    expect(result.current.variant({ x: [0, -10, 0] }, { opacity: 1 })).toEqual({ x: [0, -10, 0] })
  })
})

describe('useMotionSafe (prefers-reduced-motion)', () => {
  it('forces transitions to duration 0 and swaps variants for their opacity-only fallback', () => {
    useReducedMotionMock.mockReturnValue(true)
    const { result } = renderHook(() => useMotionSafe())

    expect(result.current.prefersReducedMotion).toBe(true)
    expect(result.current.transition({ duration: 0.5, ease: 'easeOut' })).toEqual({
      duration: 0,
      ease: 'easeOut',
    })
    expect(result.current.variant({ x: [0, -10, 0] }, { opacity: 1 })).toEqual({ opacity: 1 })
  })
})
