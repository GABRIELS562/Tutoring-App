import type { TopicContent } from '@/types'

export const sequencesSeriesGr12: TopicContent = {
  id: 'sequences-series-gr12',
  slug: 'sequences-series-gr12',
  subject: 'maths',
  grade: 12,
  paper: 1,
  title: 'Sequences and Series',
  capsWeight: 25,
  sections: [
    {
      id: 'coming-soon',
      title: 'Coming Soon',
      blocks: [
        {
          type: 'theory',
          title: 'What this topic covers',
          body: `• **Arithmetic Sequences** - Finding terms and the common difference
• **Arithmetic Series** - Sum of arithmetic sequences
• **Geometric Sequences** - Finding terms and the common ratio
• **Geometric Series** - Sum of geometric sequences (finite and infinite)
• **Sigma Notation** - Understanding and using summation notation
• **Convergence** - When infinite series have a finite sum
• **Mixed Problems** - Combining arithmetic and geometric concepts
• **Real-World Applications** - Finance, growth, and decay problems`
        },
        {
          type: 'tip',
          body: `Always identify whether a sequence is arithmetic (constant difference) or geometric (constant ratio) first. This determines which formulas to use.`
        },
        // PROVISIONAL video picks — auto-filled 2026-09-18 from docs/client-updates/video-candidates; client to confirm.
        {
          type: 'video',
          title: 'Watch: Exam Question Series Sequences — Kevinmathscience',
          videoId: 'DIOaZtU7XlA',
          videoIdAf: 'Pu2B6FY7YkA',
          titleAf: 'Watch: Graad 12, Vraestel 1, Vraag 2, Rye en Reekse Video 1: Teorie — Wizzkunde'
        },
        {
          type: 'video',
          title: 'Watch: Grade 12 Mathematics | Sequence and Series | Past Exam Questions | May/June 2021_Question 2 — Mlungisi Nkosi Maths & Science',
          videoId: 'nBFLxEZko8o'
        }
        // TODO(curator): add { type: 'formula', formulas: [...] } block
      ]
    }
  ]
}

export default sequencesSeriesGr12
