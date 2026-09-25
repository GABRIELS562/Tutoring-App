import type { TopicContent } from '@/types'

// Scaffolded from the CAPS handbook (src/content/caps-curriculum.ts).
// One section per sub-topic; videos are filled by
// scripts/apply-curated-videos.ts.
export const trigGr12: TopicContent = {
  id: 'trig-gr12',
  slug: 'trig-gr12',
  subject: 'maths',
  grade: 12,
  paper: 2,
  title: 'Trigonometry',
  titleAf: 'Trigonometrie',
  capsWeight: 0,
  // Curated per CAPS sub-topic — see docs/curriculum/ and scripts/curate-videos.ts
  sections: [
    {
      id: 'overview',
      title: 'Trigonometry',
      titleAf: 'Trigonometrie',
      blocks: [
        {
          type: 'theory',
          title: 'What this topic covers',
          titleAf: 'Wat hierdie onderwerp dek',
          body: `• Compound angle identities
• Double angle identities
• Expansion and simplification of trig expressions
• Trigonometry in three-dimensional problems`
        }
      ]
    },
    {
      id: 'compound-angle-identities',
      title: 'Compound angle identities',
      titleAf: 'Saamgestelde hoek-identiteite',
      blocks: [
        {
          type: 'content_gap',
          body: `No CAPS video has been sourced for this sub-topic yet. Ask Angelo if you're stuck on it in the meantime.`,
          bodyAf: `Daar is nog nie 'n KABV-video vir hierdie onderafdeling nie. Vra solank vir Angelo as jy vashaak.`
        }
      ]
    },
    {
      id: 'double-angle-identities',
      title: 'Double angle identities',
      titleAf: 'Dubbelhoek-identiteite',
      blocks: [
        {
          type: 'video',
          title: 'Watch: Lesson 4: How To Use Double Angle Identities | Grade 12 Trigonometry — Mlungisi Nkosi Maths & Science',
          videoId: 'tSsf4d_G8vg'
        }
      ]
    },
    {
      id: 'expansion-and-simplification-of-trig-expressions',
      title: 'Expansion and simplification of trig expressions',
      titleAf: 'Uitbreiding en vereenvoudiging van trig uitdrukkings',
      blocks: [
        {
          type: 'video',
          title: 'Watch: Simplify Trig Expressions | Reduction formulae and special angles | Trigonometry — Mlungisi Nkosi Maths & Science',
          videoId: 'Z6ogwmKM1to'
        }
      ]
    },
    {
      id: 'trigonometry-in-three-dimensional-problems',
      title: 'Trigonometry in three-dimensional problems',
      titleAf: 'Trigonometrie in driedimensionele probleme',
      blocks: [
        {
          type: 'video',
          title: 'Watch: Lesson 12: How To Solve 3D Trigonometry Problems | Grade 12 Trigonometry — Mlungisi Nkosi Maths & Science',
          videoId: 't3H6YY-D4dA'
        }
      ]
    }
  ]
}

export default trigGr12
