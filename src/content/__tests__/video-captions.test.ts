import { describe, it, expect } from 'vitest'
import { contentRegistry } from '@/content/registry'
import type { NoteBlock } from '@/types'

/**
 * NoteBlock picks `videoIdAf`/`titleAf` for an Afrikaans reader and
 * `videoId`/`title` for an English one. Eight blocks had an Afrikaans
 * video and no English one, AND the Afrikaans caption written into the
 * English `title` field - so an English student saw
 *
 *   "Kyk: 03 Huidige waarde annuïteite — Wiskunde_Mathematics_SUM"
 *
 * above "No video available in your language". One of them was "The rules
 * of differentiation", the single most-used skill in Grade 12 Paper 1.
 */

function videoBlocks(): { slug: string; section: string; block: NoteBlock }[] {
  const out: { slug: string; section: string; block: NoteBlock }[] = []
  for (const [slug, content] of Object.entries(contentRegistry)) {
    if (slug !== content.id) continue // skip aliases
    for (const section of content.sections ?? []) {
      for (const block of section.blocks ?? []) {
        if (block.type === 'video') out.push({ slug, section: section.title, block })
      }
    }
  }
  return out
}

const blocks = videoBlocks()

describe('video captions match the language they caption', () => {
  it('has video blocks to check', () => {
    expect(blocks.length).toBeGreaterThan(200)
  })

  /**
   * The English caption describes the English video. If a block only has
   * an Afrikaans video, it must carry NO English caption rather than the
   * Afrikaans one - the "no video in your language" message then stands on
   * its own, correctly and in the reader's language.
   */
  it('never shows an Afrikaans caption to an English reader', () => {
    const offenders = blocks
      .filter(({ block }) => block.title?.startsWith('Kyk:'))
      .map(({ slug, section }) => `${slug} / ${section}`)

    expect(offenders).toEqual([])
  })

  it('never shows an English caption to an Afrikaans reader', () => {
    const offenders = blocks
      .filter(({ block }) => block.titleAf?.startsWith('Watch:'))
      .map(({ slug, section }) => `${slug} / ${section}`)

    expect(offenders).toEqual([])
  })

  it('captions every Afrikaans video in Afrikaans', () => {
    const offenders = blocks
      .filter(({ block }) => block.videoIdAf && !block.titleAf)
      .map(({ slug, section }) => `${slug} / ${section}`)

    expect(offenders).toEqual([])
  })

  it('captions every English video in English', () => {
    const offenders = blocks
      .filter(({ block }) => block.videoId && !block.title)
      .map(({ slug, section }) => `${slug} / ${section}`)

    expect(offenders).toEqual([])
  })

  it('gives a block with no video at all nothing to caption', () => {
    const offenders = blocks
      .filter(({ block }) => !block.videoId && !block.videoIdAf)
      .map(({ slug, section }) => `${slug} / ${section}`)

    expect(offenders).toEqual([])
  })
})

/**
 * Not a failure - a ledger. These sub-topics play an Afrikaans video and
 * nothing for English, because no CAPS-channel English video survived
 * curation for them. The count is asserted so it can only go DOWN without
 * someone deliberately updating this number, and so the gap stays visible
 * instead of being quietly normal.
 */
describe('sub-topics still missing an English video', () => {
  it('is a known, shrinking list', () => {
    const afOnly = blocks
      .filter(({ block }) => !block.videoId && block.videoIdAf)
      .map(({ slug, section }) => `${slug} / ${section}`)
      .sort()

    expect(afOnly).toEqual([
      'analytical-geometry-gr11 / Parallel and perpendicular lines',
      'electricity-magnetism-gr12 / Series and parallel resistor networks',
      'finance-gr11 / Present value annuities',
      'matter-materials-gr10 / Names and formulae of compounds',
      'probability-gr11 / The product rule for independent events',
      'trig-gr10 / Trig ratios on the Cartesian plane (0° to 360°)',
    ])
  })
})
