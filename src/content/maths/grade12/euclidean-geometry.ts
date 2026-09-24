import type { TopicContent } from '@/types'

export const euclideanGeometryGr12: TopicContent = {
  id: 'euclidean-geometry-gr12',
  slug: 'euclidean-geometry-gr12',
  subject: 'maths',
  grade: 12,
  paper: 2,
  title: 'Euclidean Geometry',
  capsWeight: 25,
  // Curated per CAPS sub-topic — see docs/curriculum/ and scripts/curate-videos.ts
  // Curated per CAPS sub-topic — see docs/curriculum/ and scripts/curate-videos.ts
  sections: [
    {
      id: 'overview',
      title: 'Euclidean Geometry',
      blocks: [
        {
          type: 'theory',
          title: 'What this topic covers',
          body: `• **Revision of Grade 11 Circle Geometry** - All theorems and converses
• **Proportionality Theorems** - Lines parallel to one side of a triangle
• **Similar Triangles** - Proving and using similarity
• **Midpoint Theorem** - Applications and proofs
• **Theorem of Pythagoras (converse)** - Proving right angles
• **Advanced Riders** - Multi-step geometric proofs`
        }
      ]
    },
    {
      id: 'proportionality-in-triangles',
      title: 'Proportionality in triangles',
      blocks: [
        {
          type: 'video',
          title: 'Watch: Grade 12 Proportionality: Area of triangle #1 — Kevinmathscience',
          videoId: '2jgK_SKwGL0',
          videoIdAf: '1dqCThLt2Fk'
        }
      ]
    },
    {
      id: 'similarity-of-triangles',
      title: 'Similarity of triangles',
      blocks: [
        {
          type: 'video',
          title: 'Watch: Grade 12 Similarity vs Proportionality theorem — Kevinmathscience',
          videoId: 'GxJ1iQpps8I',
          videoIdAf: '73durGFZlAc'
        }
      ]
    },
    {
      id: 'the-theorem-of-pythagoras-proved-via-similarity',
      title: 'The Theorem of Pythagoras proved via similarity',
      blocks: [
        {
          type: 'video',
          title: 'Watch: 04 Similarity Pythagoras Theorem — Mindset',
          videoId: 'gBizyVMuPdw'
        }
      ]
    }
  ]
}

export default euclideanGeometryGr12
