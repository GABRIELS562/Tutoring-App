import type { ReactNode } from 'react'

/**
 * The auth pages had no landmarks at all - no <main>, and no skip link
 * either, since that lives in the (app) layout. The (app) and admin
 * layouts both provide one; this group had no layout of its own, so the
 * four pages a new student meets first were the only ones a screen-reader
 * user could not jump into (WCAG 2.2 SC 1.3.1).
 *
 * A bare wrapper on purpose: each page keeps its own full-height centring,
 * so adding the landmark changes the semantics and nothing about the look.
 */
export default function AuthLayout({ children }: { children: ReactNode }) {
  return <main>{children}</main>
}
