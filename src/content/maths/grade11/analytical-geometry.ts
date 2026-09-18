import type { TopicContent } from '@/types'

export const analyticalGeometryGr11: TopicContent = {
  id: 'analytical-geometry-gr11',
  slug: 'analytical-geometry-gr11',
  subject: 'maths',
  grade: 11,
  paper: 2,
  title: 'Analytical Geometry',
  capsWeight: 15,
  sections: [
    {
      id: 'coming-soon',
      title: 'Coming Soon',
      blocks: [
        {
          type: 'theory',
          title: 'What this topic covers',
          body: `• **Distance Formula** - Finding the distance between two points
• **Midpoint Formula** - Finding the midpoint of a line segment
• **Gradient of a Line** - Calculating slope and understanding its meaning
• **Equation of a Straight Line** - Different forms: $y = mx + c$, point-gradient form
• **Parallel and Perpendicular Lines** - Relationship between gradients
• **Inclination of a Line** - The angle a line makes with the positive $x$-axis
• **Collinear Points** - Proving points lie on the same line
• **Properties of Quadrilaterals** - Using analytical geometry to prove properties`
        },
        {
          type: 'tip',
          body: `For perpendicular lines: $m_1 \\times m_2 = -1$. For parallel lines: $m_1 = m_2$. These relationships appear in almost every analytical geometry question.`
        },
        // PROVISIONAL video picks — auto-filled 2026-09-18 from docs/client-updates/video-candidates; client to confirm.
        {
          type: 'video',
          title: 'Watch: Grade 11 Analytical geometry: angle of inclination — Kevinmathscience',
          videoId: 'VB4jH92V-tg',
          videoIdAf: 'kwLfg5jJ2eI',
          titleAf: 'Watch: Graad 11 Analitiese Meetkunde #6: Ewewydige (Parallele) Lyne — WiskundeMetMargie'
        },
        {
          type: 'video',
          title: 'Watch: Grade 11 Analytical Geometry Angle of Inclination Introduction and practice — Miss Martins Maths and Science',
          videoId: 'lrmASs4NOww'
        }
        // TODO(curator): add { type: 'formula', formulas: [...] } block
      ]
    }
  ]
}

export default analyticalGeometryGr11
