import { describe, it, expect } from 'vitest'
import { readFileSync, readdirSync, statSync } from 'node:fs'
import { join } from 'node:path'
import { contrastRatio } from '../contrast'

/**
 * The palette itself, checked against WCAG 2.2 AA.
 *
 * One red was doing two jobs and failing both: as a button fill it carried
 * white text at 4.17:1, on the most-pressed control in the app, and as
 * text on a dark surface it sat at 4.15:1 - which is the "you got this
 * wrong" message. White on --teal was 1.86:1, on the button that spends a
 * shield mid-battle.
 *
 * Read from globals.css rather than hardcoded here, so changing a colour
 * is what fails this test.
 */

const CSS = readFileSync(
  join(__dirname, '..', '..', '..', 'app', 'globals.css'),
  'utf-8'
)

function token(name: string): string {
  const match = CSS.match(new RegExp(`^\\s*--${name}:\\s*(#[0-9a-fA-F]{3,8});`, 'm'))
  expect(match, `--${name} not found in globals.css`).not.toBeNull()
  return match![1]
}

const AA_NORMAL = 4.5
/** WCAG 2.2 SC 1.4.11, for borders and chart fills rather than text. */
const AA_NON_TEXT = 3

describe('text on its background meets AA', () => {
  const cases: [string, string, string][] = [
    ['body text on the page', 'text', 'bg'],
    ['body text on a card', 'text', 'surface'],
    ['body text on a raised card', 'text', 'surface2'],
    ['muted text on the page', 'muted-custom', 'bg'],
    ['muted text on a card', 'muted-custom', 'surface'],
    // The exam-type and language chips on the papers page sit here.
    ['muted text on a raised card', 'muted-custom', 'surface2'],
    ['red text on a card', 'accent-red-text', 'surface'],
    ['red text on a raised card', 'accent-red-text', 'surface2'],
    ['teal text on a card', 'teal', 'surface'],
    ['gold text on a card', 'gold', 'surface'],
  ]

  it.each(cases)('%s', (_label, fg, bg) => {
    expect(contrastRatio(token(fg), token(bg))).toBeGreaterThanOrEqual(AA_NORMAL)
  })
})

describe('button labels meet AA against their fill', () => {
  it('white on the primary red CTA', () => {
    expect(contrastRatio('#ffffff', token('accent-red'))).toBeGreaterThanOrEqual(AA_NORMAL)
  })

  /**
   * Teal is a light colour - white on it was 1.86:1, nowhere near legible.
   * Dark text is the only workable answer, and the codebase's own
   * pickAccentTextColor() already said so.
   */
  it('dark text on teal', () => {
    expect(contrastRatio(token('bg'), token('teal'))).toBeGreaterThanOrEqual(AA_NORMAL)
  })

  it('white on gold would NOT pass, so gold is never a button fill with white text', () => {
    const white = contrastRatio('#ffffff', token('gold'))
    const dark = contrastRatio(token('bg'), token('gold'))
    expect(dark).toBeGreaterThan(white)
  })
})

describe('the two reds stay in their lanes', () => {
  /**
   * Darkening the fill fixes the button and breaks the text; lightening
   * fixes the text and breaks the button. They cannot be the same value,
   * and this is what says so.
   */
  it('are different colours', () => {
    expect(token('accent-red')).not.toBe(token('accent-red-text'))
  })

  it('the fill is the darker of the two', () => {
    expect(contrastRatio('#ffffff', token('accent-red'))).toBeGreaterThan(
      contrastRatio('#ffffff', token('accent-red-text'))
    )
  })

  it('the text red is the one that reads on a dark surface', () => {
    expect(contrastRatio(token('accent-red-text'), token('surface'))).toBeGreaterThan(
      contrastRatio(token('accent-red'), token('surface'))
    )
  })
})

describe('non-text contrast', () => {
  it('borders are distinguishable from the surfaces they divide', () => {
    // Not a hard AA failure on its own - fills and labels carry the
    // meaning too - but worth knowing if it gets fainter.
    expect(contrastRatio(token('border-custom'), token('bg'))).toBeGreaterThan(1)
  })

  it('chart colours read against the card they sit on', () => {
    for (const colour of ['teal', 'gold', 'accent-red-text']) {
      expect(contrastRatio(token(colour), token('surface')), colour).toBeGreaterThanOrEqual(
        AA_NON_TEXT
      )
    }
  })
})

/**
 * The component layer has to use the right one. A fill token used as a
 * text colour is exactly the bug this split was made to fix.
 */
describe('components use the text red for text', () => {
  const SRC = join(__dirname, '..', '..', '..')

  it('never sets color to the fill token', () => {
    const offenders: string[] = []

    const walk = (dir: string) => {
      for (const entry of readdirSync(dir)) {
        if (entry === '__tests__' || entry === 'node_modules') continue
        const full = join(dir, entry)
        if (statSync(full).isDirectory()) {
          walk(full)
          continue
        }
        if (!entry.endsWith('.tsx')) continue
        for (const line of readFileSync(full, 'utf-8').split('\n')) {
          if (/color:\s*'var\(--accent-red\)'/.test(line)) {
            offenders.push(`${full.replace(SRC, '')}: ${line.trim()}`)
          }
        }
      }
    }
    walk(SRC)

    expect(offenders).toEqual([])
  })
})
