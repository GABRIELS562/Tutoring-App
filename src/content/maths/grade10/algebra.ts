import type { TopicContent } from '@/types'

export const algebraGr10: TopicContent = {
  id: 'algebra-gr10',
  slug: 'algebra-gr10',
  subject: 'maths',
  grade: 10,
  paper: 1,
  title: 'Algebraic Expressions',
  capsWeight: 20,
  sections: [
    {
      id: 'coming-soon',
      title: 'Algebraic Expressions',
      blocks: [
        {
          type: 'theory',
          title: 'Full Notes Coming Soon',
          body: `Full notes for this topic are coming soon. In the meantime, watch the Mindset Learn video below.

This topic covers:
• **Number Systems** - Rational, irrational, real numbers
• **Exponent Laws** - Multiplying, dividing, power of a power
• **Simplifying Expressions** - Like terms, distribution
• **Factorisation** - Common factors, grouping, trinomials, difference of squares
• **Algebraic Fractions** - Simplifying, adding, subtracting, multiplying, dividing
• **Surds** - Simplifying, rationalising denominators`
        },
        // PROVISIONAL video picks — auto-filled 2026-09-18 from docs/client-updates/video-candidates; client to confirm.
        {
          type: 'video',
          title: 'Watch: 8a) Factorising trinomials grade 10 | Try — Kevinmathscience',
          videoId: 'EnVbvflrJ4Q',
          videoIdAf: '68tBHlCty1M',
          titleAf: 'Watch: Graad 10 Algebraïese Uitdrukkings #1: Die Getallestelsel — WiskundeMetMargie'
        },
        {
          type: 'video',
          title: 'Watch: Grade 10 Maths ALGEBRA Exam Questions Practice — Miss Martins Maths and Science',
          videoId: '52-eRCXTPX0'
        }
      ]
    }
  ]
}

export default algebraGr10
