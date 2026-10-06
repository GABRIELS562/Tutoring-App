import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import DamageNumber from '../DamageNumber'

// DamageNumber's motion values (initial/animate/exit/transition) all flow
// through useMotionSafe rather than being written inline - mock the hook
// directly (rather than framer-motion's useReducedMotion) so this test
// asserts the contract DamageNumber has with the hook, independent of how
// useMotionSafe itself decides prefersReducedMotion (covered by
// src/hooks/__tests__/useMotionSafe.test.ts).
const { transitionMock, variantMock } = vi.hoisted(() => ({
  transitionMock: vi.fn((t) => t),
  variantMock: vi.fn((full) => full),
}))

vi.mock('@/hooks/useMotionSafe', () => ({
  useMotionSafe: () => ({
    prefersReducedMotion: false,
    transition: transitionMock,
    variant: variantMock,
  }),
}))

beforeEach(() => {
  transitionMock.mockClear()
  variantMock.mockClear()
})

describe('DamageNumber + useMotionSafe (mocked)', () => {
  it('asks the hook for a reduced-motion-safe transition and float/opacity-only variants for each motion prop', () => {
    render(<DamageNumber damageKey={1} damage={5} />)

    // transition() is asked to make the 0.7s float-and-fade instant when
    // reduced motion is preferred.
    expect(transitionMock).toHaveBeenCalledWith({ duration: 0.7, ease: 'easeOut' })

    // variant() is asked, for each of initial/animate/exit, to swap the
    // "floats up and scales" motion for an opacity-only fallback.
    expect(variantMock).toHaveBeenCalledWith({ opacity: 0, y: 0, scale: 0.8 }, { opacity: 0 })
    expect(variantMock).toHaveBeenCalledWith({ opacity: 1, y: -28, scale: 1.1 }, { opacity: 1 })
    expect(variantMock).toHaveBeenCalledWith({ opacity: 0, y: -44 }, { opacity: 0 })
  })

  it('renders nothing (no motion node asked for) when there is no damage to show', () => {
    render(<DamageNumber damageKey={0} damage={null} />)
    expect(variantMock).not.toHaveBeenCalled()
  })
})

/**
 * The tests above mock useMotionSafe and then assert what it was CALLED
 * with, which never reads the rendered output. Changing the component to
 * render `{damage + 999}` instead of `-{damage}` left both of them green
 * - so the only number a student sees per hit was effectively untested.
 */
describe('DamageNumber renders the damage it was given', () => {
  it('shows the hit as a negative number', () => {
    render(<DamageNumber damageKey={1} damage={5} />)

    expect(screen.getByText('-5')).toBeInTheDocument()
  })

  it('shows a different hit correctly, so the value is not hard-coded', () => {
    render(<DamageNumber damageKey={2} damage={12} />)

    expect(screen.getByText('-12')).toBeInTheDocument()
    expect(screen.queryByText('-5')).not.toBeInTheDocument()
  })

  it('renders nothing at all when there is no damage', () => {
    const { container } = render(<DamageNumber damageKey={0} damage={null} />)

    expect(container.textContent).toBe('')
  })

  /**
   * damage === 0 is the falsy-but-not-null case the original tests never
   * covered. A zero-damage hit should show nothing rather than "-0".
   */
  it('does not render "-0" for a zero-damage hit', () => {
    render(<DamageNumber damageKey={3} damage={0} />)

    expect(screen.queryByText('-0')).not.toBeInTheDocument()
  })
})
