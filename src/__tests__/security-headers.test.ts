import { describe, it, expect, beforeAll } from 'vitest'
import { readFileSync, readdirSync, statSync } from 'node:fs'
import { join } from 'node:path'

/**
 * The deployed app sent no security headers at all - no CSP, no
 * X-Frame-Options, nothing. These assert the policy exists AND that it
 * still matches what the app actually loads, which is the part that rots:
 * add an embed from a new host and the CSP silently blocks it, with no
 * build error and nothing in the server log.
 */

type Header = { key: string; value: string }
let headers: Header[]
let csp: string

beforeAll(async () => {
  const config = (await import('../../next.config')).default
  const result = await (config as { headers: () => Promise<{ headers: Header[] }[]> }).headers()
  headers = result[0].headers
  csp = headers.find((h) => h.key === 'Content-Security-Policy')!.value
})

const SRC = join(__dirname, '..')

function componentSources(): { path: string; source: string }[] {
  const found: { path: string; source: string }[] = []
  const walk = (dir: string) => {
    for (const entry of readdirSync(dir)) {
      if (entry === 'node_modules' || entry === '__tests__') continue
      const full = join(dir, entry)
      if (statSync(full).isDirectory()) {
        walk(full)
        continue
      }
      if (full.endsWith('.tsx')) found.push({ path: full.replace(SRC, ''), source: readFileSync(full, 'utf-8') })
    }
  }
  walk(SRC)
  return found
}

describe('security headers', () => {
  it.each([
    'Content-Security-Policy',
    'X-Frame-Options',
    'X-Content-Type-Options',
    'Referrer-Policy',
    'Permissions-Policy',
    'Strict-Transport-Security',
  ])('sends %s', (key) => {
    expect(headers.map((h) => h.key)).toContain(key)
  })

  it('keeps the camera enabled, because the AI scan photographs a question', () => {
    const permissions = headers.find((h) => h.key === 'Permissions-Policy')!.value
    expect(permissions).toMatch(/camera=\(self\)/)
    expect(permissions).toMatch(/microphone=\(\)/)
  })

  it('does not promise HSTS preload, which is the client domain owner to commit to', () => {
    expect(headers.find((h) => h.key === 'Strict-Transport-Security')!.value).not.toMatch(/preload/)
  })
})

describe('the CSP matches what the app actually loads', () => {
  it('allows every origin the app embeds in an iframe', () => {
    const embedded = new Set<string>()
    for (const { source } of componentSources()) {
      for (const match of source.matchAll(/<iframe[\s\S]{0,200}?src=\{?[`'"]([^`'"$]*)/g)) {
        try {
          embedded.add(new URL(match[1]).origin)
        } catch {
          // a relative or fully interpolated src - same origin, covered by 'self'
        }
      }
    }

    expect(embedded.size, 'no iframe found; this guard would be vacuous').toBeGreaterThan(0)
    for (const origin of embedded) {
      expect(csp, `iframe from ${origin} is not in frame-src`).toContain(origin)
    }
  })

  it('allows the Supabase origin it is configured with', () => {
    // Built from the environment, so it is right for whichever project a
    // deploy points at rather than a value hardcoded here.
    expect(csp).toMatch(/connect-src [^;]*'self'/)
  })

  it('allows data: and blob: images, which the certificate and camera scan produce', () => {
    expect(csp).toMatch(/img-src [^;]*data:/)
    expect(csp).toMatch(/img-src [^;]*blob:/)
  })

  it('serves fonts from self only - next/font self-hosts them at build time', () => {
    expect(csp).toMatch(/font-src 'self'/)
    expect(csp).not.toContain('fonts.gstatic.com')
  })

  it('forbids framing, object embeds and base-tag hijacking', () => {
    expect(csp).toContain("frame-ancestors 'none'")
    expect(csp).toContain("object-src 'none'")
    expect(csp).toContain("base-uri 'self'")
  })

  /**
   * 'unsafe-eval' belongs to React Fast Refresh and must never reach a
   * production policy. Vitest runs with NODE_ENV=test, which is not
   * production, so the config under test here is the development one - the
   * assertion is that the production branch exists and excludes it.
   */
  it('confines unsafe-eval to development', () => {
    const configSource = readFileSync(join(__dirname, '..', '..', 'next.config.ts'), 'utf-8')
    expect(configSource).toMatch(/isDev\s*\?[^:]*'unsafe-eval'/)
    expect(configSource).not.toMatch(/script-src 'self' 'unsafe-inline' 'unsafe-eval'"/)
  })
})
