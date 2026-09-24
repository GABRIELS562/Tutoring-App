import type { TopicContent } from '@/types'

export const euclideanGeometryGr11: TopicContent = {
  id: 'euclidean-geometry-gr11',
  slug: 'euclidean-geometry-gr11',
  subject: 'maths',
  grade: 11,
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
      titleAf: 'Sirkelmeetkunde: koorde',
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
      titleAf: 'Hoeke by die middelpunt en by die omtrek',
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
      titleAf: 'Koordevierhoeke',
      blocks: [
        {
          type: 'video',
          title: 'Watch: Circle Geometry Grade 11 : Cyclic Quadrilateral — Kevinmathscience',
          videoId: 'QzWrAgv77Wc',
          videoIdAf: 'BDJj5iCEDmc'
        }
      ]
    },
    {
      id: 'tangents-to-circles',
      title: 'Tangents to circles',
      titleAf: 'Raaklyne aan sirkels',
      blocks: [
        {
          type: 'video',
          title: 'Watch: Circle Geometry Grade 11 : Common Tangent — Kevinmathscience',
          videoId: '5rbzBMXkX54',
          videoIdAf: 'w5nJdK5AdFQ'
        }
      ]
    }
  ]
}

export default euclideanGeometryGr11
