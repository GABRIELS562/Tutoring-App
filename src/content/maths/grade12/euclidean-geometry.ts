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
          title: 'What this topic covers',
          body: `• **Revision of Grade 11 Circle Geometry** - All theorems and converses
• **Proportionality Theorems** - Lines parallel to one side of a triangle
• **Similar Triangles** - Proving and using similarity
• **Midpoint Theorem** - Applications and proofs
• **Theorem of Pythagoras (converse)** - Proving right angles
• **Advanced Riders** - Multi-step geometric proofs`
        },
        // PROVISIONAL video picks — auto-filled 2026-09-18 from docs/client-updates/video-candidates; client to confirm.
        {
          type: 'video',
          title: 'Watch: Grade 12 Euclidean Geometry Exam question # 1 — Kevinmathscience',
          videoId: 'nWn-HjCP9wY',
          videoIdAf: 'GbXpQ2YDdNQ',
          titleAf: 'Watch: Eweredigheid en Gelykvormigheid Verduideliking Via Voorbeelde || Wiskunde Graad 12 — CollieMath Studio'
        },
        {
          type: 'video',
          title: 'Watch: EUCLIDEAN GEOMETRY | PROPORTIONALITY GRADE 12 [ ISIZULU ] — Isinamuva Tutoring',
          videoId: '122eVl0o_C8'
        }
        // TODO(curator): add { type: 'formula', formulas: [...] } block
      ]
    }
  ]
}

export default euclideanGeometryGr12
