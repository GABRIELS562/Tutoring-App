import { describe, it, expect } from 'vitest'
import {
  relativeLuminance,
  contrastRatio,
  pickAccentTextColor,
  ACCENT_TEXT_LIGHT,
  ACCENT_TEXT_DARK,
} from '../contrast'
import { bosses } from '@/content/bosses'

describe('relativeLuminance', () => {
  it('is 0 for black and 1 for white', () => {
    expect(relativeLuminance('#000000')).toBeCloseTo(0, 5)
    expect(relativeLuminance('#ffffff')).toBeCloseTo(1, 5)
  })
})

describe('contrastRatio', () => {
  it('is 21:1 for black on white', () => {
    expect(contrastRatio('#000000', '#ffffff')).toBeCloseTo(21, 1)
  })

  it('is 1:1 for a colour against itself', () => {
    expect(contrastRatio('#2dd4bf', '#2dd4bf')).toBeCloseTo(1, 5)
  })

  it('is symmetric', () => {
    expect(contrastRatio('#2dd4bf', '#000000')).toBeCloseTo(contrastRatio('#000000', '#2dd4bf'), 10)
  })
})

describe('pickAccentTextColor', () => {
  it('picks dark text for a bright, low-contrast-with-white accent (teal)', () => {
    expect(pickAccentTextColor('#2dd4bf')).toBe('dark')
  })

  it('picks whichever of light/dark text reaches the higher contrast, and it clears AA (4.5:1)', () => {
    const knownAccents = ['#e63946', '#8b5cf6', '#2dd4bf', '#f4a261', '#f4d35e', '#ff6b9d', '#7d8590']
    for (const accent of knownAccents) {
      const choice = pickAccentTextColor(accent)
      const textColor = choice === 'light' ? ACCENT_TEXT_LIGHT : ACCENT_TEXT_DARK
      expect(contrastRatio(accent, textColor)).toBeGreaterThanOrEqual(4.5)
    }
  })
})

describe('boss registry onAccent', () => {
  it('gives every boss an onAccent value that reaches WCAG AA (>= 4.5:1) against its accent', () => {
    for (const boss of Object.values(bosses)) {
      const textColor = boss.onAccent === 'light' ? ACCENT_TEXT_LIGHT : ACCENT_TEXT_DARK
      expect(contrastRatio(boss.accent, textColor)).toBeGreaterThanOrEqual(4.5)
    }
  })
})
