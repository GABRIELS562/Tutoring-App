/**
 * The Afrikaans maths track.
 *
 * Cross-topic protection is the only thing stopping a video from one CAPS
 * topic being served for another, and it was English-only: while the topic
 * markers held no Afrikaans, they matched nothing on an Afrikaans title, so
 * every Afrikaans pick was made with that protection silently switched off.
 * Each case below is a real title from the curation run.
 */
import { describe, it, expect } from 'vitest'
import { isOtherMathsTopic, MATHS_DISCRIMINATING, fold } from '../curate-videos'
import { AFRIKAANS_TERMS } from '../lib/afrikaans'

describe('cross-topic protection works on Afrikaans titles', () => {
  // The case that exposed it: Grade 11 "Tangents to circles" is Euclidean
  // geometry. Analytical geometry is a different topic with a different
  // paper, and this video outranked the correct one on views alone.
  it('keeps an analytical geometry video out of Euclidean geometry', () => {
    expect(
      isOtherMathsTopic('euclidean-geometry-gr11', 'Wiskunde - Analitiese Meetkunde: Sirkels en raaklyne')
    ).toBe(true)
  })

  it('still allows the correct Euclidean video', () => {
    expect(isOtherMathsTopic('euclidean-geometry-gr11', '04  Raaklyne aan sirkels')).toBe(false)
  })

  it('allows the analytical video on the analytical topic', () => {
    expect(
      isOtherMathsTopic('analytical-geometry-gr12', 'Wiskunde - Analitiese Meetkunde: Sirkels en raaklyne')
    ).toBe(false)
  })

  it.each([
    ['trig-gr11', 'Graad 11 Sinus, Kosinus en Oppervlakte reël BEWYSE'],
    ['finance-gr10', '03 Huurkoop'],
    ['finance-gr11', '02 Toekomstige waarde annuiteite'],
    ['statistics-gr11', 'Ogief (Kumulatiewe Frekwensiegrafiek)'],
    ['functions-gr10', '09 Eksponensiële funksie skets'],
    ['calculus-gr12', 'Graad 12 Hoofstuk 8 Les 10 Optimering en verandering'],
    ['probability-gr11', "Hersiening van waarskynlikheid se reëls - Graad 11"],
  ])('does not reject a correct Afrikaans video for %s', (slug, title) => {
    expect(isOtherMathsTopic(slug, title)).toBe(false)
  })

  it.each([
    ['euclidean-geometry-gr11', 'Graad 11 Sinus, Kosinus en Oppervlakte reël BEWYSE'],
    ['trig-gr12', 'Graad 12 Statistiek #5: Linieêre Regressie'],
    ['functions-gr10', '03 Huurkoop'],
  ])('rejects an off-topic Afrikaans video for %s', (slug, title) => {
    expect(isOtherMathsTopic(slug, title)).toBe(true)
  })

  // Patterns are matched against the folded title, so they are written
  // without diacritics. A pattern carrying one can never fire.
  it('has no diacritics in the marker patterns', () => {
    expect(fold('Sinus, Kosinus en Oppervlakte reël')).toBe('Sinus, Kosinus en Oppervlakte reel')
  })
})

describe('Afrikaans maths vocabulary', () => {
  it('covers every discriminating term', () => {
    const missing = [...new Set(MATHS_DISCRIMINATING)].filter((t) => !AFRIKAANS_TERMS[t])

    expect(
      missing,
      `these block every Afrikaans candidate for any sub-topic naming them: ${missing.join(', ')}`
    ).toEqual([])
  })

  // Folding collapses the accented and unaccented spellings into one key, so
  // listing both is dead weight that reads as coverage.
  it('carries no spelling that folding makes redundant', () => {
    const redundant = Object.entries(AFRIKAANS_TERMS).flatMap(([key, forms]) => {
      const seen = new Set<string>()
      return forms
        .filter((form) => !seen.has(fold(form)) ? (seen.add(fold(form)), false) : true)
        .map((form) => `${key}: ${form}`)
    })

    expect(redundant, `duplicate after folding:\n${redundant.join('\n')}`).toEqual([])
  })
})
