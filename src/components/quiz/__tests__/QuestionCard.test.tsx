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
