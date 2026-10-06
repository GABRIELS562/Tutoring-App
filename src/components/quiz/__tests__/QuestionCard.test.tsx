import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import QuestionCard from '../QuestionCard'

/**
 * The answered state's option badges, which is where a contrast bug lived.
 *
 * Both badges took `color: 'white'` from one ternary. White on the red
 * "you picked wrong" badge is 4.92:1 and fine; white on the TEAL "this was
 * the right answer" badge was 1.86:1 - the single least readable thing in
 * the app, on the screen a student only reaches by getting it wrong.
 *
 * The palette test holds the tokens and a source guard holds the pairing;
 * this holds the rendered result, because the two fills need OPPOSITE text
 * colours and a guard that only forbids white would be satisfied by making
 * both of them dark.
 */

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

/** The badge <span> inside the option button for `letter`. */
function badgeFor(letter: string): HTMLElement {
  const badge = screen
    .getAllByText(letter, { selector: 'span' })
    .find((el) => el.textContent?.trim() === letter)
  expect(badge, `no badge for option ${letter}`).toBeDefined()
  return badge as HTMLElement
}

function renderCard() {
  return render(
    <QuestionCard
      question={QUESTION}
      onAnswer={vi.fn()}
      onNext={vi.fn()}
    />
  )
}

describe('QuestionCard answered-state badges', () => {
  it('the correct badge gets DARK text on its teal fill', async () => {
    // Arrange
    const user = userEvent.setup()
    renderCard()

    // Act - pick the wrong option, which reveals both badges
    await user.click(screen.getByText('Five'))

    // Assert
    const correct = badgeFor('A')
    expect(correct.style.background).toBe('var(--teal)')
    expect(correct.style.color).toBe('var(--bg)')
  })

  it('the wrongly-picked badge keeps WHITE text on its red fill', async () => {
    // Arrange
    const user = userEvent.setup()
    renderCard()

    // Act
    await user.click(screen.getByText('Five'))

    // Assert
    const picked = badgeFor('B')
    expect(picked.style.background).toBe('var(--accent-red)')
    expect(picked.style.color).toBe('white')
  })

  it('the two badges do not share a text colour', async () => {
    // Arrange
    const user = userEvent.setup()
    renderCard()

    // Act
    await user.click(screen.getByText('Five'))

    // Assert - one ternary for both was the bug; this is what forbids it
    expect(badgeFor('A').style.color).not.toBe(badgeFor('B').style.color)
  })

  it('unanswered badges carry neither fill', () => {
    // Arrange / Act
    renderCard()

    // Assert
    for (const letter of ['A', 'B']) {
      expect(badgeFor(letter).style.background).toBe('var(--surface)')
      expect(badgeFor(letter).style.color).toBe('var(--text)')
    }
  })
})

/**
 * Whether a student can tell they got it right WITHOUT seeing colour.
 *
 * Correct and wrong-selected previously differed only in hue - both drew a
 * 2px border, neither carried an icon or any text, and the only live region
 * in the flow (QuizEngine's) announces which question you are on, not how
 * you did. So a colour-blind student saw two near-identical highlighted
 * options and a blind student heard nothing at all. WCAG 1.4.1.
 */
describe('the result survives without colour', () => {
  it('marks the correct option with something other than a colour', async () => {
    const user = userEvent.setup()
    renderCard()

    await user.click(screen.getByRole('button', { name: /Four/ }))

    const correct = screen.getByRole('button', { name: /Four/ })
    // An icon alone is aria-hidden, so the accessible name is what proves
    // a screen reader gets it too.
    expect(correct).toHaveAccessibleName(/correct/i)
    expect(correct.querySelector('svg')).not.toBeNull()
  })

  it('marks a wrong choice as wrong, and still shows which one was right', async () => {
    const user = userEvent.setup()
    renderCard()

    await user.click(screen.getByRole('button', { name: /Five/ }))

    expect(screen.getByRole('button', { name: /Five/ })).toHaveAccessibleName(
      /incorrect/i
    )
    expect(screen.getByRole('button', { name: /Four/ })).toHaveAccessibleName(
      /correct/i
    )
  })

  it('announces the outcome in a live region', async () => {
    const user = userEvent.setup()
    const { container } = renderCard()

    const live = container.querySelector('[aria-live="polite"]')
    expect(live, 'no live region in the card').not.toBeNull()
    expect(live?.textContent?.trim()).toBe('')

    await user.click(screen.getByRole('button', { name: /Five/ }))

    expect(live?.textContent).toMatch(/incorrect/i)
    // Naming the right answer is the point - "Incorrect" alone leaves a
    // blind student with no way to learn what it should have been.
    expect(live?.textContent).toMatch(/\bA\b/)
  })

  /**
   * `disabled` on the button the student just clicked makes the browser
   * blur it to <body>. A keyboard user loses their place, and a screen
   * reader loses its reading cursor, at the exact moment the result
   * appears - so the announcement above lands nowhere.
   */
  it('keeps the answered option focusable so focus is not dropped to the body', async () => {
    const user = userEvent.setup()
    renderCard()

    const chosen = screen.getByRole('button', { name: /Five/ })
    await user.click(chosen)

    const after = screen.getByRole('button', { name: /Five/ })
    expect(after).not.toBeDisabled()
    expect(after).toHaveAttribute('aria-disabled', 'true')
    expect(document.activeElement).not.toBe(document.body)
  })

  it('still ignores a second click once answered', async () => {
    const user = userEvent.setup()
    const onAnswer = vi.fn()
    render(<QuestionCard question={QUESTION} onAnswer={onAnswer} onNext={vi.fn()} />)

    await user.click(screen.getByRole('button', { name: /Five/ }))
    await user.click(screen.getByRole('button', { name: /Four/ }))

    expect(onAnswer).toHaveBeenCalledTimes(1)
    expect(onAnswer).toHaveBeenCalledWith('B', false)
  })
})
