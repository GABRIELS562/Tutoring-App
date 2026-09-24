import type { TopicContent } from '@/types'

export const analyticalGeometryGr12: TopicContent = {
  id: 'analytical-geometry-gr12',
  slug: 'analytical-geometry-gr12',
  subject: 'maths',
  grade: 12,
  paper: 2,
  title: 'Analytical Geometry',
  capsWeight: 20,
  // Curated per CAPS sub-topic — see docs/curriculum/ and scripts/curate-videos.ts
  // Curated per CAPS sub-topic — see docs/curriculum/ and scripts/curate-videos.ts
  // Curated per CAPS sub-topic — see docs/curriculum/ and scripts/curate-videos.ts
  sections: [
    {
      id: 'overview',
      title: 'Analytical Geometry',
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
        }
      ]
    },
    {
      id: 'the-equation-of-a-circle-centred-at-the-origin',
      title: 'The equation of a circle centred at the origin',
      blocks: [
        {
          type: 'video',
          title: 'Watch: Equation of Circle Grade 12 — Kevinmathscience',
          videoId: 'cjP4tmQtxEs',
          videoIdAf: 'MReI_dq_qbI'
        }
      ]
    },
    {
      id: 'the-equation-of-a-circle-centred-at-any-point',
      title: 'The equation of a circle centred at any point',
      blocks: [
        {
          type: 'video',
          title: 'Watch: Lesson 2: How To Find the Equation of a Circle & Tangent to a Circle | Analytical Geometry — Mlungisi Nkosi Maths & Science',
          videoId: '4I9OcKET5Ys'
        }
      ]
    },
    {
      id: 'tangents-to-circles-analytically',
      title: 'Tangents to circles analytically',
      blocks: [
        {
          type: 'video',
          title: 'Watch: Analytical Geometry Grade 12: L4 Equation of a Tangent to Circle — Online Maths by Miss Pythagoras',
          videoId: 'sQNItmXLyuI'
        }
      ]
    },
    {
      id: 'intersecting-circles',
      title: 'Intersecting circles',
      blocks: [
        {
          type: 'video',
          title: 'Watch: Does Line Intersect Circle Grade 12 — Kevinmathscience',
          videoId: '9D8aMrzGbBc'
        }
      ]
    }
  ]
}

export default analyticalGeometryGr12
