import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import StepSolution from '../StepSolution'

const ORIGINAL_FETCH = global.fetch

const steps = [
  {
    stepNumber: 1,
    instruction: 'Identify the given values',
    hint: 'Look at what the question gives you',
    correctAnswer: 'x = 2',
    explanation: 'Reading the question carefully helps',
  },
  {
    stepNumber: 2,
    instruction: 'Solve for y',
    hint: null,
    correctAnswer: 'y = 4',
    explanation: null,
  },
]

describe('StepSolution "Ask Angelo about this step"', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  afterEach(() => {
    global.fetch = ORIGINAL_FETCH
  })

  it('renders an "Ask Angelo about this step" button for every step', () => {
    render(<StepSolution steps={steps} questionText="Solve for x and y" />)

    expect(
      screen.getAllByRole('button', { name: /ask angelo about this step/i })
    ).toHaveLength(2)
  })

  it('POSTs mode: step_hint with questionText, stepNumber, and hint, and shows the reply inline', async () => {
    const user = userEvent.setup()
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => ({ hint: 'Try substituting the known value first.', remaining: 3 }),
    })

    render(<StepSolution steps={steps} questionText="Solve for x and y" />)

    const buttons = screen.getAllByRole('button', { name: /ask angelo about this step/i })
    await user.click(buttons[0])

    await waitFor(() => {
      expect(screen.getByText('Try substituting the known value first.')).toBeInTheDocument()
    })

    expect(global.fetch).toHaveBeenCalledWith(
      '/api/ai-hint',
      expect.objectContaining({
        method: 'POST',
        body: JSON.stringify({
          mode: 'step_hint',
          questionText: 'Solve for x and y',
          stepNumber: 1,
          hint: 'Look at what the question gives you',
        }),
      })
    )
  })

  it('shows a loading state while the request is in flight', async () => {
    const user = userEvent.setup()
    let resolveFetch: (value: unknown) => void = () => {}
    global.fetch = vi.fn(
      () =>
        new Promise((resolve) => {
          resolveFetch = resolve
        })
    ) as unknown as typeof fetch

    render(<StepSolution steps={steps} questionText="Solve for x and y" />)

    const buttons = screen.getAllByRole('button', { name: /ask angelo about this step/i })
    await user.click(buttons[0])

    expect(screen.getByText(/angelo is thinking/i)).toBeInTheDocument()

    resolveFetch({
      ok: true,
      status: 200,
      json: async () => ({ hint: 'A gentle nudge.', remaining: 2 }),
    })

    await waitFor(() => {
      expect(screen.getByText('A gentle nudge.')).toBeInTheDocument()
    })
  })

  it('shows the daily-limit message on a 429 and disables further asks across steps', async () => {
    const user = userEvent.setup()
    global.fetch = vi.fn().mockResolvedValue({
      ok: false,
      status: 429,
      json: async () => ({
        error: 'Daily AI hint limit reached',
        message: "You've used your 5 free hints today! Come back tomorrow or upgrade to Premium for unlimited AI help.",
        remaining: 0,
      }),
    })

    render(<StepSolution steps={steps} questionText="Solve for x and y" />)

    const buttons = screen.getAllByRole('button', { name: /ask angelo about this step/i })
    await user.click(buttons[0])

    await waitFor(() => {
      expect(screen.getByText(/used your 5 free hints today/i)).toBeInTheDocument()
    })

    // The limit is a shared daily quota, not per-step - the other step's
    // button should now also be disabled rather than letting the student
    // "ask" again only to hit the same 429.
    const buttonsAfter = screen.getAllByRole('button', { name: /ask angelo about this step/i })
    expect(buttonsAfter[1]).toBeDisabled()
  })

  it('shows a generic error message when the request fails unexpectedly', async () => {
    const user = userEvent.setup()
    global.fetch = vi.fn().mockRejectedValue(new Error('network down'))

    render(<StepSolution steps={steps} questionText="Solve for x and y" />)

    const buttons = screen.getAllByRole('button', { name: /ask angelo about this step/i })
    await user.click(buttons[0])

    await waitFor(() => {
      expect(screen.getByText(/something went wrong/i)).toBeInTheDocument()
    })
  })

  it('keeps each step\'s Angelo reply independent', async () => {
    const user = userEvent.setup()
    global.fetch = vi
      .fn()
      .mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => ({ hint: 'Reply for step one', remaining: 4 }),
      })
      .mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => ({ hint: 'Reply for step two', remaining: 3 }),
      })

    render(<StepSolution steps={steps} questionText="Solve for x and y" />)

    const buttons = screen.getAllByRole('button', { name: /ask angelo about this step/i })
    await user.click(buttons[0])
    await waitFor(() => {
      expect(screen.getByText('Reply for step one')).toBeInTheDocument()
    })

    const remainingButtons = screen.getAllByRole('button', { name: /ask angelo about this step/i })
    await user.click(remainingButtons[0])
    await waitFor(() => {
      expect(screen.getByText('Reply for step two')).toBeInTheDocument()
    })

    expect(screen.getByText('Reply for step one')).toBeInTheDocument()
    expect(screen.getByText('Reply for step two')).toBeInTheDocument()
  })

  it('marks decorative icons aria-hidden so screen readers only announce the button/label text', async () => {
    const user = userEvent.setup()
    global.fetch = vi.fn(
      () =>
        new Promise(() => {
          /* never resolves - keeps the loading state (Loader2 icon) visible */
        })
    ) as unknown as typeof fetch

    const { container } = render(<StepSolution steps={steps} questionText="Solve for x and y" />)

    // HelpCircle + Chevron (hint toggle) - only steps with a hint render this.
    const hintToggle = screen.getByRole('button', { name: /show hint/i })
    for (const icon of hintToggle.querySelectorAll('svg')) {
      expect(icon).toHaveAttribute('aria-hidden', 'true')
    }

    // MessageCircle (idle "Ask Angelo about this step")
    const askButtons = screen.getAllByRole('button', { name: /ask angelo about this step/i })
    for (const icon of askButtons[0].querySelectorAll('svg')) {
      expect(icon).toHaveAttribute('aria-hidden', 'true')
    }

    // Loader2 (loading state, once clicked)
    await user.click(askButtons[0])
    const loadingButton = screen.getByRole('button', { name: /angelo is thinking/i })
    for (const icon of loadingButton.querySelectorAll('svg')) {
      expect(icon).toHaveAttribute('aria-hidden', 'true')
    }

    expect(container.querySelectorAll('svg').length).toBeGreaterThan(0)
  })
})
