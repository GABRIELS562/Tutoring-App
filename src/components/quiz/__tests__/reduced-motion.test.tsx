import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import type { ReactNode } from 'react'

/**
 * Under `prefers-reduced-motion`, nothing may START invisible.
 *
 * This is the hazard the codebase already had a comment about for fades -
 * "a stalled animation must not leave the student on an empty page" - and
 * reduced motion is exactly the case where the animation does not run.
 * The quiz had `initial={{ scale: 0 }}` on the results trophy, which is
 * zero SIZE, and four `initial={{ y: N }}` offsets.
 *
 * Framer Motion is mocked to a prop-recording passthrough: what matters is
 * the `initial` each component hands it, not what Framer then does with it.
 */

type MotionProps = {
  initial?: unknown
  animate?: unknown
  transition?: unknown
  children?: ReactNode
  [key: string]: unknown
}

const { recorded, useReducedMotionMock } = vi.hoisted(() => ({
  recorded: [] as MotionProps[],
  useReducedMotionMock: vi.fn<() => boolean>(() => false),
}))

// Async factory so React comes in through a real import - the factory is
// hoisted above this file's own imports, so it cannot use one of those.
vi.mock('framer-motion', async () => {
  const React = await import('react')
  const make = () =>
    function MockMotion({ initial, animate, transition, children, ...rest }: MotionProps) {
      recorded.push({ initial, animate, transition })
      return React.createElement('div', rest, children)
    }
  return {
    useReducedMotion: useReducedMotionMock,
    AnimatePresence: ({ children }: { children?: ReactNode }) => children,
    motion: new Proxy({}, { get: make }),
  }
})

vi.mock('@/app/(app)/topics/[slug]/practice/actions', () => ({
  recordAnswer: vi.fn(async () => ({ ok: true, xpEarned: 0 })),
  completeQuiz: vi.fn(async () => ({ ok: true })),
}))

const QUESTION = {
  id: 'q1',
  topicName: 'Trigonometry',
  questionText: 'What is 2 plus 2?',
  difficulty: 1,
  options: [
    { id: 'o1', optionLetter: 'A', optionText: 'Four', isCorrect: true },
    { id: 'o2', optionLetter: 'B', optionText: 'Five', isCorrect: false },
  ],
  steps: [],
}

/** Any property that, left at this value, renders the element unreadable. */
const HIDING = {
  opacity: (v: unknown) => v === 0,
  scale: (v: unknown) => v === 0,
}

function hidingProps(initial: unknown): string[] {
  if (!initial || typeof initial !== 'object') return []
  return Object.entries(initial as Record<string, unknown>)
    .filter(([key, value]) => key in HIDING && HIDING[key as keyof typeof HIDING](value))
    .map(([key, value]) => `${key}:${String(value)}`)
}

function displacingProps(initial: unknown): string[] {
  if (!initial || typeof initial !== 'object') return []
  return Object.entries(initial as Record<string, unknown>)
    .filter(([key, value]) => (key === 'x' || key === 'y') && value !== 0)
    .map(([key, value]) => `${key}:${String(value)}`)
}

beforeEach(() => {
  recorded.length = 0
  useReducedMotionMock.mockReset()
})

/**
 * Renders the card and answers it, so the motion elements that only exist
 * in the answered state ("Ask Angelo", "Next") are recorded too - three of
 * the four in this component are conditional, and a first version of these
 * tests silently covered only the one that renders immediately. A mutation
 * run is what showed that: un-guarding the "Next" block changed nothing.
 *
 * Reaches 3 of the 4. The fourth is Angelo's response, which needs a
 * successful /api/ai-hint call to exist at all, so it stays uncovered -
 * removing its guard does NOT fail these tests.
 */
async function renderAnswered() {
  const { default: QuestionCard } = await import('../QuestionCard')
  const user = userEvent.setup()
  render(<QuestionCard question={QUESTION} onAnswer={vi.fn()} onNext={vi.fn()} />)
  await user.click(screen.getByText('Five'))
  return recorded.length
}

describe('QuestionCard honours prefers-reduced-motion', () => {
  it('animates normally when motion is allowed', async () => {
    // Arrange
    useReducedMotionMock.mockReturnValue(false)
    const { default: QuestionCard } = await import('../QuestionCard')

    // Act
    render(<QuestionCard question={QUESTION} onAnswer={vi.fn()} onNext={vi.fn()} />)

    // Assert - the slide is still there for everyone else
    expect(recorded.some((p) => displacingProps(p.initial).length > 0)).toBe(true)
  })

  it('starts settled - nothing offset, nothing invisible - when reduced motion is set', async () => {
    // Arrange
    useReducedMotionMock.mockReturnValue(true)

    // Act
    const count = await renderAnswered()

    // Assert
    expect(count).toBeGreaterThanOrEqual(3)
    for (const props of recorded) {
      expect(hidingProps(props.initial), `initial would hide: ${JSON.stringify(props.initial)}`)
        .toEqual([])
      expect(displacingProps(props.initial), `initial would offset: ${JSON.stringify(props.initial)}`)
        .toEqual([])
    }
  })

  it('collapses every transition to zero duration when reduced motion is set', async () => {
    // Arrange
    useReducedMotionMock.mockReturnValue(true)

    // Act
    const count = await renderAnswered()

    // Assert - a motion element with no transition at all would animate at
    // Framer's default, so every one of them must carry an explicit 0.
    expect(count).toBeGreaterThanOrEqual(3)
    for (const props of recorded) {
      expect(props.transition, 'a motion element passed no transition').toBeDefined()
      expect((props.transition as { duration?: number }).duration).toBe(0)
    }
  })
})
