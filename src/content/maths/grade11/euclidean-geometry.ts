import type { TopicContent } from '@/types'

export const euclideanGeometryGr11: TopicContent = {
  id: 'euclidean-geometry-gr11',
  slug: 'euclidean-geometry-gr11',
  subject: 'maths',
  grade: 11,
  paper: 2,
  title: 'Euclidean Geometry',
  capsWeight: 25,
  sections: [
    {
      id: 'coming-soon',
      title: 'Coming Soon',
      blocks: [
        {
          type: 'theory',
          title: 'Content Under Development',
          body: `This topic is currently being developed. Check back soon for comprehensive content on:

• **Circle Terminology** - Radius, diameter, chord, arc, sector, segment
• **Theorem 1** - Line from centre perpendicular to chord bisects the chord
• **Theorem 2** - Angle at centre is twice angle at circumference
• **Theorem 3** - Angles in the same segment are equal
• **Theorem 4** - Angle in a semicircle is 90°
• **Theorem 5** - Opposite angles of a cyclic quadrilateral are supplementary
• **Theorem 6** - Exterior angle of cyclic quadrilateral equals interior opposite angle
• **Theorem 7** - Tangent perpendicular to radius at point of contact
• **Theorem 8** - Two tangents from external point are equal
• **Theorem 9** - Tan-chord angle equals angle in alternate segment
• **Proving Theorems** - Structured proof writing with reasons

In the meantime, practice with past papers available in the Papers section.`
        },
        {
          type: 'tip',
          body: `Circle geometry requires you to state theorems correctly. Practice writing "angle at centre = 2 × angle at circumference" and similar statements — examiners are strict about wording!`
        },
        // PROVISIONAL video picks — auto-filled 2026-09-18 from docs/client-updates/video-candidates; client to confirm.
        {
          type: 'video',
          title: 'Watch: Circle Geometry Grade 11 : Practice — Kevinmathscience',
          videoId: 'bc6x2GQcMbU',
          videoIdAf: 'ULsEMok0Ksk',
          titleAf: 'Watch: Sirkelmeetkunde vraagstukke 1 euklidiese graad 11 (wiskvaw) (wiskdo) — VAW-Vereniging vir Afrikaanse Wiskunde-onderwysers'
        },
        {
          type: 'video',
          title: 'Watch: Euclidean Geometry Grade 11: Exam question — Kevinmathscience',
          videoId: 'lQE642ILPDY'
        }
      ]
    }
  ]
}

export default euclideanGeometryGr11
