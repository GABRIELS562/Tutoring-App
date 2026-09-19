import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { UserProvider } from '@/context/UserContext'
import type { UserData } from '@/context/UserContext'
import PracticePageClient from '../PracticePageClient'

const replaceMock = vi.fn()

vi.mock('next/navigation', () => ({
  useRouter: () => ({ replace: replaceMock }),
}))

vi.mock('@/components/layout/Topbar', () => ({
  default: ({ title }: { title: string }) => <div>{title}</div>,
}))

vi.mock('@/components/quiz/QuizEngine', () => ({
  default: () => <div>quiz engine</div>,
}))

const demoUser: UserData = {
  id: 'user-1',
  email: 'a@b.com',
  name: 'A Student',
  grade: 11,
  school: null,
  xp: 0,
  streakCount: 0,
  hearts: 5,
  isPremium: false,
}

function renderClient(props: Partial<React.ComponentProps<typeof PracticePageClient>> = {}) {
  return render(
    <UserProvider user={demoUser}>
      <PracticePageClient
        slug="trig-gr11"
        initialQuestions={[]}
        isDemo={false}
        topicName="Trigonometry"
        topicPaper={2}
        {...props}
      />
    </UserProvider>
  )
}

describe('PracticePageClient difficulty selector', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('navigates via router.replace instead of a full page reload', async () => {
    // Arrange
    const user = userEvent.setup()
    renderClient()

    // Act
    await user.click(screen.getByRole('button', { name: /easy/i }))

    // Assert
    expect(replaceMock).toHaveBeenCalledWith('/topics/trig-gr11/practice?difficulty=1')
  })

  it('clears the query string when "All" is selected', async () => {
    // Arrange
    const user = userEvent.setup()
    renderClient({ difficulty: 2 })

    // Act
    await user.click(screen.getByRole('button', { name: /^all$/i }))

    // Assert
    expect(replaceMock).toHaveBeenCalledWith('/topics/trig-gr11/practice')
  })
})
