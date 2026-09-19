import { describe, it, expect } from 'vitest'
import en from '@/messages/en.json'
import af from '@/messages/af.json'

/**
 * Keeps src/messages/en.json and af.json structurally identical: every key
 * path that exists in one locale must exist in the other, so next-intl
 * never silently falls back to a missing-key warning or blank UI text.
 * Values are allowed to differ (that's the translation); shape may not.
 */
function collectKeyPaths(node: unknown, prefix = ''): string[] {
  if (typeof node !== 'object' || node === null || Array.isArray(node)) {
    return [prefix]
  }

  return Object.entries(node as Record<string, unknown>).flatMap(([key, value]) =>
    collectKeyPaths(value, prefix ? `${prefix}.${key}` : key)
  )
}

describe('message catalog parity (en <-> af)', () => {
  it('has the exact same set of key paths in both locales', () => {
    const enKeys = collectKeyPaths(en).sort()
    const afKeys = collectKeyPaths(af).sort()

    const missingFromAf = enKeys.filter((key) => !afKeys.includes(key))
    const missingFromEn = afKeys.filter((key) => !enKeys.includes(key))

    expect(missingFromAf, `keys present in en.json but missing from af.json: ${missingFromAf.join(', ')}`).toEqual([])
    expect(missingFromEn, `keys present in af.json but missing from en.json: ${missingFromEn.join(', ')}`).toEqual([])
  })

  it('has no empty string values in either locale', () => {
    const emptyIn = (messages: Record<string, unknown>, locale: string) =>
      collectKeyPaths(messages).filter((path) => {
        const value = path.split('.').reduce<unknown>((acc, segment) => {
          if (typeof acc !== 'object' || acc === null) return undefined
          return (acc as Record<string, unknown>)[segment]
        }, messages)
        return value === ''
      }).map((path) => `${locale}:${path}`)

    expect([...emptyIn(en, 'en'), ...emptyIn(af, 'af')]).toEqual([])
  })
})
