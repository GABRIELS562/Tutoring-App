import type { TopicContent } from '@/types'

// Scaffolded from the CAPS handbook (src/content/caps-curriculum.ts).
// One section per sub-topic; videos are filled by
// scripts/apply-curated-videos.ts.
export const numberPatternsGr11: TopicContent = {
  id: 'number-patterns-gr11',
  slug: 'number-patterns-gr11',
  subject: 'maths',
  grade: 11,
  paper: 1,
  title: 'Number Patterns',
  titleAf: 'Getalpatrone',
  capsWeight: 0,
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
          body: `• Quadratic number patterns and the second constant difference
• The general term Tn = an² + bn + c`
        }
      ]
    },
    {
      id: 'quadratic-number-patterns-and-the-second-constan',
      title: 'Quadratic number patterns and the second constant difference',
      titleAf: 'Kwadratiese getalpatrone en die tweede konstante verskil',
      blocks: [
        {
          type: 'video',
          title: 'Watch: Quadratic number patterns grade 11: introduction and examples — Kevinmathscience',
          videoId: 'Ws_tyxB-Xyo'
        }
      ]
    },
    {
      id: 'the-general-term-tn-an-bn-c',
      title: 'The general term Tn = an² + bn + c',
      titleAf: 'Die algemene term Tn = an² + bn + c',
      blocks: [
        {
          type: 'tip',
          body: `We haven't found a CAPS video for this sub-topic yet. Ask Angelo if you're stuck on it.`,
          bodyAf: `Ons het nog nie 'n KABV-video vir hierdie onderafdeling gekry nie. Vra vir Angelo as jy vashaak.`
        }
      ]
    }
  ]
}

export default numberPatternsGr11
