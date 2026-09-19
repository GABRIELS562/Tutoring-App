import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import SkipLink from '../SkipLink'

function renderWithTarget() {
  return render(
    <div>
      <SkipLink />
      <main id="main-content" tabIndex={-1}>
        page content
      </main>
    </div>
  )
}

describe('SkipLink', () => {
  it('is the first tab stop and moves focus to #main-content on click', async () => {
    // Arrange
    const user = userEvent.setup()
    renderWithTarget()

    // Act - tab to the skip link (it must be the first focusable element)
    await user.tab()
    const link = screen.getByRole('link', { name: /skip to content/i })
    expect(document.activeElement).toBe(link)

    await user.click(link)

    // Assert - focus actually moved to <main>, not just the URL hash changing
    const main = screen.getByRole('main')
    expect(document.activeElement).toBe(main)
  })

  it('also moves focus to #main-content when activated with the keyboard (Enter)', async () => {
    // Arrange
    const user = userEvent.setup()
    renderWithTarget()

    // Act
    await user.tab()
    await user.keyboard('{Enter}')

    // Assert
    const main = screen.getByRole('main')
    expect(document.activeElement).toBe(main)
  })
})
