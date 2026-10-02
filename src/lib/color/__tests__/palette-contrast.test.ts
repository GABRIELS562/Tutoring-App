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

/**
 * A translucent token flattened onto an opaque one, so a tint used as a
 * background can be measured. `--ai-purple-glow` is an rgba(), and the
 * only thing that matters about it is what reads on top of it.
 */
function rgbaOver(name: string, backdropHex: string): string {
  const match = CSS.match(
    new RegExp(`^\\s*--${name}:\\s*rgba\\((\\d+),\\s*(\\d+),\\s*(\\d+),\\s*([\\d.]+)\\)`, 'm')
  )
  expect(match, `--${name} is not an rgba() in globals.css`).not.toBeNull()
  const [r, g, b] = [match![1], match![2], match![3]].map(Number)
  const alpha = Number(match![4])
  const backdrop = backdropHex.replace('#', '')
  const channels = [0, 2, 4].map((i) => parseInt(backdrop.slice(i, i + 2), 16))
  const blend = [r, g, b].map((channel, i) =>
    Math.round(channel * alpha + channels[i] * (1 - alpha))
  )
  return `#${blend.map((c) => c.toString(16).padStart(2, '0')).join('')}`
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
    // The AI Skills section is almost entirely these two on these two
    // surfaces, and the purple failed both before it was split.
    ['purple text on a card', 'ai-purple-text', 'surface'],
    ['purple text on a raised card', 'ai-purple-text', 'surface2'],
    ['success text on a card', 'ai-success', 'surface'],
    ['success text on a raised card', 'ai-success', 'surface2'],
  ]

  it.each(cases)('%s', (_label, fg, bg) => {
    expect(contrastRatio(token(fg), token(bg))).toBeGreaterThanOrEqual(AA_NORMAL)
  })
})

describe('button labels meet AA against their fill', () => {
  it('white on the primary red CTA', () => {
    expect(contrastRatio('#ffffff', token('accent-red'))).toBeGreaterThanOrEqual(AA_NORMAL)
  })

  it('white on the AI Skills purple CTA', () => {
    expect(contrastRatio('#ffffff', token('ai-purple'))).toBeGreaterThanOrEqual(AA_NORMAL)
  })

  /**
   * The light fills. Every one of these carried white text somewhere in
   * the app and every one of them failed: teal 1.86:1, gold 2.06:1,
   * ai-success 3.12:1, and the text red used as a fill 3.18:1. Dark text
   * is the answer for all four - see the component guard at the bottom,
   * which is what stops white coming back.
   */
  const LIGHT_FILLS = ['teal', 'gold', 'ai-success', 'accent-red-text'] as const

  it.each(LIGHT_FILLS)('white would NOT pass on --%s, dark does', (fill) => {
    expect(contrastRatio('#ffffff', token(fill))).toBeLessThan(AA_NORMAL)
    expect(contrastRatio(token('bg'), token(fill))).toBeGreaterThanOrEqual(AA_NORMAL)
  })

})

describe('the two purples stay in their lanes', () => {
  it('are different colours', () => {
    expect(token('ai-purple')).not.toBe(token('ai-purple-text'))
  })

  it('the fill is the darker of the two', () => {
    expect(contrastRatio('#ffffff', token('ai-purple'))).toBeGreaterThan(
      contrastRatio('#ffffff', token('ai-purple-text'))
    )
  })

  it('the text purple is the one that reads on a dark surface', () => {
    expect(contrastRatio(token('ai-purple-text'), token('surface'))).toBeGreaterThan(
      contrastRatio(token('ai-purple'), token('surface'))
    )
  })

  /**
   * The glow is a 15% tint of the ORIGINAL hue behind purple text, so it
   * is not covered by either lane and has to be checked on its own.
   */
  it('the text purple reads on the glow chip', () => {
    const glow = rgbaOver('ai-purple-glow', token('surface'))
    expect(contrastRatio(token('ai-purple-text'), glow)).toBeGreaterThanOrEqual(AA_NORMAL)
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
describe('components use the text lane for text', () => {
  const SRC = join(__dirname, '..', '..', '..')

  function eachComponentFile(visit: (path: string, source: string) => void) {
    const walk = (dir: string) => {
      for (const entry of readdirSync(dir)) {
        if (entry === '__tests__' || entry === 'node_modules') continue
        const full = join(dir, entry)
        if (statSync(full).isDirectory()) {
          walk(full)
          continue
        }
        if (!entry.endsWith('.tsx')) continue
        visit(full.replace(SRC, ''), readFileSync(full, 'utf-8'))
      }
    }
    walk(SRC)
  }

  /** The `style={{ … }}` objects in a file, as raw text, brace-balanced. */
  function styleObjects(source: string): string[] {
    const blocks: string[] = []
    const OPEN = 'style={{'
    let at = source.indexOf(OPEN)
    while (at !== -1) {
      let depth = 2
      let i = at + OPEN.length
      while (i < source.length && depth > 0) {
        if (source[i] === '{') depth++
        else if (source[i] === '}') depth--
        i++
      }
      blocks.push(source.slice(at, i))
      at = source.indexOf(OPEN, i)
    }
    return blocks
  }

  /**
   * Checks the whole `color:` VALUE, not just what sits straight after the
   * colon. The first version anchored on `color: 'var(--accent-red)'` and
   * so walked straight past
   * `color: subject === 'maths' ? 'var(--accent-red)' : 'var(--teal)'`
   * - a formula-sheet badge that was shipping at 2.72:1. A browser found
   * it; this is what would have.
   */
  it('never sets color to a fill token, in any branch', () => {
    const FILL_ONLY = /var\(--(accent-red|ai-purple)\)/
    /**
     * The one place the fill red is RIGHT as text: on a white chip, where
     * it is 4.92:1 and the text red would drop it to 3.18:1. So the rule
     * is about the pairing, not the token - the branch is only wrong when
     * what sits behind it is dark.
     */
    const LIGHT_BACKGROUND = /^'(white|#fff|#ffffff)'$/i

    const offenders: string[] = []
    eachComponentFile((path, source) => {
      for (const block of styleObjects(source)) {
        const text = property(block, ['color'])
        if (!text) continue
        const fills = branches(property(block, ['background', 'backgroundColor']) ?? '')
        const texts = branches(text)
        texts.forEach((branch, i) => {
          if (!FILL_ONLY.test(branch)) return
          const paired = fills.length === 1 ? fills[0] : fills[i]
          if (paired && LIGHT_BACKGROUND.test(paired.trim())) return
          offenders.push(`${path}: color -> ${branch}`)
        })
      }
      // `color` outside a style object (a plain object, a helper's return)
      for (const line of source.split('\n')) {
        if (/\bcolor:\s*'var\(--(accent-red|ai-purple)\)'/.test(line)) {
          offenders.push(`${path}: ${line.trim()}`)
        }
      }
    })

    expect([...new Set(offenders)]).toEqual([])
  })

  /** Splits on separators that are not inside quotes, parens or brackets. */
  function splitTopLevel(text: string, separator: string): string[] {
    const parts: string[] = []
    let depth = 0
    let quote = ''
    let start = 0
    for (let i = 0; i < text.length; i++) {
      const char = text[i]
      if (quote) {
        if (char === quote && text[i - 1] !== '\\') quote = ''
        continue
      }
      if (char === "'" || char === '"' || char === '`') quote = char
      else if ('([{'.includes(char)) depth++
      else if (')]}'.includes(char)) depth--
      else if (char === separator && depth === 0) {
        parts.push(text.slice(start, i))
        start = i + 1
      }
    }
    parts.push(text.slice(start))
    return parts
  }

  /**
   * A property's value flattened into the branches it can resolve to, in
   * order. `a ? 'x' : b ? 'y' : 'z'` becomes ['x', 'y', 'z'] - which is
   * what lets a background and a colour be lined up branch by branch.
   */
  function branches(value: string): string[] {
    const parts = splitTopLevel(value, '?')
    if (parts.length === 1) return [value.trim()]
    const tail = splitTopLevel(parts.slice(1).join('?'), ':')
    return [tail[0], ...branches(tail.slice(1).join(':'))].map((part) => part.trim())
  }

  function property(block: string, names: string[]): string | null {
    const body = block.slice(block.indexOf('{{') + 2, block.lastIndexOf('}}'))
    const withoutComments = body.replace(/\/\/[^\n]*/g, '')
    for (const entry of splitTopLevel(withoutComments, ',')) {
      const at = entry.indexOf(':')
      if (at === -1) continue
      if (names.includes(entry.slice(0, at).trim())) return entry.slice(at + 1)
    }
    return null
  }

  /**
   * The failure this one exists for: a style object that fills with a
   * LIGHT accent and writes on it in white. It was in six places, and
   * four of them were inside ternaries - which is why the first contrast
   * sweep, done by eye over single lines, walked straight past them.
   *
   * Lining the two properties up branch by branch is the whole point: a
   * block legitimately pairs `background: correct ? teal : red` with
   * `color: correct ? dark : white`, and a check that only asked "does
   * this block mention a light fill and the word white" called that a
   * failure. It assumes both ternaries test their conditions in the same
   * order, which is the only way they are written here.
   *
   * Blind spot: a fill reached through a variable (`info.color`,
   * `d.color`) is invisible to this, so those two are only held by the
   * reading of their definitions - see SubjectPageClient and
   * QuestionEditor, where neither uses white at all any more.
   */
  it('never writes white on a light fill', () => {
    const LIGHT_FILL = /var\(--(teal|gold|ai-success|accent-red-text)\)/

    const offenders: string[] = []
    eachComponentFile((path, source) => {
      for (const block of styleObjects(source)) {
        const fill = property(block, ['background', 'backgroundColor'])
        const text = property(block, ['color'])
        if (!fill || !text) continue

        const fills = branches(fill)
        const texts = branches(text)
        for (let i = 0; i < Math.max(fills.length, texts.length); i++) {
          // An unconditional value applies to every branch of the other.
          const onFill = fills.length === 1 ? fills[0] : fills[i]
          const onText = texts.length === 1 ? texts[0] : texts[i]
          if (!onFill || !onText) continue
          if (LIGHT_FILL.test(onFill) && /^'white'$/.test(onText)) {
            offenders.push(`${path}: ${onText} on ${onFill}`)
          }
        }
      }
    })

    expect(offenders).toEqual([])
  })
})
