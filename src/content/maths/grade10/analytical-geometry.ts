import type { TopicContent } from '@/types'

export const analyticalGeometryGr10: TopicContent = {
  id: 'analytical-geometry-gr10',
  slug: 'analytical-geometry-gr10',
  subject: 'maths',
  grade: 10,
  paper: 2,
  title: 'Analytical Geometry',
  capsWeight: 15,
  // Curated per CAPS sub-topic — see docs/curriculum/ and scripts/curate-videos.ts
  sections: [
    {
      id: 'overview',
      title: 'Analytical Geometry',
      blocks: [
        {
          type: 'theory',
          title: 'What this topic covers',
          body: `• **Distance Formula** - $d = \\sqrt{(x_2-x_1)^2 + (y_2-y_1)^2}$
• **Midpoint Formula** - $M = \\left(\\frac{x_1+x_2}{2}, \\frac{y_1+y_2}{2}\\right)$
• **Gradient of a Line** - $m = \\frac{y_2-y_1}{x_2-x_1}$
• **Equation of a Straight Line** - $y = mx + c$ and $y - y_1 = m(x - x_1)$
• **Parallel Lines** - Equal gradients ($m_1 = m_2$)
• **Perpendicular Lines** - Product of gradients = -1 ($m_1 \\times m_2 = -1$)`
        }
      ]
    },
    {
      id: 'the-distance-formula',
      title: 'The distance formula',
      blocks: [
        {
          type: 'video',
          title: 'Watch: Analytical Geometry Grade 10: Distance formula — Kevinmathscience',
          videoId: 'H5hq7wkldj8'
        }
      ]
    },
    {
      id: 'the-midpoint-formula',
      title: 'The midpoint formula',
      blocks: [
        {
          type: 'video',
          title: 'Watch: Analytical Geometry Grade 10: Midpoint — Kevinmathscience',
          videoId: 'HtNFDWGpE7U'
        }
      ]
    },
    {
      id: 'gradient-of-a-line-segment',
      title: 'Gradient of a line segment',
      blocks: [
        {
          type: 'video',
          title: 'Watch: Analytical Geometry Grade 10: Gradient formula — Kevinmathscience',
          videoId: 'Pqafv6sV6Ng'
        }
      ]
    }
  ]
}

export default analyticalGeometryGr10
