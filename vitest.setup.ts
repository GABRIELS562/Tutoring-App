import '@testing-library/jest-dom/vitest'
import { vi } from 'vitest'
import en from './src/messages/en.json'

type Messages = typeof en

function getMessage(namespace: string | undefined, key: string): unknown {
  const path = namespace ? `${namespace}.${key}` : key
  return path
    .split('.')
    .reduce<unknown>((node, segment) => {
      if (typeof node !== 'object' || node === null) return undefined
      return (node as Record<string, unknown>)[segment]
    }, en as Messages)
}

function interpolate(message: unknown, key: string, values?: Record<string, unknown>): string {
  if (typeof message !== 'string') return key // missing key: fall back to the key itself, same as next-intl's dev warning path
  if (!values) return message
  return Object.entries(values).reduce(
    (acc, [name, value]) => acc.replaceAll(`{${name}}`, String(value)),
    message
  )
}

/**
 * Real messages, fake plumbing: every test gets the actual English copy
 * from src/messages/en.json without needing a NextIntlClientProvider or
 * request-scoped locale, so assertions can match real UI text. A test
 * that needs a different locale/behaviour can still `vi.mock('next-intl', ...)`
 * (or 'next-intl/server') locally - that file-level mock wins over this one.
 */
function makeTranslator(namespace?: string) {
  return (key: string, values?: Record<string, unknown>) => interpolate(getMessage(namespace, key), key, values)
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
