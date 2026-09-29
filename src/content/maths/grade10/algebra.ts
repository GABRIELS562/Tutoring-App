import type { TopicContent } from '@/types'

export const algebraGr10: TopicContent = {
  id: 'algebra-gr10',
  slug: 'algebra-gr10',
  subject: 'maths',
  grade: 10,
  paper: 1,
  title: 'Algebra & Equations',
  titleAf: 'Algebra en Vergelykings',
  capsWeight: 20,
  // Curated per CAPS sub-topic — see docs/curriculum/ and scripts/curate-videos.ts
  sections: [
    {
      id: 'overview',
      title: 'Algebra & Equations',
      titleAf: 'Algebra en Vergelykings',
      blocks: [
        {
          type: 'theory',
          title: 'What this topic covers',
          titleAf: 'Wat hierdie onderwerp dek',
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
      titleAf: 'Eksponente en die eksponentwette',
      blocks: [
        {
          type: 'video',
          title: 'Watch: Grade 11 Exponents | Grade 10 Exponent law and basic examples REVISION — Miss Martins Maths and Science',
          videoId: 'EL1z_5pWAbk',
          videoIdAf: '2gasdlPK940',
          titleAf: 'Kyk: Graad 10 Algebra Eksponent Wette — VAW-Vereniging vir Afrikaanse Wiskunde-onderwysers'
        }
      ]
    },
    {
      id: 'factorisation-trinomials',
      title: 'Factorisation: trinomials',
      titleAf: 'Faktorisering: drieterme',
      blocks: [
        {
          type: 'video',
          title: 'Watch: 8) Factorising trinomials grade 10 | Part 2 — Kevinmathscience',
          videoId: 'Py1WZEpdcRg',
          videoIdAf: 'AJf7yfKFDIw',
          titleAf: 'Kyk: Faktorisering: Kwadratiese Drieterm — Wiskunde Broers'
        }
      ]
    },
    {
      id: 'factorisation-sum-and-difference-of-cubes',
      title: 'Factorisation: sum and difference of cubes',
      titleAf: 'Faktorisering: som en verskil van derdemagte',
      blocks: [
        {
          type: 'video',
          title: 'Watch: 10) Difference of Cubes Grade 10 — Kevinmathscience',
          videoId: 'Dqjk_9taDoI',
          videoIdAf: 'tBSJm_TTXCo',
          titleAf: 'Kyk: Graad 10 Faktoriseer die som en verskil van twee derdemagte(wiskvaw) (wiskdo) — VAW-Vereniging vir Afrikaanse Wiskunde-onderwysers'
        }
      ]
    },
    {
      id: 'solving-linear-equations',
      title: 'Solving linear equations',
      titleAf: 'Oplos van lineêre vergelykings',
      blocks: [
        {
          type: 'video',
          title: 'Watch: Equations Grade 10: Linear Equation without fraction — Kevinmathscience',
          videoId: 'LHAq_5VmxRU',
          videoIdAf: 'LZQnMy9ztfk',
          titleAf: 'Kyk: 01 Lineêre vergelykings — Wiskunde_Mathematics_SUM'
        }
      ]
    },
    {
      id: 'solving-quadratic-equations',
      title: 'Solving quadratic equations',
      titleAf: 'Oplos van kwadratiese vergelykings',
      blocks: [
        {
          type: 'video',
          title: 'Watch: Quadratic Equations Grade 10 — Kevinmathscience',
          videoId: 'z-aP8HQA-dk',
          videoIdAf: 'b4Z_V04fjVs',
          titleAf: 'Kyk: 03 Nog kwadratiese vergelykings — Wiskunde_Mathematics_SUM'
        }
      ]
    },
    {
      id: 'solving-simultaneous-equations',
      title: 'Solving simultaneous equations',
      titleAf: 'Oplos van gelyktydige vergelykings',
      blocks: [
        {
          type: 'video',
          title: 'Watch: Simultaneous Equations grade 10 | Introduction to Elimination and Substitution — Kevinmathscience',
          videoId: 'o5JosuKTUyA',
          videoIdAf: 'zRS-ZFpvzR8',
          titleAf: 'Kyk: 07 Gelyktydige vergelykings — Wiskunde_Mathematics_SUM'
        }
      ]
    },
    {
      id: 'linear-inequalities',
      title: 'Linear inequalities',
      titleAf: 'Lineêre ongelykhede',
      blocks: [
        {
          type: 'video',
          title: 'Watch: Grade 10 Inequalities — Kevinmathscience',
          videoId: 'OFX7zmbEmro',
          videoIdAf: 'A3sUu-gFfAw',
          titleAf: 'Kyk: 08 Lineêre ongelykhede — Wiskunde_Mathematics_SUM'
        }
      ]
    }
  ]
}

export default algebraGr10
