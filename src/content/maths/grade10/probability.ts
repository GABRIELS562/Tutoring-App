import type { TopicContent } from '@/types'

export const probabilityGr10: TopicContent = {
  id: 'probability-gr10',
  slug: 'probability-gr10',
  subject: 'maths',
  grade: 10,
  paper: 1,
  title: 'Probability',
  capsWeight: 10,
  // Curated per CAPS sub-topic — see docs/curriculum/ and scripts/curate-videos.ts
  // Curated per CAPS sub-topic — see docs/curriculum/ and scripts/curate-videos.ts
  // Curated per CAPS sub-topic — see docs/curriculum/ and scripts/curate-videos.ts
  // Curated per CAPS sub-topic — see docs/curriculum/ and scripts/curate-videos.ts
  // Curated per CAPS sub-topic — see docs/curriculum/ and scripts/curate-videos.ts
  // Curated per CAPS sub-topic — see docs/curriculum/ and scripts/curate-videos.ts
  sections: [
    {
      id: 'overview',
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
        }
      ]
    },
    {
      id: 'venn-diagrams',
      title: 'Venn diagrams',
      blocks: [
        {
          type: 'video',
          title: 'Watch: Probability Grade 10 | Venn Diagram — Kevinmathscience',
          videoId: 'MCsC1N333jo',
          videoIdAf: 'wRnin4mx_WE'
        }
      ]
    },
    {
      id: 'theoretical-and-relative-frequency-probability',
      title: 'Theoretical and relative frequency probability',
      blocks: [
        {
          type: 'tip',
          body: `We haven't found a CAPS video for this sub-topic yet. Ask Angelo if you're stuck on it.`,
          bodyAf: `Ons het nog nie 'n KABV-video vir hierdie onderafdeling gekry nie. Vra vir Angelo as jy vashaak.`
        }
      ]
    },
    {
      id: 'the-addition-rule-identity-rule',
      title: 'The addition rule (identity rule)',
      blocks: [
        {
          type: 'tip',
          body: `We haven't found a CAPS video for this sub-topic yet. Ask Angelo if you're stuck on it.`,
          bodyAf: `Ons het nog nie 'n KABV-video vir hierdie onderafdeling gekry nie. Vra vir Angelo as jy vashaak.`
        }
      ]
    }
  ]
}

export default probabilityGr10
