import { describe, it, expect } from 'vitest'
import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { contentRegistry } from '@/content/registry'
import { formulas } from '@/content/formulas'

/**
 * Every internal link to a topic must name a REGISTERED slug.
 *
 * Registry slugs are grade-suffixed (`euclidean-geometry-gr11`), and three
 * separate places had been written with the bare stem. The dashboard's
 * study-plan panel - the most prominent thing on the first screen a
 * student sees - sent its 2nd, 3rd and 4th cards to "Topic not found",
 * and 26 of the 44 "Practice" links on the formula sheet went the same
 * way. Nothing caught it, because a wrong slug is a perfectly valid
 * string.
 *
 * `/topics/[slug]` calls notFound() on an unregistered slug, but
 * `/topics/[slug]/practice` does NOT - it renders a page titled with the
 * raw slug and "No questions yet", whose own "Back to notes" link then
 * 404s. So a bad slug is worse than a 404: it looks like a real but empty
 * topic.
 */

const ROOT = join(__dirname, '..', '..', '..')

function registered(slug: string): boolean {
  return slug in contentRegistry
}

describe('the formula sheet links to real topics', () => {
  it('gives every formula a registered topic slug', () => {
    const dead = formulas
      .filter((formula) => !registered(formula.topicSlug))
      .map((formula) => `${formula.id} -> ${formula.topicSlug}`)

    expect(dead).toEqual([])
  })

  it('has formulas to check in the first place', () => {
    expect(formulas.length).toBeGreaterThan(20)
  })
})

describe("the dashboard's study plan links to real topics", () => {
  const source = readFileSync(
    join(ROOT, 'src', 'components', 'dashboard', 'StudyPlanBanner.tsx'),
    'utf-8'
  )

  function planSlugs(): string[] {
    return Array.from(source.matchAll(/slug: '([a-z0-9-]+)'/g)).map((m) => m[1])
  }

  it('recommends topics that exist', () => {
    const slugs = planSlugs()
    expect(slugs.length).toBeGreaterThan(0)

    const dead = slugs.filter((slug) => !registered(slug))
    expect(dead).toEqual([])
  })
})

/**
 * The formula sheet was reachable only by typing /formulas - no link to it
 * existed anywhere in the app. A feature nobody can find is not a feature.
 */
describe('every main destination is reachable from the sidebar', () => {
  const sidebar = readFileSync(
    join(ROOT, 'src', 'components', 'layout', 'Sidebar.tsx'),
    'utf-8'
  )

  const DESTINATIONS = [
    '/dashboard',
    '/subjects',
    '/ai-skills',
    '/exam',
    '/papers',
    '/progress',
    '/formulas',
  ]

  it.each(DESTINATIONS)('links to %s', (href) => {
    expect(sidebar).toContain(`href: '${href}'`)
  })

  /**
   * Eight destinations do not fit side by side on a 360px phone, and the
   * Afrikaans labels are longer. The row must be allowed to scroll rather
   * than crush its items together.
   */
  it('lets the mobile tab bar scroll instead of squashing', () => {
    expect(sidebar).toMatch(/overflow-x-auto/)
    expect(sidebar).not.toMatch(/h-16 md:hidden flex items-center justify-around/)
  })
})
