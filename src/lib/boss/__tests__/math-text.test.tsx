import { describe, it, expect } from 'vitest'
import { render } from '@testing-library/react'
import MathRenderer from '@/components/math/MathRenderer'
import { asMath } from '../math-text'

describe('asMath', () => {
  it('wraps bare LaTeX (backslash, no $) as display math', () => {
    expect(asMath('\\cos^2\\theta = 1 - \\sin^2\\theta')).toBe('$$\\cos^2\\theta = 1 - \\sin^2\\theta$$')
  })

  it('leaves plain text unchanged', () => {
    expect(asMath('Identify the quadrant: 210° is in Quadrant III')).toBe(
      'Identify the quadrant: 210° is in Quadrant III'
    )
  })

  it('leaves a string that already contains $ delimiters unchanged', () => {
    expect(asMath('Simplify $\\sin 210°$')).toBe('Simplify $\\sin 210°$')
  })

  it('leaves an empty string unchanged', () => {
    expect(asMath('')).toBe('')
  })
})

describe('asMath + MathRenderer', () => {
  it('renders a .katex node for bare LaTeX step content', () => {
    const { container } = render(<MathRenderer content={asMath('\\cos^2\\theta = 1 - \\sin^2\\theta')} />)
    expect(container.querySelector('.katex')).not.toBeNull()
  })

  it('renders plain text as plain text, with no .katex node', () => {
    const { container, getByText } = render(
      <MathRenderer content={asMath('Recall the definitions of sin and cos')} />
    )
    expect(container.querySelector('.katex')).toBeNull()
    expect(getByText('Recall the definitions of sin and cos')).toBeInTheDocument()
  })
})
