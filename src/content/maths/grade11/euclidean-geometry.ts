import type { TopicContent } from '@/types'

export const euclideanGeometryGr11: TopicContent = {
  id: 'euclidean-geometry-gr11',
  slug: 'euclidean-geometry-gr11',
  subject: 'maths',
  grade: 11,
  paper: 2,
  title: 'Euclidean Geometry',
  capsWeight: 25,
  // Curated per CAPS sub-topic — see docs/curriculum/ and scripts/curate-videos.ts
  sections: [
    {
      id: 'overview',
      title: 'Euclidean Geometry',
      blocks: [
        {
          type: 'theory',
          title: 'What this topic covers',
          body: `• **Circle Terminology** - Radius, diameter, chord, arc, sector, segment
• **Theorem 1** - Line from centre perpendicular to chord bisects the chord
• **Theorem 2** - Angle at centre is twice angle at circumference
• **Theorem 3** - Angles in the same segment are equal
• **Theorem 4** - Angle in a semicircle is 90°
• **Theorem 5** - Opposite angles of a cyclic quadrilateral are supplementary
• **Theorem 6** - Exterior angle of cyclic quadrilateral equals interior opposite angle
• **Theorem 7** - Tangent perpendicular to radius at point of contact
• **Theorem 8** - Two tangents from external point are equal
• **Theorem 9** - Tan-chord angle equals angle in alternate segment
• **Proving Theorems** - Structured proof writing with reasons`
        }
      ]
    },
    {
      id: 'circle-geometry-chords',
      title: 'Circle geometry: chords',
      blocks: [
        {
          type: 'video',
          title: 'Watch: Circle Geometry Grade 11 : Tan- Chord Theorem Introduction — Kevinmathscience',
          videoId: 'ktkiZMPSyWg'
        }
      ]
    },
    {
      id: 'angles-at-the-centre-and-at-the-circumference',
      title: 'Angles at the centre and at the circumference',
      blocks: [
        {
          type: 'video',
          title: 'Watch: Circle Geometry Grade 11 Euclidean Geometry: Angle at Centre = 2 x angle at circumference — Miss Martins Maths and Science',
          videoId: '4Bvjpd91yGM'
        }
      ]
    },
    {
      id: 'cyclic-quadrilaterals',
      title: 'Cyclic quadrilaterals',
      blocks: [
        {
          type: 'video',
          title: 'Watch: Circle Geometry Grade 11 : Cyclic Quadrilateral — Kevinmathscience',
          videoId: 'QzWrAgv77Wc'
        }
      ]
    },
    {
      id: 'tangents-to-circles',
      title: 'Tangents to circles',
      blocks: [
        {
          type: 'video',
          title: 'Watch: Circle Geometry Grade 11 : Common Tangent — Kevinmathscience',
          videoId: '5rbzBMXkX54'
        }
      ]
    }
  ]
}

export default euclideanGeometryGr11
