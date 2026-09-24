import type { TopicContent } from '@/types'

export const numberPatternsGr10: TopicContent = {
  id: 'number-patterns-gr10',
  slug: 'number-patterns-gr10',
  subject: 'maths',
  grade: 10,
  paper: 1,
  title: 'Number Patterns',
  titleAf: 'Getalpatrone',
  capsWeight: 10,
  // Curated per CAPS sub-topic — see docs/curriculum/ and scripts/curate-videos.ts
  sections: [
    {
      id: 'overview',
      title: 'Number Patterns',
      titleAf: 'Getalpatrone',
      blocks: [
        {
          type: 'theory',
          title: 'What this topic covers',
          titleAf: 'Wat hierdie onderwerp dek',
          body: `• **Linear Patterns** - Constant first difference
• **Quadratic Patterns** - Constant second difference
• **General Term** - Finding the $n$th term ($T_n$)
• **Linear Sequences** - $T_n = an + b$
• **Quadratic Sequences** - $T_n = an^2 + bn + c$
• **Pattern Recognition** - Identifying types of sequences`
        }
      ]
    },
    {
      id: 'investigating-and-extending-linear-arithmetic-se',
      title: 'Investigating and extending linear (arithmetic) sequences',
      titleAf: 'Ondersoek en uitbreiding van lineêre (rekenkundige) rye',
      blocks: [
        {
          type: 'video',
          title: 'Watch: 2) Solve X Arithmetic Sequence | Intro — Kevinmathscience',
          videoId: 'tH6Jsh20gUA',
          videoIdAf: 'DUj1JgzOLus'
        }
      ]
    },
    {
      id: 'finding-the-general-formula-n-th-term-of-a-linea',
      title: 'Finding the general formula (n-th term) of a linear sequence',
      titleAf: 'Bepaling van die algemene formule (n-de term) van ’n lineêre ry',
      blocks: [
        {
          type: 'video',
          title: 'Watch: 10) Use Sn to find Term | Intro — Kevinmathscience',
          videoId: 'q931Ceby54s'
        }
      ]
    }
  ]
}

export default numberPatternsGr10
