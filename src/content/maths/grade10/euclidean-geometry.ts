import type { TopicContent } from '@/types'

export const euclideanGeometryGr10: TopicContent = {
  id: 'euclidean-geometry-gr10',
  slug: 'euclidean-geometry-gr10',
  subject: 'maths',
  grade: 10,
  paper: 2,
  title: 'Euclidean Geometry',
  capsWeight: 20,
  sections: [
    {
      id: 'coming-soon',
      title: 'Euclidean Geometry',
      blocks: [
        {
          type: 'theory',
          title: 'Full Notes Coming Soon',
          body: `Full notes for this topic are coming soon. In the meantime, watch the Mindset Learn video below.

This topic covers:
• **Lines and Angles** - Vertically opposite, corresponding, alternate, co-interior
• **Triangles** - Properties, types, angle sum, exterior angles
• **Congruence** - SSS, SAS, AAS, RHS
• **Similarity** - AAA, sides in proportion
• **Midpoint Theorem** - Line joining midpoints
• **Quadrilaterals** - Properties of parallelograms, rectangles, rhombi, squares, kites, trapeziums
• **Proving Properties** - Writing geometric proofs with reasons`
        },
        {
          type: 'video',
          title: 'Watch: Euclidean Geometry — Mindset Learn',
          videoId: 'MINDSET_EUCLIDEAN_GEOMETRY_GR10'
        }
      ]
    }
  ]
}

export default euclideanGeometryGr10
