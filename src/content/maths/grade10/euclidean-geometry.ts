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
        // PROVISIONAL video picks — auto-filled 2026-09-18 from docs/client-updates/video-candidates; client to confirm.
        {
          type: 'video',
          title: 'Watch: Exam Questions Grade 10 Euclidean Geometry — Kevinmathscience',
          videoId: 'g5b1Ygc-Tn4',
          videoIdAf: 'BSDa-8njr2w',
          titleAf: 'Watch: Euklidiese Meetkunde Voorbeelde - Verduideliking || Wiskunde Graad 10 — CollieMath Studio'
        },
        {
          type: 'video',
          title: 'Watch: Grade 10 Euclidean Geometry Exam Questions Part 1 — Miss Martins Maths and Science',
          videoId: 'lJHk-dG-Or4'
        }
      ]
    }
  ]
}

export default euclideanGeometryGr10
