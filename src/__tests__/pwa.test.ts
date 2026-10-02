import { describe, it, expect } from 'vitest'
import { readFileSync } from 'node:fs'
import { join } from 'node:path'

const ROOT = join(__dirname, '..', '..')
const configSource = readFileSync(join(ROOT, 'next.config.ts'), 'utf-8')
const layoutSource = readFileSync(join(ROOT, 'src', 'app', 'layout.tsx'), 'utf-8')

/**
 * next-pwa's `register: true` injects a registration script for the Pages
 * Router only. Under the App Router it wrote public/sw.js and nothing ever
 * registered it, so the whole PWA was inert: sw.js and workbox-*.js shipped
 * as dead weight, none of the runtime caching ran, and the formula sheet's
 * "works offline" badge was a promise the app could not keep.
 */
describe('the service worker is actually registered', () => {
  it('the root layout mounts the registration component', () => {
    expect(layoutSource).toContain('ServiceWorkerRegistration')
    expect(layoutSource).toMatch(/<ServiceWorkerRegistration\s*\/>/)
  })

  it('the component calls register, and only in production', () => {
    const source = readFileSync(
      join(ROOT, 'src', 'components', 'ServiceWorkerRegistration.tsx'),
      'utf-8'
    )
    expect(source).toContain("navigator.serviceWorker.register('/sw.js')")
    // next-pwa emits no sw.js in dev, so registering there 404s
    expect(source).toMatch(/NODE_ENV !== 'production'/)
    // a browser that refuses must lose offline support and nothing else
    expect(source).toMatch(/\.catch\(/)
  })
})

/**
 * What the worker is allowed to serve from cache.
 */
describe('caching strategy', () => {
  const rules = [...configSource.matchAll(/urlPattern:\s*(\/[^\n]*?),\s*\n\s*handler:\s*'(\w+)'/g)]
    .map((m) => ({ pattern: m[1], handler: m[2] }))

  it('parses the runtimeCaching rules at all', () => {
    expect(rules.length).toBeGreaterThan(0)
  })

  /**
   * Nothing behind the login may be runtime-cached.
   *
   * This was found by registering the worker and then testing it: it
   * served a cached /topics page, status 200, to a request the server
   * answers with a 307 to /login. Cached /api/* responses were worse -
   * those carry one student's XP, hearts and attempt history, and this
   * audience shares devices.
   */
  it('caches no authenticated page route', () => {
    const offenders = rules.filter((r) => /topics|formulas|dashboard|progress|papers|exam/.test(r.pattern))
    expect(offenders.map((r) => r.pattern)).toEqual([])
  })

  it('caches no API response', () => {
    const offenders = rules.filter((r) => /api/.test(r.pattern))
    expect(offenders.map((r) => r.pattern)).toEqual([])
  })

  it('still caches the public immutable assets, so repeat loads stay fast', () => {
    const patterns = rules.map((r) => r.pattern).join(' ')
    expect(patterns).toMatch(/js\|css\|woff/)
  })

  it('does not cache Google Fonts, which next/font self-hosts at build time', () => {
    expect(configSource).not.toContain('fonts.gstatic.com')
    expect(configSource).not.toContain('fonts.googleapis.com')
  })

  /**
   * The badge promised offline access to a page that is server-rendered
   * and now deliberately uncached. Removing the caching without removing
   * the claim would have left the app lying to a student.
   */
  it('the formula sheet no longer claims to work offline', () => {
    const formulas = readFileSync(join(ROOT, 'src', 'app', '(app)', 'formulas', 'page.tsx'), 'utf-8')
    expect(formulas).not.toMatch(/t\('worksOffline'\)/)
    const messages = JSON.parse(readFileSync(join(ROOT, 'src', 'messages', 'en.json'), 'utf-8'))
    expect(messages.formulas).not.toHaveProperty('worksOffline')
  })
})
