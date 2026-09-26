import { describe, it, expect } from 'vitest'
import { readFileSync, readdirSync } from 'node:fs'
import { join } from 'node:path'

/**
 * seed-topics.ts is the single source of truth for topic definitions.
 *
 * seed-questions.ts used to create its own 'trig-gr11' row when one was
 * missing, with capsWeightPercent 15 against the canonical 40. Because
 * topics.slug is unique, whichever seed ran first won permanently - so
 * running the seeds out of the documented order left the topic stuck on the
 * wrong CAPS weight, silently and forever.
 *
 * Nothing enforced that order, so this does.
 */
const SEED_DIR = 'src/db'

function otherSeeds(): string[] {
  return readdirSync(SEED_DIR)
    .filter((f) => f.startsWith('seed-') && f.endsWith('.ts') && f !== 'seed-topics.ts')
    .map((f) => join(SEED_DIR, f))
}

describe('only seed-topics defines topics', () => {
  it('finds the other seed scripts', () => {
    expect(otherSeeds().length).toBeGreaterThan(0)
  })

  it.each(otherSeeds())('%s does not insert into topics', (path) => {
    const source = readFileSync(path, 'utf8')

    expect(
      source,
      `${path} defines a topic. seed-topics.ts owns those; a second definition drifts.`
    ).not.toMatch(/\.insert\(topics\)/)
  })

  it.each(otherSeeds())('%s does not set capsWeightPercent', (path) => {
    const source = readFileSync(path, 'utf8')
    const assignments = [...source.matchAll(/^\s*capsWeightPercent:\s*\d+/gm)]

    expect(
      assignments.map((m) => m[0].trim()),
      `${path} assigns a CAPS weight; only seed-topics.ts should`
    ).toEqual([])
  })
})
