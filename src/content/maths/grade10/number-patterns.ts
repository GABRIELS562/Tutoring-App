import type { TopicContent } from '@/types'

export const numberPatternsGr10: TopicContent = {
  id: 'number-patterns-gr10',
  slug: 'number-patterns-gr10',
  subject: 'maths',
  grade: 10,
  paper: 1,
  title: 'Number Patterns',
  capsWeight: 10,
  // Curated per CAPS sub-topic — see docs/curriculum/ and scripts/curate-videos.ts
  // Curated per CAPS sub-topic — see docs/curriculum/ and scripts/curate-videos.ts
  sections: [
    {
      id: 'overview',
      title: 'Number Patterns',
      blocks: [
        {
          type: 'theory',
          title: 'What this topic covers',
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
      blocks: [
        {
          type: 'video',
          title: 'Watch: 2) Solve X Arithmetic Sequence | Intro — Kevinmathscience',
          videoId: 'tH6Jsh20gUA'
        }
      ]
    },
    {
      id: 'finding-the-general-formula-n-th-term-of-a-linea',
      title: 'Finding the general formula (n-th term) of a linear sequence',
      blocks: [
        // Labelled for an adjacent grade; CAPS covers this sub-topic in both.
        {
          type: 'video',
          title: 'Watch: 1) Gr 12 Arithmetic Sequence | Intro — Kevinmathscience',
          videoId: 'B8dKyX9g7Fk'
        }
      ]
    }
  ]
}

export default numberPatternsGr10
