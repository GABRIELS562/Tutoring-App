import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import PapersPageClient from '../PapersPageClient'
import type { PastPaperRecord } from '@/db/queries/topics'

vi.mock('@/components/layout/Topbar', () => ({
  default: ({ title }: { title: string }) => <div>{title}</div>,
}))

const papers: PastPaperRecord[] = [
  { id: 'p1', grade: 12, subject: 'maths', year: 2024, examType: 'NSC', paperNumber: 1, language: 'English', pdfUrl: 'https://example.com/p1.pdf', memoUrl: null, topicsCovered: ['Algebra'] },
  { id: 'p2', grade: 10, subject: 'science', year: 2023, examType: 'Common', paperNumber: 2, language: 'English', pdfUrl: 'https://example.com/p2.pdf', memoUrl: null, topicsCovered: ['Waves'] },
]

describe('PapersPageClient', () => {
  it('renders every paper it is given', () => {
    render(<PapersPageClient papers={papers} playable={[]} />)

    expect(screen.getByText('Showing 2 papers')).toBeInTheDocument()
  })

  it('filters by subject', async () => {
    const user = userEvent.setup()
    render(<PapersPageClient papers={papers} playable={[]} />)

    await user.selectOptions(screen.getByLabelText('Subject'), 'science')

    expect(screen.getByText('Showing 1 paper')).toBeInTheDocument()
  })

  it('shows a real "no papers" empty state distinct from the filtered one when the list itself is empty', () => {
    render(<PapersPageClient papers={[]} playable={[]} />)

    expect(screen.getByText('No past papers have been added yet.')).toBeInTheDocument()
  })
})

/**
 * The exam game lives at /exam, but a student looking for past papers comes
 * HERE. This page never mentioned it, so the one gamified thing in the app
 * was invisible from the page it belongs to — you could browse fifty papers
 * and never learn that any of them could be played.
 */
describe('playable papers', () => {
  const playable = [
    {
      key: 'gr11-p2-2013',
      title: 'Mathematics Paper 2',
      source: 'DBE Grade 11 Exemplar 2013',
      questionCount: 53,
      totalMarks: 150,
    },
  ]

  it('offers the playable papers with a link into the exam game', () => {
    render(<PapersPageClient papers={[]} playable={playable} />)

    const link = screen
      .getAllByRole('link')
      .find((a) => a.getAttribute('href') === '/exam')

    expect(link, 'the papers page does not link to the exam game').toBeDefined()
    expect(link).toHaveTextContent('Mathematics Paper 2')
  })

  it('says how many are playable rather than implying all of them are', () => {
    render(<PapersPageClient papers={[]} playable={playable} />)

    expect(screen.getByText(/1 of these papers are playable/i)).toBeInTheDocument()
  })

  it('shows nothing when no paper has been transcribed yet', () => {
    render(<PapersPageClient papers={[]} playable={[]} />)

    const link = screen
      .queryAllByRole('link')
      .find((a) => a.getAttribute('href') === '/exam')

    expect(link).toBeUndefined()
  })
})
