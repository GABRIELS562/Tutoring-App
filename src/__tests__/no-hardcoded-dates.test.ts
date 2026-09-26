import { describe, it, expect } from 'vitest'
import { readFileSync, readdirSync, statSync } from 'node:fs'
import { join } from 'node:path'

/**
 * Hardcoded English weekday and month names.
 *
 * This bug was found twice in adjacent files - XPLineChart took its axis
 * labels from a ['Sun','Mon',...] array in the query, and ActivityCalendar
 * had its own ['Mon','Tue',...] right beside it - so an Afrikaans student
 * read "Sun Tue Thu" under an otherwise Afrikaans chart. Both now derive
 * names from the reader's locale via toLocaleDateString.
 *
 * Finding it a third time by eye is not a plan, so this fails the build
 * instead. Date names belong to the locale, never to a literal.
 */
const DAY_ARRAY = /\[\s*'(Sun|Mon)'\s*,\s*'(Mon|Tue)'/
const MONTH_ARRAY = /\[\s*'Jan'\s*,\s*'Feb'/

function sourceFiles(dir: string): string[] {
  return readdirSync(dir).flatMap((entry) => {
    const path = join(dir, entry)
    if (statSync(path).isDirectory()) {
      return entry === 'node_modules' || entry === '__tests__' ? [] : sourceFiles(path)
    }
    return path.endsWith('.ts') || path.endsWith('.tsx') ? [path] : []
  })
}

describe('date names come from the locale, not a literal', () => {
  it('has no hardcoded English weekday arrays', () => {
    const offenders = sourceFiles('src').filter((path) =>
      DAY_ARRAY.test(readFileSync(path, 'utf8'))
    )

    expect(
      offenders,
      `these hardcode English weekday names - use toLocaleDateString:\n${offenders.join('\n')}`
    ).toEqual([])
  })

  it('has no hardcoded English month arrays', () => {
    const offenders = sourceFiles('src').filter((path) =>
      MONTH_ARRAY.test(readFileSync(path, 'utf8'))
    )

    expect(
      offenders,
      `these hardcode English month names - use toLocaleDateString:\n${offenders.join('\n')}`
    ).toEqual([])
  })
})
