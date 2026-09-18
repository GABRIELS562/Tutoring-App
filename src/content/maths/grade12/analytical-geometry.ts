import type { TopicContent } from '@/types'

export const analyticalGeometryGr12: TopicContent = {
  id: 'analytical-geometry-gr12',
  slug: 'analytical-geometry-gr12',
  subject: 'maths',
  grade: 12,
  paper: 2,
  title: 'Analytical Geometry',
  capsWeight: 20,
  sections: [
    {
      id: 'coming-soon',
      title: 'Coming Soon',
      blocks: [
        {
          type: 'theory',
          title: 'What this topic covers',
          body: `• **Equation of a Circle** - Standard form and general form
• **Finding the Centre and Radius** - From different circle equations
• **Tangent to a Circle** - Finding equations of tangents at a point
• **Intersection of Lines and Circles** - Solving simultaneous equations
• **Properties of Chords** - Perpendicular bisectors and midpoints
• **Circles Through Three Points** - Determining circle equations
• **Combined Problems** - Circles with straight line geometry`
        },
        {
          type: 'tip',
          body: `The equation of a circle with centre $(a, b)$ and radius $r$ is $(x-a)^2 + (y-b)^2 = r^2$. Memorise this — it appears in every Paper 2 exam.`
        },
        // PROVISIONAL video picks — auto-filled 2026-09-18 from docs/client-updates/video-candidates; client to confirm.
        {
          type: 'video',
          title: 'Watch: Analytical Geometry Grade 12 Exam Questions — Kevinmathscience',
          videoId: 'LxMkIbspJAw',
          videoIdAf: '9YT8XPAM9Vc',
          titleAf: 'Watch: Analitiese Meetkunde Graad 12 Wiskunde: L1 Sirkel met oorsprong middelpunt — Online Maths by Miss Pythagoras'
        },
        {
          type: 'video',
          title: 'Watch: Analytical Geometry Grade 12 Exam Questions — Kevinmathscience',
          videoId: 'O9mO17v2-e8'
        }
        // TODO(curator): add { type: 'formula', formulas: [...] } block
      ]
    }
  ]
}

export default analyticalGeometryGr12
