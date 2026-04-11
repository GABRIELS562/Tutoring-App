import type { TopicContent } from '@/types'

export const analyticalGeometryGr10: TopicContent = {
  id: 'analytical-geometry-gr10',
  slug: 'analytical-geometry-gr10',
  subject: 'maths',
  grade: 10,
  paper: 2,
  title: 'Analytical Geometry',
  capsWeight: 15,
  sections: [
    {
      id: 'coming-soon',
      title: 'Analytical Geometry',
      blocks: [
        {
          type: 'theory',
          title: 'Full Notes Coming Soon',
          body: `Full notes for this topic are coming soon. In the meantime, watch the Mindset Learn video below.

This topic covers:
• **Distance Formula** - $d = \\sqrt{(x_2-x_1)^2 + (y_2-y_1)^2}$
• **Midpoint Formula** - $M = \\left(\\frac{x_1+x_2}{2}, \\frac{y_1+y_2}{2}\\right)$
• **Gradient of a Line** - $m = \\frac{y_2-y_1}{x_2-x_1}$
• **Equation of a Straight Line** - $y = mx + c$ and $y - y_1 = m(x - x_1)$
• **Parallel Lines** - Equal gradients ($m_1 = m_2$)
• **Perpendicular Lines** - Product of gradients = -1 ($m_1 \\times m_2 = -1$)`
        },
        {
          type: 'video',
          title: 'Watch: Analytical Geometry — Mindset Learn',
          videoId: 'MINDSET_ANALYTICAL_GEOMETRY_GR10'
        }
      ]
    }
  ]
}

export default analyticalGeometryGr10
