import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import LanguageToggle from '../LanguageToggle'

vi.mock('next/navigation', () => ({
  useRouter: () => ({ refresh: vi.fn() }),
}))

describe('LanguageToggle dropdown', () => {
  beforeEach(() => {
    document.cookie = 'NEXT_LOCALE=; max-age=0; path=/'
  })

  it('the trigger\'s aria-controls points at the panel\'s id once open', async () => {
    const user = userEvent.setup()
    render(<LanguageToggle />)

    const trigger = screen.getByRole('button', { name: /switch to/i })
    await user.click(trigger)

    const controlsId = trigger.getAttribute('aria-controls')
    expect(controlsId).toBeTruthy()
    expect(document.getElementById(controlsId!)).toBeInTheDocument()
  })

  it('Escape closes the dropdown and returns focus to the trigger', async () => {
    const user = userEvent.setup()
    render(<LanguageToggle />)

    const trigger = screen.getByRole('button', { name: /switch to/i })
    await user.click(trigger)
    expect(trigger).toHaveAttribute('aria-expanded', 'true')

    await user.keyboard('{Escape}')

    expect(trigger).toHaveAttribute('aria-expanded', 'false')
    expect(document.activeElement).toBe(trigger)
  })
})
