import type { TopicContent } from '@/types'

export const sequencesSeriesGr12: TopicContent = {
  id: 'sequences-series-gr12',
  slug: 'sequences-series-gr12',
  subject: 'maths',
  grade: 12,
  paper: 1,
  title: 'Sequences and Series',
  capsWeight: 25,
  // Curated per CAPS sub-topic — see docs/curriculum/ and scripts/curate-videos.ts
  // Curated per CAPS sub-topic — see docs/curriculum/ and scripts/curate-videos.ts
  sections: [
    {
      id: 'overview',
      title: 'Patterns & Series',
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
        }
      ]
    },
    {
      id: 'arithmetic-sequences-and-series',
      title: 'Arithmetic sequences and series',
      blocks: [
        {
          type: 'video',
          title: 'Watch: 1) Gr 12 Arithmetic Sequence | Intro — Kevinmathscience',
          videoId: 'B8dKyX9g7Fk',
          videoIdAf: 'wVnS9l_uFSQ'
        }
      ]
    },
    {
      id: 'geometric-sequences-and-series',
      title: 'Geometric sequences and series',
      blocks: [
        {
          type: 'video',
          title: 'Watch: 4)Gr 12 Geometric Sequence | Intro — Kevinmathscience',
          videoId: 'ZSxq7Ay48NQ',
          videoIdAf: 'dDQnZTK8GIw'
        }
      ]
    },
    {
      id: 'sigma-notation',
      title: 'Sigma notation',
      blocks: [
        {
          type: 'video',
          title: 'Watch: 15) Represent sigma notation | Intro — Kevinmathscience',
          videoId: '4Pp6EMaMMXo',
          videoIdAf: 'SFeAvpRuTh8'
        }
      ]
    },
    {
      id: 'sum-to-infinity-of-a-convergent-geometric-series',
      title: 'Sum to infinity of a convergent geometric series',
      blocks: [
        {
          type: 'tip',
          body: `We haven't found a CAPS video for this sub-topic yet. Ask Angelo if you're stuck on it.`
        }
      ]
    }
  ]
}

export default sequencesSeriesGr12
