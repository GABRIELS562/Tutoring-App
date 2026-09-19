import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import Topbar from '../Topbar'
import { UserProvider } from '@/context/UserContext'
import type { UserData } from '@/context/UserContext'

vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: vi.fn(), refresh: vi.fn() }),
}))
vi.mock('@supabase/ssr', () => ({
  createBrowserClient: vi.fn(() => ({ auth: { signOut: vi.fn() } })),
}))

const demoUser: UserData = {
  id: 'demo-user',
  email: 'demo@example.com',
  name: 'Demo Student',
  grade: 11,
  school: null,
  xp: 0,
  streakCount: 0,
  hearts: 5,
  isPremium: false,
}

function renderTopbar() {
  return render(
    <UserProvider user={demoUser}>
      <Topbar title="Dashboard" />
    </UserProvider>
  )
}

describe('Topbar avatar menu', () => {
  it('the trigger\'s aria-controls points at the menu\'s id once open', async () => {
    const user = userEvent.setup()
    renderTopbar()

    const trigger = screen.getByRole('button', { name: /user menu/i })
    await user.click(trigger)

    const controlsId = trigger.getAttribute('aria-controls')
    expect(controlsId).toBeTruthy()
    expect(document.getElementById(controlsId!)).toBeInTheDocument()
  })

  it('Escape closes the menu and returns focus to the trigger', async () => {
    const user = userEvent.setup()
    renderTopbar()

    const trigger = screen.getByRole('button', { name: /user menu/i })
    await user.click(trigger)
    expect(trigger).toHaveAttribute('aria-expanded', 'true')

    await user.keyboard('{Escape}')

    expect(trigger).toHaveAttribute('aria-expanded', 'false')
    expect(document.activeElement).toBe(trigger)
  })
})
