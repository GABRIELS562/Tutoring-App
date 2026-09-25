/**
 * The Afrikaans science track. Every case here is a way the run produced
 * nothing useful before, found by harvesting 525 real Afrikaans science
 * video titles and checking the scorer against them rather than against a
 * dictionary.
 */
import { describe, it, expect } from 'vitest'
import { fold, hasRequiredTermsFor } from '../curate-videos'
import {
  AFRIKAANS_CHANNELS,
  AFRIKAANS_SCIENCE_TERMS,
  afrikaansQueries,
} from '../lib/afrikaans'
import { allScienceSubTopics } from '@/content/caps-science-curriculum'

describe('diacritics do not hide a match', () => {
  // The matcher tokenises on [a-z0-9], so "Intermolekulêre" split into
  // "intermolekul" and "re" and matched nothing. Afrikaans titles are
  // written with diacritics, so this was most of them.
  it('folds Afrikaans diacritics to ASCII', () => {
    expect(fold('Intermolekulêre Kragte')).toBe('Intermolekulere Kragte')
    expect(fold('Stoïgiometriese Berekeninge')).toBe('Stoigiometriese Berekeninge')
    expect(fold('Fotoëlektriese effek')).toBe('Fotoelektriese effek')
    expect(fold('Molekulêre vorm')).toBe('Molekulere vorm')
  })

  it('leaves unaccented text alone', () => {
    expect(fold('Sure en basisse')).toBe('Sure en basisse')
  })

  // The spellings channels genuinely disagree on collapse to one key, so
  // the vocabulary needs a single entry rather than one per spelling.
  it('makes competing spellings equal', () => {
    expect(fold('stoïgiometriese')).toBe(fold('stoigiometriese'))
    expect(fold('intermolekulêre')).toBe(fold('intermolekulere'))
  })
})

describe('Afrikaans science queries', () => {
  it('searches for science, not maths', () => {
    const queries = afrikaansQueries('Newton laws of motion', 11, 'science')
    expect(queries.join(' ')).toContain('fisika')
    expect(queries.join(' ')).not.toContain('wiskunde')
  })

  it('still searches wiskunde for maths', () => {
    const queries = afrikaansQueries('Solving quadratic equations', 11, 'maths')
    expect(queries.join(' ')).toContain('wiskunde')
  })

  it('covers every CAPS science sub-topic', () => {
    const uncovered = allScienceSubTopics()
      .filter(({ topic, subTopic }) => afrikaansQueries(subTopic, topic.grade, 'science').length === 0)
      .map(({ topic, subTopic }) => `gr${topic.grade} ${subTopic}`)

    expect(uncovered, `no Afrikaans vocabulary for:\n${uncovered.join('\n')}`).toEqual([])
  })
})

/**
 * Does the vocabulary actually describe how Afrikaans teachers title videos?
 *
 * This checks the map directly rather than going through relevance(), which
 * builds its synonym table from process.argv at module load and so cannot
 * see the Afrikaans vocabulary in a test. The map is the deliverable here,
 * and the map is what could be wrong.
 */
function afrikaansTermsFor(subTopic: string): string[] {
  return subTopic
    .toLowerCase()
    .split(/[^a-z]+/)
    .flatMap((word) => AFRIKAANS_SCIENCE_TERMS[word] ?? [])
}

describe('vocabulary matches how teachers actually write titles', () => {
  // Each pairing is a real harvested title. The obvious translation is often
  // not the one used: "mole concept" is "molbegrip", not "mol konsep", and
  // work/energy/power is the fixed phrase "arbeid, energie en drywing".
  const realTitles: [string, string][] = [
    ['The mole concept', 'Gr.10 Die Molbegrip. 1'],
    ['Work, energy and power', 'Gr. 12 Fisika: Arbeid, energie en drywing'],
    ['Acids and bases', 'Fisiese Wetenskap - Sure en basisse 01'],
    ['Intermolecular forces', 'GR11 Intermolek\u00fclere Kragte'.replace('\u00fc', 'û')],
    ['Momentum and impulse', 'Momentum, Impuls en Wet van Behoud van Momentum: Gr. 12 Fisika'],
    ['Electrostatics', 'Gr. 10 Fisika: Elektrostatika'],
    ['Galvanic cells', 'Gr. 12 Elektrochemie: Galvaniese selle | VERSTAAN selle'],
    ['Organic molecular structures', 'Gr. 12 Organiese Chemie: Naamgewing'],
    ['Chemical equilibrium', 'Gr.12 Chemie: VERSTAAN Chemiese ewewig (inleidend)'],
    ['The periodic table', 'Tendense van die Periodieke Tabel: Gr. 10 Chemie'],
    ['Reaction rate', 'Reaksietempo Graad 12 Chemie'],
    ['Vertical projectile motion', 'Gr. 12 Fisika: Projektielbeweging'],
    ['Doppler effect', 'Fisiese Wetenskap - Doppler-effek 01'],
    ['Stoichiometric calculations', 'Gr.10 Stoigiometriese berekeninge.'],
    ['Electric circuits', 'Stroombane: Weerstand Graad 10 Fisika'],
  ]

  it.each(realTitles)('recognises "%s" in a real Afrikaans title', (subTopic, title) => {
    const haystack = fold(title.toLowerCase())
    const matched = afrikaansTermsFor(subTopic).filter((term) =>
      haystack.includes(fold(term))
    )

    expect(
      matched.length,
      `no vocabulary from "${subTopic}" appears in "${title}"`
    ).toBeGreaterThan(0)
  })
})

describe('channel list', () => {
  it('includes the Afrikaans science channels found by harvesting', () => {
    for (const channel of ['Wolkskool', 'Skeinat met Schabort', 'Simple Science']) {
      expect(AFRIKAANS_CHANNELS.has(channel), `${channel} missing`).toBe(true)
    }
  })

  // Lewenswetenskappe is Life Sciences. It is popular and it surfaces on
  // Afrikaans science searches, so admitting it would hand a Physical
  // Sciences sub-topic a biology video on view count alone.
  it('excludes the Life Sciences channel', () => {
    expect(AFRIKAANS_CHANNELS.has('Lewenswetenskappe Lesse')).toBe(false)
  })
})

describe('science vocabulary', () => {
  it('is keyed on lowercase English words', () => {
    const bad = Object.keys(AFRIKAANS_SCIENCE_TERMS).filter((k) => k !== k.toLowerCase())
    expect(bad).toEqual([])
  })

  it('has no empty translation lists', () => {
    const empty = Object.entries(AFRIKAANS_SCIENCE_TERMS)
      .filter(([, v]) => v.length === 0)
      .map(([k]) => k)
    expect(empty).toEqual([])
  })

  it('does not carry diacritics, since matching folds them away', () => {
    const accented = Object.entries(AFRIKAANS_SCIENCE_TERMS)
      .flatMap(([k, v]) => v.filter((t) => fold(t) !== t).map((t) => `${k}: ${t}`))
    expect(accented, `fold() makes these unreachable duplicates:\n${accented.join('\n')}`).toEqual([])
  })
})

describe('hasRequiredTermsFor still rejects off-topic Afrikaans titles', () => {
  it('does not accept a maths video for a science sub-topic', () => {
    expect(hasRequiredTermsFor('science', 'Momentum and impulse', 'GR12 Trig Algemene Oplossings 1A')).toBe(false)
  })
})
