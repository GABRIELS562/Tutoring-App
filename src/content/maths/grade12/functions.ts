import type { TopicContent } from '@/types'

// Scaffolded from the CAPS handbook (src/content/caps-curriculum.ts).
// One section per sub-topic; videos are filled by
// scripts/apply-curated-videos.ts.
export const functionsGr12: TopicContent = {
  id: 'functions-gr12',
  slug: 'functions-gr12',
  subject: 'maths',
  grade: 12,
  paper: 1,
  title: 'Functions & Graphs',
  capsWeight: 0,
  // Curated per CAPS sub-topic — see docs/curriculum/ and scripts/curate-videos.ts
  // Curated per CAPS sub-topic — see docs/curriculum/ and scripts/curate-videos.ts
  // Curated per CAPS sub-topic — see docs/curriculum/ and scripts/curate-videos.ts
  sections: [
    {
      id: 'overview',
      title: 'Functions & Graphs',
      blocks: [
        {
          type: 'theory',
          title: 'What this topic covers',
          body: `• Domain and range
• The formal definition of an inverse function
• Restricting the domain of a quadratic to invert it (y = √x)`
        }
      ]
    },
    {
      id: 'domain-and-range',
      title: 'Domain and range',
      blocks: [
        {
          type: 'video',
          title: 'Watch: Parabola Domain Range Axis Symmetry Grade | 11 Functions — Kevinmathscience',
          videoId: 'AEebC8oLN2M',
          videoIdAf: 'XugNFEZzBd4'
        }
      ]
    },
    {
      id: 'the-formal-definition-of-an-inverse-function',
      title: 'The formal definition of an inverse function',
      blocks: [
        {
          type: 'video',
          title: 'Watch: Grade 12 Algebra Lesson 1.5| Functions : Inverse functions — Mlungisi Nkosi Maths & Science',
          videoId: '0hIPK2-d2oM',
          videoIdAf: 'Q0vjmaDK8X0'
        }
      ]
    },
    {
      id: 'restricting-the-domain-of-a-quadratic-to-invert-',
      title: 'Restricting the domain of a quadratic to invert it (y = √x)',
      blocks: [
        {
          type: 'video',
          title: 'Watch: 3) Inverse of parabola | Part 1 — Kevinmathscience',
          videoId: '1b2BsuPmCfQ',
          videoIdAf: 's8AkM-QJJ0U'
        }
      ]
    }
  ]
}

export default functionsGr12
