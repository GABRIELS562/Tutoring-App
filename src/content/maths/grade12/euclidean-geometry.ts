import type { TopicContent } from '@/types'

export const euclideanGeometryGr12: TopicContent = {
  id: 'euclidean-geometry-gr12',
  slug: 'euclidean-geometry-gr12',
  subject: 'maths',
  grade: 12,
  paper: 2,
  title: 'Euclidean Geometry',
  capsWeight: 25,
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
• **Revision of Grade 11 Circle Geometry** - All theorems and converses
• **Proportionality Theorems** - Lines parallel to one side of a triangle
• **Similar Triangles** - Proving and using similarity
• **Midpoint Theorem** - Applications and proofs
• **Theorem of Pythagoras (converse)** - Proving right angles
• **Advanced Riders** - Multi-step geometric proofs`
        },
        {
          type: 'video',
          title: 'Watch: Euclidean Geometry — Mindset Learn',
          videoId: 'MINDSET_EUCLIDEAN_GEOMETRY_GR12'
        }
      ]
    }
  ]
}

export default euclideanGeometryGr12
