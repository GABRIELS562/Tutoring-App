/**
 * Science guards for the video scorer.
 *
 * Physical Sciences breaks two assumptions the maths curation was built on:
 *
 * 1. The subject guard was inverted. isOtherSubject() rejected anything
 *    mentioning physics or chemistry, because for maths those were the wrong
 *    answer. Run unchanged against science it would reject nearly every
 *    correct video, so the guard now switches on --subject.
 * 2. One subject, two papers that compete for the same words. "Power" is in
 *    Work Energy & Power and in electric circuits; "energy" is in mechanics
 *    and in bond energy; "conservation" covers momentum and mass. The CAPS
 *    `paper` field settles it structurally - paper 1 physics, paper 2
 *    chemistry - which is a signal maths never had.
 *
 * These run with --subject science set, since the module reads argv once.
 */
import { describe, it, expect } from 'vitest'
import {
  isWrongPaper,
  isOtherSubjectFor,
  hasRequiredTermsFor,
  isExamWalkthrough,
  isOtherMathsTopic,
} from '../curate-videos'

describe('the physics/chemistry paper guard', () => {
  it('keeps a chemistry video out of a physics sub-topic', () => {
    expect(isWrongPaper(1, 'Titration calculations Grade 12')).toBe(true)
    expect(isWrongPaper(1, 'Galvanic cells and standard electrode potentials')).toBe(true)
    expect(isWrongPaper(1, 'Naming organic compounds: alkanes and alkenes')).toBe(true)
  })

  it('keeps a physics video out of a chemistry sub-topic', () => {
    expect(isWrongPaper(2, 'Newton’s second law Grade 11')).toBe(true)
    expect(isWrongPaper(2, 'Projectile motion graphs Grade 12')).toBe(true)
    expect(isWrongPaper(2, "Snell's Law and refraction")).toBe(true)
  })

  it('allows a video that names its own half', () => {
    expect(isWrongPaper(1, 'Momentum and impulse Grade 12')).toBe(false)
    expect(isWrongPaper(2, 'Stoichiometry Grade 11: limiting reagents')).toBe(false)
  })

  it('allows a title that names neither half, leaving it to the other filters', () => {
    expect(isWrongPaper(1, 'Grade 10 Physical Sciences revision')).toBe(false)
    expect(isWrongPaper(2, 'Grade 10 Physical Sciences revision')).toBe(false)
  })

  it('does not mistake electrolytic for electric', () => {
    // "electrolytic" and "electrochemistry" must read as chemistry even
    // though they start like the physics word.
    expect(isWrongPaper(2, 'Electrolytic cells Grade 12')).toBe(false)
    expect(isWrongPaper(2, 'Electrochemistry: galvanic cells')).toBe(false)
  })

  it('reads a title naming both halves as acceptable to either', () => {
    // Paper walkthroughs cover both; the relevance gate decides those.
    expect(isWrongPaper(1, 'Physics and Chemistry exam walkthrough')).toBe(false)
    expect(isWrongPaper(2, 'Physics and Chemistry exam walkthrough')).toBe(false)
  })
})

describe('the subject guard runs both ways', () => {
  it('rejects a science video for a maths sub-topic, as before', () => {
    expect(isOtherSubjectFor('maths', 'Grade 11 Physical Sciences Term 2 topics')).toBe(true)
    expect(isOtherSubjectFor('maths', 'The Doppler Effect Simultaneous Equations grade 12')).toBe(
      true
    )
  })

  it('rejects a maths video for a science sub-topic', () => {
    expect(isOtherSubjectFor('science', 'Trig Triangles Grade 10 — Kevinmathscience')).toBe(true)
    expect(isOtherSubjectFor('science', 'Algebra Grade 11: quadratic formula')).toBe(true)
    expect(isOtherSubjectFor('science', 'Analytical Geometry Grade 12')).toBe(true)
  })

  it('rejects the neighbouring school subjects for science', () => {
    // Natural Sciences is the Grade 8-9 subject that precedes Physical
    // Sciences and shares its vocabulary at a much shallower depth.
    expect(isOtherSubjectFor('science', 'Natural Sciences Grade 9: electricity')).toBe(true)
    expect(isOtherSubjectFor('science', 'Life Sciences Grade 12: genetics')).toBe(true)
  })

  it('accepts a genuine Physical Sciences video for science', () => {
    const titles = [
      'Physical Sciences Grade 10: Newton’s Laws',
      'Momentum and Impulse Grade 12',
      'Titration calculations Grade 12 Chemistry',
      "Snell's Law Grade 11",
    ]
    for (const title of titles) expect(isOtherSubjectFor('science', title)).toBe(false)
  })
})

describe('CAPS enumerations list alternatives, not requirements', () => {
  it('accepts a video covering one of the listed bond types', () => {
    // CAPS says "covalent, ionic and metallic"; no single video names all
    // three, and demanding all of them left the sub-topic blank while
    // Kevinmathscience had a perfectly good ionic bonding lesson.
    expect(
      hasRequiredTermsFor(
        'science',
        'Chemical bonding: covalent, ionic and metallic',
        '24) Ionic Bonding Grade 10'
      )
    ).toBe(true)
    expect(
      hasRequiredTermsFor(
        'science',
        'Chemical bonding: covalent, ionic and metallic',
        'Covalent Bonding Grade 10 Physical Sciences'
      )
    ).toBe(true)
  })

  it('still rejects a video about none of the listed concepts', () => {
    expect(
      hasRequiredTermsFor('science', 'Chemical bonding: covalent, ionic and metallic', 'Stoichiometry Grade 10')
    ).toBe(false)
  })

  it('does not relax a sub-topic that names a single concept', () => {
    // No comma, so the concept is still compulsory.
    expect(hasRequiredTermsFor('science', 'Conservation of momentum', 'Stoichiometry Grade 10')).toBe(false)
    expect(hasRequiredTermsFor('science', 'Conservation of momentum', 'Conservation of momentum Grade 12')).toBe(
      true
    )
  })
})

describe('only a list after a colon is an enumeration', () => {
  it('does not relax a comma that joins two different concepts', () => {
    // No colon: this sub-topic covers both halves, and relaxing it let a
    // stoichiometry video stand in for physical and chemical change.
    expect(
      hasRequiredTermsFor(
        'science',
        'Molar mass, percentage composition and empirical formula',
        'Quantitative Aspects of Chemical Change: Molar Volume'
      )
    ).toBe(false)
  })

  it('still relaxes a genuine list after a colon', () => {
    expect(
      hasRequiredTermsFor(
        'science',
        'Reaction types: ion exchange, gas forming, acid-base and redox',
        'Redox reactions Grade 11 Chemistry'
      )
    ).toBe(true)
  })
})

describe('Grade 12 near-miss picks', () => {
  const rejects: [string, string][] = [
    ["Le Chatelier's principle", 'Equilibrium Graphs grade 12: Introduction'],
    ['Addition reactions of alkenes', 'General Formula Organic Chemistry Gr 12 | Alkanes'],
    ['The function of nitrogen, phosphorus and potassium in plants', 'Exam question functions gr 12'],
    ['Collision theory, activation energy and catalysts', 'Rate of Reaction Grade 12'],
    ['Combustion of alkanes and the preparation of esters', 'Naming alkanes Grade 12'],
  ]

  it.each(rejects)('%s does not accept "%s"', (subTopic, title) => {
    expect(hasRequiredTermsFor('science', subTopic, title)).toBe(false)
  })

  it('accepts the video that names the concept', () => {
    expect(
      hasRequiredTermsFor(
        'science',
        "Le Chatelier's principle",
        "Le Chatelier's Principle Grade 12"
      )
    ).toBe(true)
    expect(
      hasRequiredTermsFor(
        'science',
        'Addition reactions of alkenes',
        'Addition reactions of alkenes Grade 12'
      )
    ).toBe(true)
  })
})

describe('lessons outrank exam walkthroughs', () => {
  it('marks a past-paper walkthrough as such', () => {
    const walkthroughs = [
      'Newton laws exam questions',
      "Newton's Laws Exam Practice Question Gr 11 and 12",
      'Full Memo Grade 10 Physical Sciences March',
      'Physical Sciences Grade 12 past paper walkthrough',
    ]
    for (const title of walkthroughs) expect(isExamWalkthrough(title)).toBe(true)
  })

  it('does not mark an ordinary lesson as one', () => {
    const lessons = [
      "Newton's Third Law of Motion Grade 11 Physics",
      'Momentum and Impulse Grade 12',
      'Questions about acids and bases',
    ]
    for (const title of lessons) expect(isExamWalkthrough(title)).toBe(false)
  })
})

describe('a definitive topic signal outranks a passing mention', () => {
  it('keeps a Work Energy & Power lesson out of electric motors', () => {
    // It matched on the word "motor" while being a mechanics lesson that
    // merely uses a motor as its worked example.
    expect(
      isOtherMathsTopic('electricity-magnetism-gr12', 'Power of an electric motor: Power part 3: WEP gr12')
    ).toBe(true)
  })

  it('still allows that lesson for Mechanics itself', () => {
    expect(isOtherMathsTopic('mechanics-gr12', 'Power part 3: WEP gr12')).toBe(false)
  })

  it('leaves an ordinary electrodynamics title alone', () => {
    expect(isOtherMathsTopic('electricity-magnetism-gr12', 'Electric motors Grade 12 Electrodynamics')).toBe(
      false
    )
  })
})
