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
        }
      ]
    }
  ]
}

export default probabilityGr12
