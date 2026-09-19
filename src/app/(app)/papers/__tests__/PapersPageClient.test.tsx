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
    render(<PapersPageClient papers={papers} />)

    expect(screen.getByText('Showing 2 papers')).toBeInTheDocument()
  })

  it('filters by subject', async () => {
    const user = userEvent.setup()
    render(<PapersPageClient papers={papers} />)

    await user.selectOptions(screen.getByLabelText('Subject'), 'science')

    expect(screen.getByText('Showing 1 paper')).toBeInTheDocument()
  })

  it('shows a real "no papers" empty state distinct from the filtered one when the list itself is empty', () => {
    render(<PapersPageClient papers={[]} />)

    expect(screen.getByText('No past papers have been added yet.')).toBeInTheDocument()
  })
})
