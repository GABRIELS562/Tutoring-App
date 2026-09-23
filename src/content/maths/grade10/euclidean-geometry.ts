import type { TopicContent } from '@/types'

export const euclideanGeometryGr10: TopicContent = {
  id: 'euclidean-geometry-gr10',
  slug: 'euclidean-geometry-gr10',
  subject: 'maths',
  grade: 10,
  paper: 2,
  title: 'Euclidean Geometry',
  capsWeight: 20,
  // Curated per CAPS sub-topic — see docs/curriculum/ and scripts/curate-videos.ts
  sections: [
    {
      id: 'overview',
      title: 'Euclidean Geometry',
      blocks: [
        {
          type: 'theory',
          title: 'What this topic covers',
          body: `• **Lines and Angles** - Vertically opposite, corresponding, alternate, co-interior
• **Triangles** - Properties, types, angle sum, exterior angles
• **Congruence** - SSS, SAS, AAS, RHS
• **Similarity** - AAA, sides in proportion
• **Midpoint Theorem** - Line joining midpoints
• **Quadrilaterals** - Properties of parallelograms, rectangles, rhombi, squares, kites, trapeziums
• **Proving Properties** - Writing geometric proofs with reasons`
        }
      ]
    },
    {
      id: 'lines-angles-and-triangles',
      title: 'Lines, angles and triangles',
      blocks: [
        {
          type: 'video',
          title: 'Watch: Sin Triangle Grade 10 — Kevinmathscience',
          videoId: '4jSqFXdmKR0'
        }
      ]
    },
    {
      id: 'properties-of-quadrilaterals-parallelograms-rect',
      title: 'Properties of quadrilaterals: parallelograms, rectangles, rhombi, kites',
      blocks: [
        {
          type: 'video',
          title: 'Watch: Euclidean Geometry Grade 10: What is a parallelogram? — Kevinmathscience',
          videoId: 'g5Z0eGEKtSs'
        }
      ]
    },
    {
      id: 'the-midpoint-theorem',
      title: 'The Midpoint Theorem',
      blocks: [
        {
          type: 'video',
          title: 'Watch: Euclidean Geometry Grade 10: Midpoint Theorem Introduction — Kevinmathscience',
          videoId: 'tlqb3NSFQ_0'
        }
      ]
    }
  ]
}

export default euclideanGeometryGr10
