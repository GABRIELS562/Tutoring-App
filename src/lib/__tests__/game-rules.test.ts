import { describe, it, expect } from 'vitest'
import { XP_PER_CORRECT_ANSWER, MAX_HEARTS } from '../game-rules'

describe('game-rules constants', () => {
  it('exports a positive XP_PER_CORRECT_ANSWER', () => {
    expect(XP_PER_CORRECT_ANSWER).toBeGreaterThan(0)
  })

  it('exports a positive MAX_HEARTS', () => {
    expect(MAX_HEARTS).toBeGreaterThan(0)
  })
})
