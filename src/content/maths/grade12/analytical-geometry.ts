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
          title: 'Content Under Development',
          body: `This topic is currently being developed. Check back soon for comprehensive content on:

• **Equation of a Circle** - Standard form and general form
• **Finding the Centre and Radius** - From different circle equations
• **Tangent to a Circle** - Finding equations of tangents at a point
• **Intersection of Lines and Circles** - Solving simultaneous equations
• **Properties of Chords** - Perpendicular bisectors and midpoints
• **Circles Through Three Points** - Determining circle equations
• **Combined Problems** - Circles with straight line geometry

In the meantime, practice with past papers available in the Papers section.`
        },
        {
          type: 'tip',
          body: `The equation of a circle with centre $(a, b)$ and radius $r$ is $(x-a)^2 + (y-b)^2 = r^2$. Memorise this — it appears in every Paper 2 exam.`
        },
        {
          type: 'video',
          title: 'Watch: Analytical Geometry — Mindset Learn',
          videoId: 'MINDSET_ANALYTICAL_GEOMETRY_GR12'
        }
      ]
    }
  ]
}

export default analyticalGeometryGr12
