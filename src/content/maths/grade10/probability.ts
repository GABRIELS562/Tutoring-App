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
          title: 'Full Notes Coming Soon',
          body: `Full notes for this topic are coming soon. In the meantime, watch the Mindset Learn video below.

This topic covers:
• **Theoretical Probability** - $P(A) = \\frac{\\text{favourable outcomes}}{\\text{total outcomes}}$
• **Relative Frequency** - Experimental probability
• **Venn Diagrams** - Representing events visually
• **Mutually Exclusive Events** - Events that cannot occur together
• **Complementary Events** - $P(A') = 1 - P(A)$
• **The Addition Rule** - $P(A \\text{ or } B) = P(A) + P(B) - P(A \\text{ and } B)$`
        },
        {
          type: 'video',
          title: 'Watch: Probability — Mindset Learn',
          videoId: 'MINDSET_PROBABILITY_GR10'
        }
      ]
    }
  ]
}

export default probabilityGr10
