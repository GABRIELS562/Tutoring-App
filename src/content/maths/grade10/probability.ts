import type { TopicContent } from '@/types'

export const probabilityGr10: TopicContent = {
  id: 'probability-gr10',
  slug: 'probability-gr10',
  subject: 'maths',
  grade: 10,
  paper: 1,
  title: 'Probability',
  titleAf: 'Waarskynlikheid',
  capsWeight: 10,
  // Curated per CAPS sub-topic — see docs/curriculum/ and scripts/curate-videos.ts
  sections: [
    {
      id: 'overview',
      title: 'Probability',
      titleAf: 'Waarskynlikheid',
      blocks: [
        {
          type: 'theory',
          title: 'What this topic covers',
          titleAf: 'Wat hierdie onderwerp dek',
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
      titleAf: 'Venn-diagramme',
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
      titleAf: 'Teoretiese en relatiewe frekwensiewaarskynlikheid',
      blocks: [
        {
          type: 'content_gap',
          body: `No CAPS video has been sourced for this sub-topic yet. Ask Angelo if you're stuck on it in the meantime.`,
          bodyAf: `Daar is nog nie 'n KABV-video vir hierdie onderafdeling nie. Vra solank vir Angelo as jy vashaak.`
        }
      ]
    },
    {
      id: 'the-addition-rule-identity-rule',
      title: 'The addition rule (identity rule)',
      titleAf: 'Die optelreël (identiteitsreël)',
      blocks: [
        {
          type: 'content_gap',
          body: `No CAPS video has been sourced for this sub-topic yet. Ask Angelo if you're stuck on it in the meantime.`,
          bodyAf: `Daar is nog nie 'n KABV-video vir hierdie onderafdeling nie. Vra solank vir Angelo as jy vashaak.`
        }
      ]
    }
  ]
}

export default probabilityGr10
