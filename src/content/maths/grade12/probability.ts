import type { TopicContent } from '@/types'

export const probabilityGr12: TopicContent = {
  id: 'probability-gr12',
  slug: 'probability-gr12',
  subject: 'maths',
  grade: 12,
  paper: 1,
  title: 'Probability',
  titleAf: 'Waarskynlikheid',
  capsWeight: 15,
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
      titleAf: 'Die fundamentele telbeginsel',
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
      titleAf: 'Permutasies en faktoriaalnotasie',
      blocks: [
        {
          type: 'content_gap',
          body: `No CAPS video has been sourced for this sub-topic yet. Ask Angelo if you're stuck on it in the meantime.`,
          bodyAf: `Daar is nog nie 'n KABV-video vir hierdie onderafdeling nie. Vra solank vir Angelo as jy vashaak.`
        }
      ]
    },
    {
      id: 'applying-counting-principles-to-probability',
      title: 'Applying counting principles to probability',
      titleAf: 'Toepassing van telbeginsels op waarskynlikheid',
      blocks: [
        {
          type: 'video',
          title: 'Watch: Mlungisi Nkosi | Fundamental Counting Principle | Part 3 | Application | Passwords and Committees — Mlungisi Nkosi Maths & Science',
          videoId: 'xcln78w1nrE',
          videoIdAf: 'yvoiVCv8vdA',
          titleAf: 'Kyk: W12.1 Waarskynlikheid tel beginsel — Stefan Buys'
        }
      ]
    }
  ]
}

export default probabilityGr12
