/**
 * vitest.setup.ts's global 'next-intl'/'next-intl/server' mock is now
 * backed by the real ICU translator (use-intl's createTranslator) instead
 * of a hand-rolled string-replace. This asserts the two behaviours that
 * change: real ICU plural resolution, and a missing key throwing instead
 * of silently rendering the key.
 */
import { describe, it, expect } from 'vitest'
import { useTranslations } from 'next-intl'
import { getTranslations } from 'next-intl/server'

describe('global i18n test mock (real ICU translator)', () => {
  it('resolves an ICU plural message for the singular case', () => {
    const t = useTranslations('progress')
    expect(t('questionsCount', { count: 1 })).toBe('1 question')
  })

  it('resolves an ICU plural message for the plural case', () => {
    const t = useTranslations('progress')
    expect(t('questionsCount', { count: 5 })).toBe('5 questions')
    expect(t('questionsCount', { count: 0 })).toBe('0 questions')
  })

  it('throws for a missing key instead of returning the key as a fallback', () => {
    const t = useTranslations('common')
    expect(() => t('thisKeyDoesNotExist' as never)).toThrow(
      /Missing i18n key: common\.thisKeyDoesNotExist/
    )
  })

  it('also throws for a missing key via getTranslations (server)', async () => {
    const t = await getTranslations('common')
    expect(() => t('thisKeyDoesNotExist' as never)).toThrow(/Missing i18n key:/)
  })
})
