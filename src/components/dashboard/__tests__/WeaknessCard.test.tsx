import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import WeaknessCard from '../WeaknessCard'
import type { Weakness } from '@/lib/weaknessDetector'

const weakness: Weakness = {
  topicSlug: 'trig-gr11',
  topicName: 'Trigonometry',
  accuracy: 0.35, // -> 35%, below the 40% "red" threshold
  totalAttempts: 14,
  specificIssueKey: 'signErrors',
  recommendationKey: 'signErrors',
}

describe('WeaknessCard attempted-stats message', () => {
  it('renders the attempts, percent and fraction as a single sentence (one ICU message, not concatenated prefix/suffix)', () => {
    render(<WeaknessCard weakness={weakness} />)

    // The percent value is wrapped in its own <span> (for the colour), so
    // this is one <p> whose combined text content is the full sentence,
    // not necessarily one text node - assert on textContent rather than
    // getByText, which only matches a single node.
    // 0.35 * 14 = 4.9 -> rounds to 5 correct; accuracy rounds to 35%
    const stats = screen.getByText(/times and got it right/).closest('p')
    expect(stats).toHaveTextContent(
      "You've attempted it 14 times and got it right 35% of the time (5/14)."
    )
  })

  it('wraps only the percent value in its own styled span (t.rich), coloured red below 40% accuracy', () => {
    render(<WeaknessCard weakness={weakness} />)

    const percentSpan = screen.getByText('35%')
    expect(percentSpan.tagName).toBe('SPAN')
    expect(percentSpan).toHaveStyle({ color: 'var(--accent-red-text)' })
  })

  it('colours the percent span gold at or above 40% accuracy', () => {
    render(<WeaknessCard weakness={{ ...weakness, accuracy: 0.6, totalAttempts: 10 }} />)

    const percentSpan = screen.getByText('60%')
    expect(percentSpan).toHaveStyle({ color: 'var(--gold)' })
  })
})

/**
 * The issue and the topic name are substance, not chrome. They used to be
 * English strings interpolated into a translated template, so an Afrikaans
 * student read "Jy kry Sign errors in reduction formulae in Trigonometry
 * steeds verkeerd." - a sentence that is translated everywhere except where
 * it matters.
 */
describe('WeaknessCard localises the issue itself', () => {
  it('renders the issue from the message catalogue, not a raw key', () => {
    render(<WeaknessCard weakness={weakness} />)

    const sentence = screen.getByText(/wrong in/).textContent ?? ''
    expect(sentence).toContain('Sign errors in reduction formulae')
    expect(sentence, 'the raw key leaked into the UI').not.toContain('signErrors')
  })
})
