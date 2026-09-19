import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import TopicPageClient from '../TopicPageClient'
import { UserProvider } from '@/context/UserContext'
import type { UserData } from '@/context/UserContext'
import type { TopicContent } from '@/types'

const isTopicDownloadedMock = vi.fn()
const getDownloadedTopicCountMock = vi.fn()
const storeTopicMock = vi.fn()

vi.mock('@/lib/offlineStorage', () => ({
  isTopicDownloaded: (...args: unknown[]) => isTopicDownloadedMock(...args),
  getDownloadedTopicCount: (...args: unknown[]) => getDownloadedTopicCountMock(...args),
  storeTopic: (...args: unknown[]) => storeTopicMock(...args),
}))

vi.mock('@/components/ui/VoicePlayer', () => ({ default: () => null }))
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

const content: TopicContent = {
  id: 't1',
  slug: 'trig-gr11',
  subject: 'maths',
  grade: 11,
  paper: 2,
  title: 'Trigonometry',
  capsWeight: 25,
  sections: [{ id: 'intro', title: 'Introduction', blocks: [] }],
}

function renderTopic() {
  return render(
    <UserProvider user={demoUser}>
      <TopicPageClient slug="trig-gr11" content={content} />
    </UserProvider>
  )
}

describe('TopicPageClient offline download button', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    isTopicDownloadedMock.mockResolvedValue(false)
    getDownloadedTopicCountMock.mockResolvedValue(0)
    storeTopicMock.mockResolvedValue(undefined)
  })

  it('shows "Saving..." while the download is in flight', async () => {
    // Arrange - fetch/caches never resolve, so the component is pinned in
    // the 'downloading' state for the duration of this test. indexedDB
    // just needs to exist for the `'indexedDB' in window` feature check
    // the component does before it will even attempt a download - jsdom
    // doesn't implement it, offlineStorage.ts is mocked above regardless.
    vi.stubGlobal('caches', { open: vi.fn(() => new Promise(() => {})) })
    vi.stubGlobal('fetch', vi.fn(() => new Promise(() => {})))
    vi.stubGlobal('indexedDB', {})
    const user = userEvent.setup()
    renderTopic()

    // Act
    await user.click(screen.getAllByRole('button', { name: /save notes for offline/i })[0])

    // Assert
    expect(await screen.findByText('Saving...')).toBeInTheDocument()
  })

  it('shows "Saved for offline" once the download completes', async () => {
    // Arrange - fetch/caches resolve immediately
    vi.stubGlobal('caches', { open: vi.fn(async () => ({ put: vi.fn() })) })
    vi.stubGlobal('fetch', vi.fn(async () => ({ clone: () => ({}) })))
    vi.stubGlobal('indexedDB', {})
    const user = userEvent.setup()
    renderTopic()

    // Act
    await user.click(screen.getAllByRole('button', { name: /save notes for offline/i })[0])

    // Assert
    expect(await screen.findByText('Saved for offline')).toBeInTheDocument()
    expect(storeTopicMock).toHaveBeenCalledWith(
      expect.objectContaining({ slug: 'trig-gr11', title: 'Trigonometry' })
    )
  })
})
