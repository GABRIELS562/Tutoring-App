import { describe, it, expect, beforeEach } from 'vitest'
import { getLocaleFromCookie, setLocaleCookie, detectBrowserLocale } from '@/lib/locale'

describe('locale cookie helpers', () => {
  beforeEach(() => {
    // Arrange: clear any NEXT_LOCALE cookie left by a previous test
    document.cookie = 'NEXT_LOCALE=; max-age=0; path=/'
  })

  it('returns "en" when no locale cookie is set', () => {
    expect(getLocaleFromCookie()).toBe('en')
  })

  it('round-trips a locale through the cookie', () => {
    setLocaleCookie('af')
    expect(getLocaleFromCookie()).toBe('af')
  })

  it('falls back to "en" for an unsupported cookie value', () => {
    document.cookie = 'NEXT_LOCALE=fr; path=/'
    expect(getLocaleFromCookie()).toBe('en')
  })

  it('detects Afrikaans from the browser language', () => {
    Object.defineProperty(navigator, 'language', { value: 'af-ZA', configurable: true })
    expect(detectBrowserLocale()).toBe('af')
  })
})

describe('locale change subscribers', () => {
  it('notifies a listener when the cookie is set and stops after unsubscribe', async () => {
    // Arrange
    const { subscribeToLocaleCookie } = await import('@/lib/locale')
    const seen: string[] = []
    const unsubscribe = subscribeToLocaleCookie(() => seen.push(getLocaleFromCookie()))

    // Act
    setLocaleCookie('af')
    unsubscribe()
    setLocaleCookie('en')

    // Assert
    expect(seen).toEqual(['af'])
  })
})
