import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { UserProvider } from '@/context/UserContext'
import type { UserData } from '@/context/UserContext'
import SubjectPageClient from '../SubjectPageClient'
import { contentRegistry, getTopicsForSubjectGrade } from '@/content/registry'

vi.mock('@/components/layout/Topbar', () => ({
  default: ({ title }: { title: string }) => <div>{title}</div>,
}))

function renderWithUser(ui: React.ReactElement, user: UserData | null) {
  return render(<UserProvider user={user}>{ui}</UserProvider>)
}

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

const topicsByGrade = {
  10: getTopicsForSubjectGrade('maths', 10),
  11: getTopicsForSubjectGrade('maths', 11),
  12: getTopicsForSubjectGrade('maths', 12),
}

describe('SubjectPageClient', () => {
  it('renders only slugs that exist in the content registry', () => {
    // Arrange / Act
    renderWithUser(
      <SubjectPageClient subject="maths" topicsByGrade={topicsByGrade} progressBySlug={{}} />,
      demoUser
    )

    // Assert - every topic link href points at a slug that is real content
    const links = screen.getAllByRole('link').filter((el) =>
      el.getAttribute('href')?.startsWith('/topics/')
    )
    expect(links.length).toBeGreaterThan(0)
    for (const link of links) {
      const slug = link.getAttribute('href')?.replace('/topics/', '')
      expect(contentRegistry[slug ?? '']).toBeDefined()
    }
  })

  it('renders a topic title from the registry for the default grade tab', () => {
    // Arrange / Act
    renderWithUser(
      <SubjectPageClient subject="maths" topicsByGrade={topicsByGrade} progressBySlug={{}} />,
      demoUser
    )

    // Assert
    expect(screen.getByText('Trigonometry')).toBeInTheDocument()
  })

  it('shows no locked topics on the student\'s own grade tab', () => {
    // Arrange - a grade 10 student
    const grade10User: UserData = { ...demoUser, grade: 10 }

    // Act
    renderWithUser(
      <SubjectPageClient subject="maths" topicsByGrade={topicsByGrade} progressBySlug={{}} />,
      grade10User
    )

    // Assert - default tab follows the user's own grade (10), so nothing is locked yet
    expect(screen.queryByText('Locked')).not.toBeInTheDocument()
  })

  it('locks a grade tab above the student\'s real grade and renders topics as non-links', async () => {
    // Arrange - a grade 10 student previewing Grade 12 content
    const grade10User: UserData = { ...demoUser, grade: 10 }
    const user = userEvent.setup()

    renderWithUser(
      <SubjectPageClient subject="maths" topicsByGrade={topicsByGrade} progressBySlug={{}} />,
      grade10User
    )

    // Act
    await user.click(screen.getByRole('button', { name: 'Grade 12' }))

    // Assert
    expect(screen.getAllByText('Locked').length).toBeGreaterThan(0)
    const topicLinks = screen.queryAllByRole('link').filter((el) =>
      el.getAttribute('href')?.startsWith('/topics/')
    )
    expect(topicLinks).toHaveLength(0)
  })
})
