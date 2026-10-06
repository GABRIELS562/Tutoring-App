import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

vi.mock('next/navigation', () => ({ useRouter: () => ({ refresh: vi.fn() }) }))

const AddTopicModal = (await import('../AddTopicModal')).default

/**
 * This modal had no dialog semantics at all - no role, no aria-modal, no
 * label, no focus management, no Escape. A screen reader announced
 * nothing when it opened, focus stayed wherever it had been, and Tab
 * walked straight out into the page sitting behind an opaque backdrop
 * that a sighted keyboard user cannot see, with no way back.
 *
 * The fix was not new code: useDialog already does all of this and was
 * already used by three dialogs in the boss battle. This one just never
 * adopted it.
 */
describe('AddTopicModal is a real dialog', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  async function open() {
    const user = userEvent.setup()
    render(<AddTopicModal />)
    await user.click(screen.getByRole('button', { name: /add topic/i }))
    return user
  }

  it('exposes itself as a modal dialog with an accessible name', async () => {
    await open()

    const dialog = screen.getByRole('dialog')
    expect(dialog).toHaveAttribute('aria-modal', 'true')
    expect(dialog).toHaveAccessibleName('Add New Topic')
  })

  it('moves focus into the dialog when it opens', async () => {
    await open()

    const dialog = screen.getByRole('dialog')
    await waitFor(() => expect(dialog.contains(document.activeElement)).toBe(true))
  })

  it('closes on Escape', async () => {
    const user = await open()

    await user.keyboard('{Escape}')

    await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument())
  })

  it('returns focus to the trigger when it closes', async () => {
    const user = await open()
    const trigger = screen.getByRole('button', { name: /add topic/i })

    await user.keyboard('{Escape}')

    await waitFor(() => expect(document.activeElement).toBe(trigger))
  })

  /**
   * The backdrop is a bare clickable div. Left exposed it is announced as
   * an unlabelled element sitting between the user and the form.
   */
  it('hides the backdrop from assistive tech', async () => {
    const { container } = render(<AddTopicModal />)
    const user = userEvent.setup()
    await user.click(screen.getByRole('button', { name: /add topic/i }))

    const backdrop = container.querySelector('.bg-black\\/60')
    expect(backdrop).toHaveAttribute('aria-hidden', 'true')
  })

  it('keeps Tab inside the dialog rather than letting it escape behind the backdrop', async () => {
    const user = await open()
    const dialog = screen.getByRole('dialog')

    // Walk well past the number of focusable controls in the form.
    for (let i = 0; i < 25; i++) {
      await user.tab()
      expect(dialog.contains(document.activeElement)).toBe(true)
    }
  })
})
