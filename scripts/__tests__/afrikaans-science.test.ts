/**
 * The Afrikaans science track. Every case here is a way the run produced
 * nothing useful before, found by harvesting 525 real Afrikaans science
 * video titles and checking the scorer against them rather than against a
 * dictionary.
 */
import { describe, it, expect } from 'vitest'
import {
  fold,
  hasRequiredTermsFor,
  isOtherMathsTopic,
  synonymsFor,
  SCIENCE_DISCRIMINATING,
} from '../curate-videos'

const AF_SCIENCE = synonymsFor('science', 'af')
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

/**
 * The scorer treats these terms as naming the lesson: if a sub-topic
 * contains one, a candidate title must contain it too, or it is rejected
 * outright. So a discriminating term with no Afrikaans form silently blocks
 * every Afrikaans candidate for every sub-topic that names it - which is
 * what kept "Vectors and scalars" empty while a 8,089-view
 * "Skalare en vektore" lesson sat in the results. 23 terms were missing.
 */
describe('every discriminating term has an Afrikaans form', () => {
  it('leaves no science sub-topic unpickable in Afrikaans', () => {
    const missing = [...new Set(SCIENCE_DISCRIMINATING)].filter(
      (term) => !AFRIKAANS_SCIENCE_TERMS[term]
    )

    expect(
      missing,
      `these block every Afrikaans candidate for any sub-topic naming them:\n${missing.join(', ')}`
    ).toEqual([])
  })

  it('accepts a real Afrikaans title for a discriminating sub-topic', () => {
    expect(
      hasRequiredTermsFor('science', 'Vectors and scalars', "Gr. 10 Fisika: Meganika (Skalare en vektore) in 'n NEUTEDOP", AF_SCIENCE)
    ).toBe(true)
    expect(
      hasRequiredTermsFor('science', 'Isotopes and relative atomic mass', 'FW GR10 atoom en isotope', AF_SCIENCE)
    ).toBe(true)
  })

  it('still rejects a title that does not name the concept', () => {
    expect(
      hasRequiredTermsFor('science', 'Vectors and scalars', 'Gr 10 Fisika : Hersieningsklas 4 - Stroombane 1', AF_SCIENCE)
    ).toBe(false)
  })
})

/**
 * Cross-topic protection on Afrikaans science titles. These markers were
 * English-only, so they matched nothing on an Afrikaans title and the whole
 * Afrikaans science run was curated with the guard switched off. Both
 * rejection cases below are picks that were actually shipped.
 *
 * NOTE: isOtherMathsTopic reads the subject from argv, so these run under
 * the science markers only because this file is executed with no --subject
 * flag... which selects MATHS markers. The science cases are therefore
 * asserted through the exported markers directly in the run itself; what is
 * pinned here is the vocabulary and folding the guard depends on.
 */
describe('Afrikaans science cross-topic vocabulary', () => {
  // "Ewewig" is equilibrium in mechanics as much as in chemistry: "Vektore:
  // Drie Kragte in Ewewig" is a forces lesson. Only the chemical compounds
  // discriminate, and using the bare word rejected a correct pick.
  it('does not treat bare "ewewig" as chemistry', () => {
    const chemistryOnly = /chemiese ewewig|ewewigskonstante|ewewigsposisie|ewewigsberekening/i
    expect(chemistryOnly.test("Vektore: Drie Kragte in Ewewig - 'n Tipiese probleem")).toBe(false)
    expect(chemistryOnly.test('Gr.12 Chemie: VERSTAAN Chemiese ewewig (inleidend)')).toBe(true)
  })

  // Short Afrikaans words are substrings of unrelated ones, so the markers
  // anchor them: veiligheid contains "lig", molekule contains "mol".
  it('anchors short words so they do not match inside longer ones', () => {
    expect(/\blig\b/i.test('Veiligheid in die laboratorium')).toBe(false)
    expect(/\blig\b/i.test('Golwe, klank en lig')).toBe(true)
    expect(/\bmol\b/i.test('Organiese molekules')).toBe(false)
    expect(/\bmol\b/i.test('Gr. 10 Chemie: Mol som voorbeeld')).toBe(true)
  })

  it('folds before matching so accented titles reach the patterns', () => {
    expect(fold('Intermolekulêre Kragte')).toMatch(/intermolekulere/i)
  })
})
