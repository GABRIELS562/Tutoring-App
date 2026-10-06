import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import ExamItemCard from '../ExamItemCard'
import type { ExamItem } from '@/content/exam/types'

vi.mock('@/components/math/MathRenderer', () => ({
  default: ({ content }: { content: string }) => <span>{content}</span>,
}))

const ITEM = {
  id: 'q1',
  question: '1.1',
  prompt: 'Determine the mean of the given data.',
  marks: 2,
  topicSlug: 'statistics-gr11',
  solution: ['Mean = 408/19', '= 21,47'],
  markScheme: [
    { descriptor: '408/19', kind: 'method', value: 1 },
    { descriptor: 'answer', kind: 'answer', value: 1 },
  ],
} as unknown as ExamItem

function renderCard() {
  return render(
    <ExamItemCard item={ITEM} onDone={vi.fn()} />
  )
}

async function markItFully(user: ReturnType<typeof userEvent.setup>) {
  await user.click(screen.getByRole('button', { name: /got this/i }))
  await user.click(screen.getByRole('button', { name: /mark me/i }))
  for (const point of screen.getAllByRole('checkbox')) await user.click(point)
  await user.click(screen.getByRole('button', { name: /see how i did/i }))
}

/**
 * Every phase transition replaces the button the student just pressed, so
 * the browser drops focus to <body>. On a 53-question paper that is up to
 * five focus losses per question, at exactly the moment the new content
 * appears. There was also no live region anywhere in the card, so a blind
 * student marking themselves against the memo was told nothing about what
 * they scored - on the app's main differentiator.
 */
describe('ExamItemCard keeps a keyboard and screen-reader student oriented', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('does not steal focus when the card first renders', () => {
    renderCard()

    expect(document.activeElement).toBe(document.body)
  })

  it('moves focus into the new phase instead of dropping it to the body', async () => {
    const user = userEvent.setup()
    const { container } = renderCard()

    await user.click(screen.getByRole('button', { name: /got this/i }))

    await waitFor(() => {
      expect(document.activeElement).not.toBe(document.body)
      expect(container.contains(document.activeElement)).toBe(true)
    })
  })

  it('has a live region that starts empty', () => {
    const { container } = renderCard()

    const live = container.querySelector('[aria-live="polite"]')
    expect(live).not.toBeNull()
    expect(live?.textContent?.trim()).toBe('')
  })

  it('announces the marks earned and the total once the question is marked', async () => {
    const user = userEvent.setup()
    const { container } = renderCard()

    await markItFully(user)

    await waitFor(() => {
      const live = container.querySelector('[aria-live="polite"]')
      expect(live?.textContent).toMatch(/\b2\b/)
      expect(live?.textContent).toMatch(/out of/i)
    })
  })

  /**
   * The announcement has to carry the verdict, not just a number - the
   * point of the calibration feature is telling a student what the score
   * says about how well they actually knew it.
   */
  it('includes the calibration verdict, not only the bare numbers', async () => {
    const user = userEvent.setup()
    const { container } = renderCard()

    await markItFully(user)

    await waitFor(() => {
      const live = container.querySelector('[aria-live="polite"]')
      expect((live?.textContent ?? '').length).toBeGreaterThan(20)
    })
  })
})
