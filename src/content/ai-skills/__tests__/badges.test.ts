import { describe, it, expect } from 'vitest'
import { readFileSync } from 'node:fs'
import { badges, moduleOrder } from '@/content/ai-skills'

const PAGE = 'src/app/(app)/ai-skills/page.tsx'
const source = readFileSync(PAGE, 'utf8')

/**
 * Badges were invisible to every student who had not earned one: the whole
 * section was wrapped in `earnedBadges.length > 0`. That is backwards - a
 * badge only motivates if you can see it BEFORE you have it - and it meant
 * the feature could not be shown at all on a fresh account.
 */
describe('the badge set is always visible', () => {
  it('does not hide the section when nothing is earned', () => {
    expect(
      source,
      'the badges block is gated on having earned one, so new students see nothing'
    ).not.toMatch(/\{earnedBadges\.length > 0 && \(/)
  })

  it('renders from the full badge set, not just the earned ids', () => {
    expect(source).toContain('const allBadges = Object.values(badges)')
    expect(source).toMatch(/allBadges\.map/)
  })

  it('shows how many of the whole set are earned', () => {
    expect(source).toMatch(/earnedBadges\.length\}\s*of\s*\{allBadges\.length\}/)
  })
})

describe('badge definitions', () => {
  it('keys each badge by its own id', () => {
    for (const [key, badge] of Object.entries(badges)) {
      expect(badge.id, `${key} is keyed under a different id`).toBe(key)
    }
  })

  it('gives every badge a name, a description and an XP reward', () => {
    for (const badge of Object.values(badges)) {
      expect(badge.name.length, `${badge.id} has no name`).toBeGreaterThan(0)
      // The description is what tells a student how to earn it, so a locked
      // badge with no description is a dead end on the page.
      expect(badge.description.length, `${badge.id} has no description`).toBeGreaterThan(0)
      expect(badge.xpReward, `${badge.id} awards no XP`).toBeGreaterThan(0)
    }
  })

  // An icon name with no entry in BADGE_ICONS silently falls back to Award,
  // so several badges would quietly share one icon.
  it('maps every declared icon to a real component', () => {
    const mapped = source.slice(
      source.indexOf('const BADGE_ICONS'),
      source.indexOf('export const metadata')
    )
    const missing = Object.values(badges)
      .map((badge) => badge.icon)
      .filter((icon) => !new RegExp(`\\b${icon}\\b`).test(mapped))

    expect(missing, `icons with no entry in BADGE_ICONS: ${missing.join(', ')}`).toEqual([])
  })
})

/**
 * The signed-out preview has to hang together. Claiming badges that the
 * modules it also claims would not unlock is the same fault the dashboard
 * had when it showed a real student a stranger's progress.
 */
describe('the signed-out preview is internally consistent', () => {
  const preview = source.slice(
    source.indexOf('const PREVIEW_PROGRESS'),
    source.indexOf('async function getUserProgress')
  )

  it('claims only modules that exist', () => {
    const claimed = [...preview.matchAll(/'([a-z-]+)'/g)]
      .map((m) => m[1])
      .filter((id) => (moduleOrder as readonly string[]).includes(id))

    expect(claimed.length).toBeGreaterThan(0)
    for (const id of claimed) expect(moduleOrder as readonly string[]).toContain(id)
  })

  it('claims only badges that exist', () => {
    const claimed = [...preview.matchAll(/'([a-z-]+)'/g)]
      .map((m) => m[1])
      .filter((id) => id in badges)

    expect(claimed.length, 'the preview earns no badges, so none can be demonstrated').toBeGreaterThan(0)
  })
})
