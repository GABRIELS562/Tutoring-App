/**
 * Curriculum content is authored with markdown emphasis, so the renderer has
 * to handle it alongside the KaTeX splitting. Before this, every topic page
 * showed literal asterisks in its "What this topic covers" block.
 */
import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import MathRenderer from '../MathRenderer'

describe('MathRenderer', () => {
  it('renders markdown bold as emphasis rather than literal asterisks', () => {
    const { container } = render(<MathRenderer content="**Exponent Laws** - Multiplying" />)

    expect(container.querySelector('strong')?.textContent).toBe('Exponent Laws')
    expect(container.textContent).not.toContain('**')
  })

  it('keeps surrounding text alongside the bold run', () => {
    const { container } = render(<MathRenderer content="See **this** now" />)

    expect(container.textContent).toBe('See this now')
  })

  it('still renders maths when bold appears in the same string', () => {
    const { container } = render(<MathRenderer content="**Solve** $x^2$ here" />)

    expect(container.querySelector('strong')?.textContent).toBe('Solve')
    expect(container.querySelector('.katex')).not.toBeNull()
  })

  it('leaves a lone asterisk untouched', () => {
    render(<MathRenderer content="3 * 4 = 12" />)

    expect(screen.getByText(/3 \* 4 = 12/)).toBeTruthy()
  })
})
