import type { TopicContent } from '@/types'

export const algebraGr10: TopicContent = {
  id: 'algebra-gr10',
  slug: 'algebra-gr10',
  subject: 'maths',
  grade: 10,
  paper: 1,
  title: 'Algebraic Expressions',
  capsWeight: 20,
  // Curated per CAPS sub-topic — see docs/curriculum/ and scripts/curate-videos.ts
  // Curated per CAPS sub-topic — see docs/curriculum/ and scripts/curate-videos.ts
  sections: [
    {
      id: 'overview',
      title: 'Algebra & Equations',
      blocks: [
        {
          type: 'theory',
          title: 'What this topic covers',
          body: `• **Number Systems** - Rational, irrational, real numbers
• **Exponent Laws** - Multiplying, dividing, power of a power
• **Simplifying Expressions** - Like terms, distribution
• **Factorisation** - Common factors, grouping, trinomials, difference of squares
• **Algebraic Fractions** - Simplifying, adding, subtracting, multiplying, dividing
• **Surds** - Simplifying, rationalising denominators`
        }
      ]
    },
    {
      id: 'exponents-and-the-exponent-laws',
      title: 'Exponents and the exponent laws',
      blocks: [
        {
          type: 'video',
          title: 'Watch: Grade 11 Exponents | Grade 10 Exponent law and basic examples REVISION — Miss Martins Maths and Science',
          videoId: 'EL1z_5pWAbk'
        }
      ]
    },
    {
      id: 'factorisation-trinomials',
      title: 'Factorisation: trinomials',
      blocks: [
        {
          type: 'video',
          title: 'Watch: 8) Factorising trinomials grade 10 | Part 2 — Kevinmathscience',
          videoId: 'Py1WZEpdcRg'
        }
      ]
    },
    {
      id: 'factorisation-sum-and-difference-of-cubes',
      title: 'Factorisation: sum and difference of cubes',
      blocks: [
        {
          type: 'video',
          title: 'Watch: 10) Difference of Cubes Grade 10 — Kevinmathscience',
          videoId: 'Dqjk_9taDoI'
        }
      ]
    },
    {
      id: 'solving-linear-equations',
      title: 'Solving linear equations',
      blocks: [
        {
          type: 'video',
          title: 'Watch: Equations Grade 10: Linear Equation without fraction — Kevinmathscience',
          videoId: 'LHAq_5VmxRU'
        }
      ]
    },
    {
      id: 'solving-quadratic-equations',
      title: 'Solving quadratic equations',
      blocks: [
        {
          type: 'video',
          title: 'Watch: Quadratic Equations Grade 10 — Kevinmathscience',
          videoId: 'z-aP8HQA-dk'
        }
      ]
    },
    {
      id: 'solving-simultaneous-equations',
      title: 'Solving simultaneous equations',
      blocks: [
        {
          type: 'video',
          title: 'Watch: Simultaneous Equations grade 10 | Introduction to Elimination and Substitution — Kevinmathscience',
          videoId: 'o5JosuKTUyA'
        }
      ]
    },
    {
      id: 'linear-inequalities',
      title: 'Linear inequalities',
      blocks: [
        {
          type: 'video',
          title: 'Watch: Grade 10 Inequalities — Kevinmathscience',
          videoId: 'OFX7zmbEmro'
        }
      ]
    }
  ]
}

export default algebraGr10
