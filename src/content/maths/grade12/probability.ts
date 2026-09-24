import type { TopicContent } from '@/types'

export const probabilityGr12: TopicContent = {
  id: 'probability-gr12',
  slug: 'probability-gr12',
  subject: 'maths',
  grade: 12,
  paper: 1,
  title: 'Probability',
  capsWeight: 15,
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
          body: `• **Fundamental Counting Principle** - Multiplication and addition rules
• **Factorials** - Understanding $n!$ and its applications
• **Permutations** - Arrangements where order matters
• **Combinations** - Selections where order doesn't matter
• **Probability Rules** - Addition and multiplication rules
• **Mutually Exclusive Events** - Events that cannot occur together
• **Independent Events** - Events that don't affect each other
• **Dependent Events and Conditional Probability** - $P(A|B)$
• **Tree Diagrams and Venn Diagrams** - Visual probability tools
• **The Counting Principle in Probability** - Combining concepts`
        }
      ]
    },
    {
      id: 'the-fundamental-counting-principle',
      title: 'The fundamental counting principle',
      blocks: [
        {
          type: 'video',
          title: 'Watch: Mlungisi Nkosi | Fundamental Counting Principles | Part 1 | Independent Events — Mlungisi Nkosi Maths & Science',
          videoId: 'FE4NQuZ0Nww'
        }
      ]
    },
    {
      id: 'permutations-and-factorial-notation',
      title: 'Permutations and factorial notation',
      blocks: [
        {
          type: 'tip',
          body: `We haven't found a CAPS video for this sub-topic yet. Ask Angelo if you're stuck on it.`
        }
      ]
    },
    {
      id: 'applying-counting-principles-to-probability',
      title: 'Applying counting principles to probability',
      blocks: [
        {
          type: 'video',
          title: 'Watch: Mlungisi Nkosi | Fundamental Counting Principle | Part 3 | Application | Passwords and Committees — Mlungisi Nkosi Maths & Science',
          videoId: 'xcln78w1nrE',
          videoIdAf: 'yvoiVCv8vdA'
        }
      ]
    }
  ]
}

export default probabilityGr12
