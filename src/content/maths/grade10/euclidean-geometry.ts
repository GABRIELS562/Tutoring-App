import type { TopicContent } from '@/types'

export const euclideanGeometryGr10: TopicContent = {
  id: 'euclidean-geometry-gr10',
  slug: 'euclidean-geometry-gr10',
  subject: 'maths',
  grade: 10,
  paper: 2,
  title: 'Euclidean Geometry',
  titleAf: 'Euklidiese Meetkunde',
  capsWeight: 20,
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
      titleAf: 'Lyne, hoeke en driehoeke',
      blocks: [
        {
          type: 'video',
          title: 'Watch: Euclidean Geometry Grade 10: Opposite angles Parallelogram — Kevinmathscience',
          videoId: 'vWpzk0-tXzc',
          videoIdAf: 'ThYkub-VRLg',
          titleAf: 'Kyk: 01 Hoeke en lyne — Wiskunde_Mathematics_SUM'
        }
      ]
    },
    {
      id: 'properties-of-quadrilaterals-parallelograms-rect',
      title: 'Properties of quadrilaterals: parallelograms, rectangles, rhombi, kites',
      titleAf: 'Eienskappe van vierhoeke: parallelogramme, reghoeke, ruite, vlieërs',
      blocks: [
        {
          type: 'video',
          title: 'Watch: Euclidean Geometry Grade 10: What is a parallelogram? — Kevinmathscience',
          videoId: 'g5Z0eGEKtSs',
          videoIdAf: 'I5X9Cx73Vz0',
          titleAf: 'Kyk: 06 Bewys \'n parallelogram — Wiskunde_Mathematics_SUM'
        }
      ]
    },
    {
      id: 'the-midpoint-theorem',
      title: 'The Midpoint Theorem',
      titleAf: 'Die Middelpuntstelling',
      blocks: [
        {
          type: 'video',
          title: 'Watch: Euclidean Geometry Grade 10: Midpoint Theorem Introduction — Kevinmathscience',
          videoId: 'tlqb3NSFQ_0',
          videoIdAf: 'v1-A2561yqk',
          titleAf: 'Kyk: Middelpunt Stelling Gr10 Meetkunde — TheWhiteboardSA'
        }
      ]
    }
  ]
}

export default euclideanGeometryGr10
