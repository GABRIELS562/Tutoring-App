import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import Sidebar from '../Sidebar'

vi.mock('next/navigation', () => ({
  usePathname: () => '/dashboard',
  useRouter: () => ({ push: vi.fn(), refresh: vi.fn() }),
}))
vi.mock('@supabase/ssr', () => ({
  createBrowserClient: vi.fn(() => ({ auth: { signOut: vi.fn() } })),
}))

/**
 * The exam game is the headline feature and it shipped with no link to it
 * at all - it was reachable only by typing /exam. A feature nobody can find
 * is not a feature, and nothing in the build would have reported it.
 */
describe('Sidebar navigation', () => {
  it('links to the exam game', () => {
    render(<Sidebar />)

    const link = screen
      .getAllByRole('link')
      .find((a) => a.getAttribute('href') === '/exam')

    expect(link, '/exam is not reachable from the sidebar').toBeDefined()
  })

  it('keeps every primary destination reachable', () => {
    render(<Sidebar />)
    const hrefs = screen.getAllByRole('link').map((a) => a.getAttribute('href'))

    for (const destination of ['/dashboard', '/subjects', '/ai-skills', '/exam', '/papers', '/progress']) {
      expect(hrefs, `${destination} is not in the sidebar`).toContain(destination)
    }
  })
})
