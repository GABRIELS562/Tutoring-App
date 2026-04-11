import type { TopicContent } from '@/types'

export const analyticalGeometryGr11: TopicContent = {
  id: 'analytical-geometry-gr11',
  slug: 'analytical-geometry-gr11',
  subject: 'maths',
  grade: 11,
  paper: 2,
  title: 'Analytical Geometry',
  capsWeight: 15,
  sections: [
    {
      id: 'coming-soon',
      title: 'Coming Soon',
      blocks: [
        {
          type: 'theory',
          title: 'Content Under Development',
          body: `This topic is currently being developed. Check back soon for comprehensive content on:

• **Distance Formula** - Finding the distance between two points
• **Midpoint Formula** - Finding the midpoint of a line segment
• **Gradient of a Line** - Calculating slope and understanding its meaning
• **Equation of a Straight Line** - Different forms: $y = mx + c$, point-gradient form
• **Parallel and Perpendicular Lines** - Relationship between gradients
• **Inclination of a Line** - The angle a line makes with the positive $x$-axis
• **Collinear Points** - Proving points lie on the same line
• **Properties of Quadrilaterals** - Using analytical geometry to prove properties

In the meantime, practice with past papers available in the Papers section.`
        },
        {
          type: 'tip',
          body: `For perpendicular lines: $m_1 \\times m_2 = -1$. For parallel lines: $m_1 = m_2$. These relationships appear in almost every analytical geometry question.`
        },
        {
          type: 'video',
          title: 'Watch: Analytical Geometry — Mindset Learn',
          videoId: 'MINDSET_ANALYTICAL_GEOMETRY_GR11'
        }
      ]
    }
  ]
}

export default analyticalGeometryGr11
