import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import VictoryScreen from '../VictoryScreen'
import { getBossForTopic } from '@/content/bosses'

// jsdom has no real canvas 2D context (HTMLCanvasElement.getContext returns
// null without the optional `canvas` package installed), so the share-card
// draw effect's `if (!ctx) return` bails out before ever reaching
// setCardReady(true). Stub just enough of the CanvasRenderingContext2D
// surface VictoryScreen's draw actually calls so the effect runs to
// completion - this is what exercises the refactored
// `setCardReady(true)` line (previously deferred via queueMicrotask, now
// called directly - see the eslint-disable-next-line comment in
// VictoryScreen.tsx) instead of bailing early.
function stubCanvasContext() {
  const gradient = { addColorStop: vi.fn() }
  const ctx = {
    createLinearGradient: vi.fn(() => gradient),
    fillRect: vi.fn(),
    strokeRect: vi.fn(),
    fillText: vi.fn(),
    fillStyle: '',
    strokeStyle: '',
    lineWidth: 0,
    font: '',
    textAlign: 'left' as CanvasTextAlign,
  }
  vi.spyOn(HTMLCanvasElement.prototype, 'getContext').mockReturnValue(
    ctx as unknown as CanvasRenderingContext2D
  )
  return ctx
}

const boss = getBossForTopic('trig-gr11')

beforeEach(() => {
  stubCanvasContext()
})

afterEach(() => {
  vi.restoreAllMocks()
})

describe('VictoryScreen share-card draw effect', () => {
  it('draws the card and enables the download button once the effect runs (no microtask deferral needed)', () => {
    render(
      <VictoryScreen
        boss={boss}
        bossName={boss.name}
        topicSlug="trig-gr11"
        marksDealt={14}
        totalMarks={14}
        xp={120}
        comboBest={5}
        elapsedSeconds={90}
        onPlayAgain={() => {}}
      />
    )

    // Previously cardReady was flipped from a queued microtask; now it's
    // set directly in the effect body, so the button is already enabled
    // by the time render() returns (RTL flushes effects via act()).
    expect(screen.getByText('Download', { selector: 'button' })).toBeEnabled()
  })

  it('leaves the download button disabled when there is no 2D context to draw with', () => {
    vi.restoreAllMocks() // fall back to jsdom's real (null) getContext

    render(
      <VictoryScreen
        boss={boss}
        bossName={boss.name}
        topicSlug="trig-gr11"
        marksDealt={14}
        totalMarks={14}
        xp={120}
        comboBest={5}
        elapsedSeconds={90}
        onPlayAgain={() => {}}
      />
    )

    expect(screen.getByText('Download', { selector: 'button' })).toBeDisabled()
  })
})
