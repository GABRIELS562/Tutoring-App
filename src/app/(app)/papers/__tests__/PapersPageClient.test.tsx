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
    {
      key: 'gr11-p1-2013-en',
      title: 'Mathematics Paper 1',
      source: 'DBE Grade 11 Exemplar 2013',
      questionCount: 52,
      totalMarks: 150,
    },
  ]

  it('offers the playable papers with a link into the exam game', () => {
    render(<PapersPageClient papers={[]} playable={playable} />)

    const link = screen
      .getAllByRole('link')
      .find((a) => a.getAttribute('href') === '/exam/gr11-p2-2013')

    expect(link, 'the papers page does not link to the exam game').toBeDefined()
    expect(link).toHaveTextContent('Mathematics Paper 2')
  })

  /**
   * Each card must link to ITS OWN paper. Every language now has both P1
   * and P2, and the link used to be a hard-coded '/exam' - so every card
   * opened whichever paper that page happened to pick, and the other was
   * unreachable.
   */
  it('links each paper to itself, not all of them to one place', () => {
    render(<PapersPageClient papers={[]} playable={playable} />)

    const hrefs = screen
      .getAllByRole('link')
      .map((a) => a.getAttribute('href'))
      .filter((href): href is string => !!href?.startsWith('/exam'))

    expect(hrefs).toEqual(['/exam/gr11-p2-2013', '/exam/gr11-p1-2013-en'])
  })

  it('says how many are playable rather than implying all of them are', () => {
    render(<PapersPageClient papers={[]} playable={playable} />)

    expect(screen.getByText(/2 of these papers are playable/i)).toBeInTheDocument()
  })

  it('shows nothing when no paper has been transcribed yet', () => {
    render(<PapersPageClient papers={[]} playable={[]} />)

    const link = screen
      .queryAllByRole('link')
      .find((a) => a.getAttribute('href')?.startsWith('/exam'))

    expect(link).toBeUndefined()
  })
})

/**
 * A paper without a memo used to render nothing in that slot, so a student
 * saw a paper they could attempt with no way to check it and no reason
 * given. Say it instead.
 *
 * Every Grade 10 paper in the library was in that state until the DBE
 * Common Papers (2015-2018) were added, which carry their memos. The case
 * is still reachable - not every paper DBE publishes has a memo - so this
 * stays covered.
 */
describe('papers with no memo', () => {
  const withoutMemo = {
    id: 'maths-10-2018-p1',
    grade: 10,
    subject: 'maths',
    year: 2018,
    examType: 'Common',
    paperNumber: 1,
    language: 'English',
    pdfUrl: 'https://example.gov.za/paper.pdf',
    memoUrl: null,
    topicsCovered: ['Algebra'],
  }

  it('says the memo is not published rather than showing nothing', () => {
    render(<PapersPageClient papers={[withoutMemo]} playable={[]} />)

    expect(screen.getByText(/memo not published/i)).toBeInTheDocument()
  })

  it('still offers the paper itself', () => {
    render(<PapersPageClient papers={[withoutMemo]} playable={[]} />)

    expect(screen.getByRole('button', { name: /paper/i })).toBeInTheDocument()
  })

  it('shows a working memo button when there is one', () => {
    render(
      <PapersPageClient papers={[{ ...withoutMemo, memoUrl: 'https://example.gov.za/memo.pdf' }]} playable={[]} />
    )

    expect(screen.queryByText(/memo not published/i)).not.toBeInTheDocument()
    expect(screen.getByRole('button', { name: /memo/i })).toBeInTheDocument()
  })
})
