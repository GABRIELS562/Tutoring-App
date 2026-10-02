import { describe, it, expect } from 'vitest'
import { readFileSync, readdirSync, statSync, existsSync } from 'node:fs'
import { join, dirname, relative } from 'node:path'

const APP = join(__dirname, '..', 'app')

/**
 * A page that calls notFound() must not sit under a route-level
 * loading.tsx.
 *
 * loading.tsx wraps the segment's page in a Suspense boundary, so Next
 * flushes the shell - and commits the HTTP status - before the page
 * component runs. The page then renders the right "not found" screen
 * inside a 200 response. Students saw the correct page; crawlers, link
 * checkers and uptime monitors saw a success for every broken link.
 *
 * It was true of /topics/<bad-slug>, its /practice child, and
 * /ai-skills/<bad-module>. The fix is not to drop the loading UI: each of
 * those pages now validates first and then declares its own <Suspense>
 * with the same skeleton as the fallback, so the boundary sits AFTER the
 * check rather than around it.
 */

function pagesCallingNotFound(): string[] {
  const found: string[] = []
  const walk = (dir: string) => {
    for (const entry of readdirSync(dir)) {
      if (entry === '__tests__') continue
      const full = join(dir, entry)
      if (statSync(full).isDirectory()) {
        walk(full)
        continue
      }
      if (entry !== 'page.tsx') continue
      if (/\bnotFound\(\)/.test(readFileSync(full, 'utf-8'))) found.push(full)
    }
  }
  walk(APP)
  return found
}

/** Route-level loading files that wrap this page, nearest first. */
function loadingFilesAbove(page: string): string[] {
  const above: string[] = []
  let dir = dirname(page)
  while (dir.startsWith(APP)) {
    const candidate = join(dir, 'loading.tsx')
    if (existsSync(candidate)) above.push(relative(APP, candidate))
    if (dir === APP) break
    dir = dirname(dir)
  }
  return above
}

describe('notFound() produces a real 404', () => {
  it('finds the pages it is meant to check', () => {
    expect(pagesCallingNotFound().length).toBeGreaterThan(2)
  })

  it('no page that calls notFound() sits under a route-level loading.tsx', () => {
    const offenders = pagesCallingNotFound()
      .map((page) => ({ page: relative(APP, page), loading: loadingFilesAbove(page) }))
      .filter(({ loading }) => loading.length > 0)
      .map(({ page, loading }) => `${page} is wrapped by ${loading.join(', ')}`)

    expect(offenders).toEqual([])
  })

  /**
   * The skeletons must survive the fix - deleting them would also make the
   * test above pass, with a worse app.
   */
  it('keeps the loading skeletons, as components behind their own Suspense', () => {
    const skeletons = [
      'app/(app)/topics/[slug]/practice/PracticeSkeleton.tsx',
      'app/(app)/ai-skills/AISkillsSkeleton.tsx',
    ]
    for (const file of skeletons) {
      const full = join(__dirname, '..', file.replace(/^app\//, 'app/'))
      expect(existsSync(full), `${file} is missing`).toBe(true)
    }

    const usesSuspense = [
      'app/(app)/topics/[slug]/practice/page.tsx',
      'app/(app)/ai-skills/page.tsx',
      'app/(app)/ai-skills/[moduleId]/page.tsx',
    ]
    for (const file of usesSuspense) {
      const source = readFileSync(join(__dirname, '..', file), 'utf-8')
      expect(source, `${file} should wrap its async work in Suspense`).toMatch(/<Suspense/)
    }
  })
})
