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
import { isWrongPaper, isOtherSubjectFor } from '../curate-videos'

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
