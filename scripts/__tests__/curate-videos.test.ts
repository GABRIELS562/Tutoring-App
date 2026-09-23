/**
 * The video scorer decides which YouTube lesson a student sees for a CAPS
 * sub-topic, and every case below is one a human review caught being wrong.
 * They are kept as tests because each fix to the scorer risks reviving an
 * earlier mistake - tightening the rules for Grade 11 silently broke two
 * Grade 10 picks once already.
 *
 * The brief is "no non-CAPS videos, rather leave it blank", so a false
 * accept is the expensive failure: a student watching the wrong lesson.
 */
import { describe, it, expect } from 'vitest'
import { relevance, hasRequiredTerms, isOtherSubject, isSchoolTerm } from '../curate-videos'

const MIN_RELEVANCE = 0.3

/** The same chain the curation run applies, minus the network-bound checks. */
function accepts(subTopic: string, title: string): boolean {
  return (
    !isOtherSubject(title) &&
    !isSchoolTerm(subTopic, title) &&
    relevance(subTopic, title) >= MIN_RELEVANCE &&
    hasRequiredTerms(subTopic, title)
  )
}

describe('rejects a video that shares a word but teaches something else', () => {
  const cases: [string, string][] = [
    ['Factorisation: sum and difference of cubes', 'Difference of two squares grade 10'],
    ['Exponents and the exponent laws', 'Exponential Equation Given Graph | Grade 11 Functions'],
    ['The general term Tn = an² + bn + c', 'Grade 11 Physical Sciences Term 2 topics: Physics'],
    [
      'Parallel and perpendicular lines',
      'Vectors in 2D grade 11: Resolving a vector into perpendicular components',
    ],
    ['The area rule', 'Area and Perimeter: Circles'],
    ['Co-functions', 'Trig functions grade 11'],
    ['Advanced simultaneous equations', 'Determine Cubic Equation Calculus grade 12'],
    ['Tangents to circles analytically', 'Equation of Tangent Calculus Grade 12'],
    ['The Theorem of Pythagoras proved via similar triangles', 'Grade 12 Similarity'],
    ['Sum to infinity of a convergent geometric series', '8) Sum of Geometric Series Gr 12 | Intro'],
    ['Box and whisker plots', 'Statistics Grade 10: Ogive curve'],
  ]

  it.each(cases)('%s does not accept "%s"', (subTopic, title) => {
    expect(accepts(subTopic, title)).toBe(false)
  })
})

describe('accepts the video that actually teaches the sub-topic', () => {
  const cases: [string, string][] = [
    ['Factorisation: sum and difference of cubes', '10) Difference of Cubes Grade 10'],
    ['Linear inequalities', 'Grade 10 Inequalities'],
    ['Gradient of a line segment', 'Analytical Geometry Grade 10: Gradient formula'],
    ['Simple and compound depreciation', 'Financial Maths Grade 10 | Depreciation'],
    [
      'Properties of quadrilaterals: parallelograms, rectangles, rhombi, kites',
      'Euclidean Geometry Grade 10: Parallelogram',
    ],
    ['Inclination of a line', 'Grade 11 Analytical geometry: angle of inclination'],
    [
      'Parallel and perpendicular lines',
      'Analytical Geometry Grade 11: Parallel and perpendicular lines',
    ],
    ['Advanced simultaneous equations', 'Simultaneous Equations Grade 12'],
    ['Tangents to circles analytically', 'Analytical Geometry Grade 12: Tangent to a Circle'],
    [
      'The Theorem of Pythagoras proved via similar triangles',
      'Grade 12: Proving Pythagoras using similar triangles',
    ],
    ['Sum to infinity of a convergent geometric series', 'Sum to infinity Grade 12 | Geometric series'],
    ['Sketching cubic graphs', 'Maths 2020: Sketching the Graph of a Cubic Function'],
    ['The equation of a circle centred at the origin', 'Equation of Circle Grade 12'],
    // CAPS says "plots"; the channel does not. Same lesson.
    ['Box and whisker plots', 'Statistics Grade 10: Box and whisker'],
  ]

  it.each(cases)('%s accepts "%s"', (subTopic, title) => {
    expect(accepts(subTopic, title)).toBe(true)
  })
})

describe('subject guards', () => {
  it('treats a physical sciences video as a different subject', () => {
    expect(isOtherSubject('Grade 11 Physical Sciences Term 2 topics')).toBe(true)
    expect(isOtherSubject('Grade 11 Analytical geometry: angle of inclination')).toBe(false)
  })

  it('reads "Term 2" as a school term, not the n-th term', () => {
    expect(isSchoolTerm('The general term Tn = an² + bn + c', 'Physical Sciences Term 2')).toBe(true)
    expect(isSchoolTerm('The general term Tn = an² + bn + c', 'General term of a sequence')).toBe(
      false
    )
  })
})
