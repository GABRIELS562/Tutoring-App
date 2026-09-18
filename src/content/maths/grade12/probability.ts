import type { TopicContent } from '@/types'

export const probabilityGr12: TopicContent = {
  id: 'probability-gr12',
  slug: 'probability-gr12',
  subject: 'maths',
  grade: 12,
  paper: 1,
  title: 'Probability',
  capsWeight: 15,
  sections: [
    {
      id: 'coming-soon',
      title: 'Coming Soon',
      blocks: [
        {
          type: 'theory',
          title: 'Content Under Development',
          body: `This topic is currently being developed. Check back soon for comprehensive content on:

• **Fundamental Counting Principle** - Multiplication and addition rules
• **Factorials** - Understanding $n!$ and its applications
• **Permutations** - Arrangements where order matters
• **Combinations** - Selections where order doesn't matter
• **Probability Rules** - Addition and multiplication rules
• **Mutually Exclusive Events** - Events that cannot occur together
• **Independent Events** - Events that don't affect each other
• **Dependent Events and Conditional Probability** - $P(A|B)$
• **Tree Diagrams and Venn Diagrams** - Visual probability tools
• **The Counting Principle in Probability** - Combining concepts

In the meantime, practice with past papers available in the Papers section.`
        },
        {
          type: 'tip',
          body: `Remember: Permutations = "Position matters" (arrangements), Combinations = "Collection only" (selections). Use $^nP_r$ for arrangements and $^nC_r$ for selections.`
        },
        // PROVISIONAL video picks — auto-filled 2026-09-18 from docs/client-updates/video-candidates; client to confirm.
        {
          type: 'video',
          title: 'Watch: Probability Maths Lit Part 1 — Kevinmathscience',
          videoId: 'kMJVyxYiato',
          videoIdAf: '5HNopMSeyLg',
          titleAf: 'Watch: Waarskynlikheid Graad12: L1 Fundamentele Telbeginsel Wiskunde — Online Maths by Miss Pythagoras'
        },
        {
          type: 'video',
          title: 'Watch: Gr 12 probability # 1 — Kevinmathscience',
          videoId: 'loYKqFQcksY'
        }
      ]
    }
  ]
}

export default probabilityGr12
