import type { TopicContent } from '@/types'

export const probabilityGr10: TopicContent = {
  id: 'probability-gr10',
  slug: 'probability-gr10',
  subject: 'maths',
  grade: 10,
  paper: 1,
  title: 'Probability',
  capsWeight: 10,
  sections: [
    {
      id: 'coming-soon',
      title: 'Probability',
      blocks: [
        {
          type: 'theory',
          title: 'What this topic covers',
          body: `• **Theoretical Probability** - $P(A) = \\frac{\\text{favourable outcomes}}{\\text{total outcomes}}$
• **Relative Frequency** - Experimental probability
• **Venn Diagrams** - Representing events visually
• **Mutually Exclusive Events** - Events that cannot occur together
• **Complementary Events** - $P(A') = 1 - P(A)$
• **The Addition Rule** - $P(A \\text{ or } B) = P(A) + P(B) - P(A \\text{ and } B)$`
        },
        // PROVISIONAL video picks — auto-filled 2026-09-18 from docs/client-updates/video-candidates; client to confirm.
        {
          type: 'video',
          title: 'Watch: Probability Grade 10 | Introduction — Kevinmathscience',
          videoId: 'Hqbbyh5OEtc',
          videoIdAf: 'ZRZQV5YLuPc',
          titleAf: 'Watch: Graad 10 Waarskynlikheid — YCDM - YouCanDoMaths'
        },
        {
          type: 'video',
          title: 'Watch: Probability Grade 10 | Exam Question — Kevinmathscience',
          videoId: 'iBoBTRrp-w8'
        }
        // TODO(curator): add { type: 'formula', formulas: [...] } block
      ]
    }
  ]
}

export default probabilityGr10
