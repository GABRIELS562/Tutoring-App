import type { TopicContent } from '@/types'

export const euclideanGeometryGr12: TopicContent = {
  id: 'euclidean-geometry-gr12',
  slug: 'euclidean-geometry-gr12',
  subject: 'maths',
  grade: 12,
  paper: 2,
  title: 'Euclidean Geometry',
  titleAf: 'Euklidiese Meetkunde',
  capsWeight: 25,
  // Curated per CAPS sub-topic — see docs/curriculum/ and scripts/curate-videos.ts
  sections: [
    {
      id: 'overview',
      title: 'Euclidean Geometry',
      titleAf: 'Euklidiese Meetkunde',
      blocks: [
        {
          type: 'theory',
          title: 'What this topic covers',
          titleAf: 'Wat hierdie onderwerp dek',
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
      titleAf: 'Eweredigheid in driehoeke',
      blocks: [
        {
          type: 'video',
          title: 'Watch: Grade 12 Proportionality: Area of triangle #1 — Kevinmathscience',
          videoId: '2jgK_SKwGL0',
          videoIdAf: '1dqCThLt2Fk',
          titleAf: 'Kyk: Euklidiese Meetkunde Graad12: L1 Eweredigheid in Driehoeke( Lyn ewewydig een sy van driehoek) — Online Maths by Miss Pythagoras'
        }
      ]
    },
    {
      id: 'similarity-of-triangles',
      title: 'Similarity of triangles',
      titleAf: 'Gelykvormigheid van driehoeke',
      blocks: [
        {
          type: 'video',
          title: 'Watch: Grade 12 Similarity vs Proportionality theorem — Kevinmathscience',
          videoId: 'GxJ1iQpps8I',
          videoIdAf: '73durGFZlAc',
          titleAf: 'Kyk: Euklidiese Meetkunde Graad12: L3 Gelykvormigheid in Driehoeke Deel1 — Online Maths by Miss Pythagoras'
        }
      ]
    },
    {
      id: 'the-theorem-of-pythagoras-proved-via-similarity',
      title: 'The Theorem of Pythagoras proved via similarity',
      titleAf: 'Die Stelling van Pythagoras bewys deur gelykvormigheid',
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
