import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import NoteBlock from '../NoteBlock'
import type { NoteBlock as NoteBlockType } from '@/types'

vi.mock('next-intl', () => ({
  useLocale: () => 'en',
  useTranslations: () => (key: string) => {
    const messages: Record<string, string> = {
      noVideoAvailable: 'No video available in your language',
    }
    return messages[key] ?? key
  },
}))

describe('NoteBlock video case', () => {
  it('renders an iframe pointing at the YouTube embed URL when a videoId is set', () => {
    // Arrange
    const block: NoteBlockType = {
      type: 'video',
      title: 'Watch: Example — Channel',
      videoId: 'abc123XYZ90',
    }

    // Act
    const { container } = render(<NoteBlock block={block} />)

    // Assert
    const iframe = container.querySelector('iframe')
    expect(iframe).not.toBeNull()
    expect(iframe).toHaveAttribute('src', expect.stringContaining('youtube.com/embed/abc123XYZ90'))
  })

  it('does not render an "Open in YouTube" link', () => {
    // Arrange
    const block: NoteBlockType = {
      type: 'video',
      title: 'Watch: Example — Channel',
      videoId: 'abc123XYZ90',
    }

    // Act
    render(<NoteBlock block={block} />)

    // Assert
    expect(screen.queryByRole('link')).not.toBeInTheDocument()
    expect(screen.queryByText(/open in youtube/i)).not.toBeInTheDocument()
  })

  it('renders the no-video message and no iframe when videoId is missing', () => {
    // Arrange
    const block: NoteBlockType = {
      type: 'video',
      title: 'Untitled topic video',
    }

    // Act
    const { container } = render(<NoteBlock block={block} />)

    // Assert
    expect(screen.getByText('No video available in your language')).toBeInTheDocument()
    expect(container.querySelector('iframe')).toBeNull()
  })
})
