import type { TopicContent } from '@/types'

export const sequencesSeriesGr12: TopicContent = {
  id: 'sequences-series-gr12',
  slug: 'sequences-series-gr12',
  subject: 'maths',
  grade: 12,
  paper: 1,
  title: 'Patterns & Series',
  titleAf: 'Rye en Reekse',
  capsWeight: 25,
  // Curated per CAPS sub-topic — see docs/curriculum/ and scripts/curate-videos.ts
  sections: [
    {
      id: 'overview',
      title: 'Patterns & Series',
      titleAf: 'Rye en Reekse',
      blocks: [
        {
          type: 'theory',
          title: 'What this topic covers',
          titleAf: 'Wat hierdie onderwerp dek',
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
      titleAf: 'Rekenkundige rye en reekse',
      blocks: [
        {
          type: 'video',
          title: 'Watch: 1) Gr 12 Arithmetic Sequence | Intro — Kevinmathscience',
          videoId: 'B8dKyX9g7Fk',
          videoIdAf: 'wVnS9l_uFSQ',
          titleAf: 'Kyk: 02 Rekenkundige rye Gr.12 — Wiskunde_Mathematics_SUM'
        }
      ]
    },
    {
      id: 'geometric-sequences-and-series',
      title: 'Geometric sequences and series',
      titleAf: 'Meetkundige rye en reekse',
      blocks: [
        {
          type: 'video',
          title: 'Watch: 4)Gr 12 Geometric Sequence | Intro — Kevinmathscience',
          videoId: 'ZSxq7Ay48NQ',
          videoIdAf: 'dDQnZTK8GIw',
          titleAf: 'Kyk: Rye en Reekse Graad12: L3 Meetkundige Rye — Online Maths by Miss Pythagoras'
        }
      ]
    },
    {
      id: 'sigma-notation',
      title: 'Sigma notation',
      titleAf: 'Sigma-notasie',
      blocks: [
        {
          type: 'video',
          title: 'Watch: 15) Represent sigma notation | Intro — Kevinmathscience',
          videoId: '4Pp6EMaMMXo',
          videoIdAf: 'SFeAvpRuTh8',
          titleAf: 'Kyk: 08 Sigma notasie — Wiskunde_Mathematics_SUM'
        }
      ]
    },
    {
      id: 'sum-to-infinity-of-a-convergent-geometric-series',
      title: 'Sum to infinity of a convergent geometric series',
      titleAf: 'Som tot oneindig van ’n konvergente meetkundige reeks',
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

export default sequencesSeriesGr12
