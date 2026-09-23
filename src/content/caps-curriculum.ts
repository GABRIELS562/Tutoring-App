/**
 * CAPS Mathematics curriculum, Grades 10-12.
 *
 * Transcribed from docs/curriculum/Grade_10-12_Math_CAPS_Handbook.pdf
 * (client-supplied, 20 Sep 2026). This is the authority for which topics
 * the product must cover and at what granularity - the app's own
 * `contentRegistry` (src/content/registry.ts) is currently a subset of it
 * (see `npm run curriculum:gaps`).
 *
 * `subTopics` are the unit of video curation: one curated video per
 * sub-topic, not one per topic. A student stuck on "general solutions"
 * should not have to scrub through a 40-minute video covering all of
 * trigonometry to find it.
 *
 * `slug` matches src/content/registry.ts where the topic already exists,
 * and is the slug it SHOULD take when built where it does not.
 */

export type CapsPaper = 1 | 2
export type CapsGrade = 10 | 11 | 12

export interface CapsTopic {
  /** Registry slug - existing or intended. */
  slug: string
  /** Topic name as it appears in the CAPS handbook. */
  title: string
  grade: CapsGrade
  paper: CapsPaper
  /** The unit of video curation - one curated video per entry. */
  subTopics: string[]
}

export const capsCurriculum: CapsTopic[] = [
  // ---------------------------------------------------------------- Grade 10
  {
    slug: 'algebra-gr10',
    title: 'Algebra & Equations',
    grade: 10,
    paper: 1,
    subTopics: [
      'Exponents and the exponent laws',
      'Factorisation: trinomials',
      'Factorisation: sum and difference of cubes',
      'Solving linear equations',
      'Solving quadratic equations',
      'Solving simultaneous equations',
      'Linear inequalities',
    ],
  },
  {
    slug: 'number-patterns-gr10',
    title: 'Number Patterns',
    grade: 10,
    paper: 1,
    subTopics: [
      'Investigating and extending linear (arithmetic) sequences',
      'Finding the general formula (n-th term) of a linear sequence',
    ],
  },
  {
    slug: 'functions-gr10',
    title: 'Functions & Graphs',
    grade: 10,
    paper: 1,
    subTopics: [
      'The linear function y = mx + c',
      'The quadratic function y = ax²',
      'The hyperbolic function y = a/x',
      'The exponential function y = ab^x',
    ],
  },
  {
    slug: 'finance-gr10',
    title: 'Finance & Growth',
    grade: 10,
    paper: 1,
    subTopics: [
      'Simple interest',
      'Compound interest',
      'Simple and compound depreciation',
      'Hire-purchase',
      'Exchange rates',
    ],
  },
  {
    slug: 'probability-gr10',
    title: 'Probability',
    grade: 10,
    paper: 1,
    subTopics: [
      'Venn diagrams',
      'Theoretical and relative frequency probability',
      'The addition rule (identity rule)',
    ],
  },
  {
    slug: 'trig-gr10',
    title: 'Trigonometry',
    grade: 10,
    paper: 2,
    subTopics: [
      'Trig ratios in right-angled triangles',
      'Trig ratios on the Cartesian plane (0° to 360°)',
      'Two-dimensional problems (elevation and depression)',
      'Basic trig graphs: sin, cos, tan',
    ],
  },
  {
    slug: 'euclidean-geometry-gr10',
    title: 'Euclidean Geometry',
    grade: 10,
    paper: 2,
    subTopics: [
      'Lines, angles and triangles',
      'Properties of quadrilaterals: parallelograms, rectangles, rhombi, kites',
      'The Midpoint Theorem',
    ],
  },
  {
    slug: 'analytical-geometry-gr10',
    title: 'Analytical Geometry',
    grade: 10,
    paper: 2,
    subTopics: ['The distance formula', 'The midpoint formula', 'Gradient of a line segment'],
  },
  {
    slug: 'statistics-gr10',
    title: 'Statistics',
    grade: 10,
    paper: 2,
    subTopics: [
      'Data collection and organisation',
      'Measures of central tendency: mean, median, mode',
      'Measures of dispersion: range, quartiles, percentiles',
      'Box and whisker plots',
    ],
  },

  // ---------------------------------------------------------------- Grade 11
  {
    slug: 'algebra-gr11',
    title: 'Algebra & Equations',
    grade: 11,
    paper: 1,
    subTopics: [
      'Surds and fractional exponents',
      'Completing the square',
      'The quadratic formula',
      'Nature of roots (the discriminant)',
      'Quadratic inequalities',
      'Simultaneous equations: linear and quadratic',
    ],
  },
  {
    slug: 'number-patterns-gr11',
    title: 'Number Patterns',
    grade: 11,
    paper: 1,
    subTopics: [
      'Quadratic number patterns and the second constant difference',
      'The general term Tn = an² + bn + c',
    ],
  },
  {
    slug: 'functions-gr11',
    title: 'Functions & Graphs',
    grade: 11,
    paper: 1,
    subTopics: [
      'The parabola y = a(x - p)² + q',
      'The hyperbola y = a/(x - p) + q',
      'The exponential graph y = ab^(x - p) + q',
      'Introduction to inverse functions',
    ],
  },
  {
    slug: 'finance-gr11',
    title: 'Finance & Growth',
    grade: 11,
    paper: 1,
    subTopics: [
      'Sinking funds',
      'Future value annuities',
      'Present value annuities',
      'Nominal versus effective interest rates',
    ],
  },
  {
    slug: 'probability-gr11',
    title: 'Probability',
    grade: 11,
    paper: 1,
    subTopics: [
      'Dependent and independent events',
      'The product rule for independent events',
      'Tree diagrams',
      'Contingency (two-way) tables',
    ],
  },
  {
    slug: 'trig-gr11',
    title: 'Trigonometry',
    grade: 11,
    paper: 2,
    subTopics: [
      'Reduction formulae in the four quadrants',
      'Co-functions',
      'Trigonometric identities: tan = sin/cos and sin² + cos² = 1',
      'General solutions of trig equations',
      'The sine rule',
      'The cosine rule',
      'The area rule',
    ],
  },
  {
    slug: 'euclidean-geometry-gr11',
    title: 'Euclidean Geometry',
    grade: 11,
    paper: 2,
    subTopics: [
      'Circle geometry: chords',
      'Angles at the centre and at the circumference',
      'Cyclic quadrilaterals',
      'Tangents to circles',
    ],
  },
  {
    slug: 'analytical-geometry-gr11',
    title: 'Analytical Geometry',
    grade: 11,
    paper: 2,
    subTopics: [
      'Inclination of a line',
      'Parallel and perpendicular lines',
      'Solving geometric shapes analytically',
    ],
  },
  {
    slug: 'statistics-gr11',
    title: 'Statistics',
    grade: 11,
    paper: 2,
    subTopics: [
      'Grouped data analysis',
      'Ogives (cumulative frequency graphs)',
      'Variance and standard deviation',
      'Symmetric and skewed data',
    ],
  },

  // ---------------------------------------------------------------- Grade 12
  {
    slug: 'algebra-gr12',
    title: 'Algebra & Equations',
    grade: 12,
    paper: 1,
    subTopics: [
      'Revision of quadratic equations and inequalities',
      'Advanced simultaneous equations',
      'Logarithms applied to exponential equations',
    ],
  },
  {
    slug: 'sequences-series-gr12',
    title: 'Patterns & Series',
    grade: 12,
    paper: 1,
    subTopics: [
      'Arithmetic sequences and series',
      'Geometric sequences and series',
      'Sigma notation',
      'Sum to infinity of a convergent geometric series',
    ],
  },
  {
    slug: 'functions-gr12',
    title: 'Functions & Graphs',
    grade: 12,
    paper: 1,
    subTopics: [
      'Domain and range',
      'The formal definition of an inverse function',
      'Restricting the domain of a quadratic to invert it (y = √x)',
    ],
  },
  {
    slug: 'calculus-gr12',
    title: 'Calculus',
    grade: 12,
    paper: 1,
    subTopics: [
      'The definition of a limit',
      'Differentiation from first principles',
      'The rules of differentiation',
      'Sketching cubic graphs',
      'Optimisation problems',
      'Rates of change',
    ],
  },
  {
    slug: 'finance-gr12',
    title: 'Finance & Growth',
    grade: 12,
    paper: 1,
    subTopics: [
      'Future value annuity formula',
      'Present value annuity formula',
      'Loan repayments and outstanding balances',
    ],
  },
  {
    slug: 'probability-gr12',
    title: 'Probability',
    grade: 12,
    paper: 1,
    subTopics: [
      'The fundamental counting principle',
      'Permutations and factorial notation',
      'Applying counting principles to probability',
    ],
  },
  {
    slug: 'trig-gr12',
    title: 'Trigonometry',
    grade: 12,
    paper: 2,
    subTopics: [
      'Compound angle identities',
      'Double angle identities',
      'Expansion and simplification of trig expressions',
      'Trigonometry in three-dimensional problems',
    ],
  },
  {
    slug: 'euclidean-geometry-gr12',
    title: 'Euclidean Geometry',
    grade: 12,
    paper: 2,
    subTopics: [
      'Proportionality in triangles',
      'Similarity of triangles',
      'The Theorem of Pythagoras proved via similarity',
    ],
  },
  {
    slug: 'analytical-geometry-gr12',
    title: 'Analytical Geometry',
    grade: 12,
    paper: 2,
    subTopics: [
      'The equation of a circle centred at the origin',
      'The equation of a circle centred at any point',
      'Tangents to circles analytically',
      'Intersecting circles',
    ],
  },
  {
    slug: 'statistics-gr12',
    title: 'Statistics',
    grade: 12,
    paper: 2,
    subTopics: [
      'Bivariate data',
      'Scatter plots and lines of best fit',
      'The least-squares regression line y = A + Bx',
      'The correlation coefficient r',
    ],
  },
]

/** Every sub-topic across all grades - the unit of video curation. */
export function allSubTopics(): { topic: CapsTopic; subTopic: string }[] {
  return capsCurriculum.flatMap((topic) =>
    topic.subTopics.map((subTopic) => ({ topic, subTopic }))
  )
}

export function topicsForGrade(grade: CapsGrade): CapsTopic[] {
  return capsCurriculum.filter((topic) => topic.grade === grade)
}
