import '@testing-library/jest-dom/vitest'
import { vi, expect } from 'vitest'
// vitest-axe@0.1.0 declares its own matcher export as type-only in its
// .d.ts (`export type { t as toHaveNoViolations }`), even though the
// runtime value is a real function - import via require to get the value
// without TypeScript refusing it as "used as a value", and type it loosely
// (the real signature is `(results: AxeResults) => RawMatcherResult`).
import { createRequire } from 'node:module'
// The real ICU translator implementation next-intl's useTranslations/
// getTranslations are built on. Imported directly from use-intl (not
// 'next-intl') because this file replaces the 'next-intl' module itself
// via vi.mock below - importing from the module we're mocking would be
// circular.
import { createTranslator, IntlErrorCode, type IntlError } from 'use-intl/core'
import en from './src/messages/en.json'

const require = createRequire(import.meta.url)
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const axeMatchers = require('vitest-axe/matchers') as Record<string, (...args: any[]) => any>

// vitest-axe@0.1.0's own `vitest-axe/extend-expect` side-effect import ships
// an empty dist/extend-expect.js (packaging bug in that release) and never
// actually calls expect.extend - register the matcher by hand instead.
expect.extend(axeMatchers)

declare module 'vitest' {
  interface Assertion {
    toHaveNoViolations(): void
  }
}

function onTranslationError(error: IntlError): void {
  if (error.code === IntlErrorCode.MISSING_MESSAGE) {
    // error.originalMessage is use-intl's own
    // "Could not resolve `ns.key` in messages for locale `en`." - pull the
    // `ns.key` path back out so the failure points straight at the missing
    // key instead of a generic message.
    const match = error.originalMessage?.match(/`([^`]+)`/)
    throw new Error(`Missing i18n key: ${match?.[1] ?? error.originalMessage ?? 'unknown'}`)
  }
  throw error
}

/**
 * Real messages, real ICU (plurals, `t.rich`, interpolation), fake
 * plumbing: every test gets the actual English copy from
 * src/messages/en.json evaluated through next-intl's real formatter
 * (use-intl's createTranslator) without needing a NextIntlClientProvider
 * or request-scoped locale, so assertions can match real UI text and
 * `{count, plural, ...}` messages resolve correctly instead of being
 * hand-rolled. A missing key throws (rather than silently rendering the
 * key) so a typo'd namespace/key fails the test that exercises it, not
 * some unrelated snapshot. A test that needs different locale/behaviour
 * can still `vi.mock('next-intl', ...)` (or 'next-intl/server') locally -
 * that file-level mock wins over this one.
 */
function makeTranslator(namespace?: string) {
  return createTranslator({
    locale: 'en',
    messages: en,
    namespace: namespace as never,
    onError: onTranslationError,
  })
}

vi.mock('next-intl', () => ({
  useTranslations: (namespace?: string) => makeTranslator(namespace),
  useLocale: () => 'en',
  useMessages: () => en,
  NextIntlClientProvider: ({ children }: { children: unknown }) => children,
}))

vi.mock('next-intl/server', () => ({
  getTranslations: async (namespace?: string) => makeTranslator(namespace),
  getLocale: async () => 'en',
  getMessages: async () => en,
}))
