import { describe, it, expect } from 'vitest'
import { readFileSync, readdirSync, statSync } from 'node:fs'
import { join } from 'node:path'

/**
 * Every form control needs a name a screen reader can announce.
 *
 * This kept turning up one page at a time - the formula search, the prompt
 * challenge textarea, the AI practical textarea, then eight controls in the
 * admin Add Topic modal and ten more in the question editor. All of them
 * looked fine on screen, because a visible <label> sitting above an input
 * is not attached to it unless something says so.
 *
 * A placeholder does not count. The accessible-name spec allows it as a
 * last resort, so axe stays silent, but it vanishes the moment the student
 * types - which is exactly when they might need to check what the field was.
 */

const SRC = join(__dirname, '..')

function componentFiles(): string[] {
  const found: string[] = []
  const walk = (dir: string) => {
    for (const entry of readdirSync(dir)) {
      if (entry === 'node_modules' || entry === '__tests__') continue
      const full = join(dir, entry)
      if (statSync(full).isDirectory()) {
        walk(full)
        continue
      }
      if (full.endsWith('.tsx')) found.push(full)
    }
  }
  walk(SRC)
  return found
}

/** Each `<input|select|textarea …>` tag's attribute text. */
function controls(source: string): { tag: string; attrs: string }[] {
  const found: { tag: string; attrs: string }[] = []
  for (const tag of ['input', 'select', 'textarea']) {
    const open = new RegExp(`<${tag}\\b`, 'g')
    let match: RegExpExecArray | null
    while ((match = open.exec(source))) {
      let depth = 0
      let quote = ''
      let i = match.index
      for (; i < source.length; i++) {
        const char = source[i]
        if (quote) {
          if (char === quote) quote = ''
          continue
        }
        if (char === '"' || char === "'" || char === '`') quote = char
        else if (char === '{') depth++
        else if (char === '}') depth--
        else if (char === '>' && depth === 0) break
      }
      found.push({ tag, attrs: source.slice(match.index, i + 1) })
    }
  }
  return found
}

describe('every form control has an accessible name', () => {
  it('names come from a label, aria-label or aria-labelledby - never a placeholder alone', () => {
    const offenders: string[] = []

    for (const file of componentFiles()) {
      const source = readFileSync(file, 'utf-8')
      // ids that a <label htmlFor> in the same file points at
      const labelled = new Set(
        [...source.matchAll(/htmlFor=["{]`?([\w$-]+)/g)].map((m) => m[1])
      )

      for (const control of controls(source)) {
        if (/type=["']hidden["']/.test(control.attrs)) continue
        if (/aria-label|aria-labelledby/.test(control.attrs)) continue

        const id = control.attrs.match(/\bid=["{]`?([\w$-]+)/)?.[1]
        if (id && labelled.has(id)) continue

        offenders.push(
          `${file.replace(SRC, '')}: <${control.tag}> ${control.attrs.replace(/\s+/g, ' ').slice(0, 70)}`
        )
      }
    }

    expect(offenders).toEqual([])
  })

  /**
   * Guards the guard: if the scanner ever stops finding controls, the test
   * above passes over an empty set and says nothing.
   */
  it('actually finds the controls it is meant to check', () => {
    const total = componentFiles().reduce(
      (count, file) => count + controls(readFileSync(file, 'utf-8')).length,
      0
    )
    expect(total).toBeGreaterThan(20)
  })
})
