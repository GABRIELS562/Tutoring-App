import type { TopicContent } from '@/types'

// Scaffolded from the CAPS handbook (src/content/caps-curriculum.ts).
// One section per sub-topic; videos are filled by
// scripts/apply-curated-videos.ts.
export const algebraGr12: TopicContent = {
  id: 'algebra-gr12',
  slug: 'algebra-gr12',
  subject: 'maths',
  grade: 12,
  paper: 1,
  title: 'Algebra & Equations',
  titleAf: 'Algebra en Vergelykings',
  capsWeight: 0,
  // Curated per CAPS sub-topic — see docs/curriculum/ and scripts/curate-videos.ts
  sections: [
    {
      id: 'overview',
      title: 'Algebra & Equations',
      titleAf: 'Algebra en Vergelykings',
      blocks: [
        {
          type: 'theory',
          title: 'What this topic covers',
          titleAf: 'Wat hierdie onderwerp dek',
          body: `• Revision of quadratic equations and inequalities
• Advanced simultaneous equations
• Logarithms applied to exponential equations`
        }
      ]
    },
    {
      id: 'revision-of-quadratic-equations-and-inequalities',
      title: 'Revision of quadratic equations and inequalities',
      titleAf: 'Hersiening van kwadratiese vergelykings en ongelykhede',
      blocks: [
        {
          type: 'video',
          title: 'Watch: How to Solve Quadratic Equations & Inequalities | Grade 12 Pure & Technical Maths — Mlungisi Nkosi Maths & Science',
          videoId: 'QLe6_aa1o6Q'
        }
      ]
    },
    {
      id: 'advanced-simultaneous-equations',
      title: 'Advanced simultaneous equations',
      titleAf: 'Gevorderde gelyktydige vergelykings',
      blocks: [
        {
          type: 'video',
          title: 'Watch: Grade 12 - Revision | Simultaneous equation | Rationalising the denominator | May 2023 | Question 1B — Mlungisi Nkosi Maths & Science',
          videoId: 'Pa1WrbJnxT0',
          videoIdAf: '8naDLNF-GBY'
        }
      ]
    },
    {
      id: 'logarithms-applied-to-exponential-equations',
      title: 'Logarithms applied to exponential equations',
      titleAf: 'Logaritmes toegepas op eksponensiële vergelykings',
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

export default algebraGr12
