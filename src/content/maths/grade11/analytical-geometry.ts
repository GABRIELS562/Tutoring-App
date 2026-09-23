import type { TopicContent } from '@/types'

export const analyticalGeometryGr11: TopicContent = {
  id: 'analytical-geometry-gr11',
  slug: 'analytical-geometry-gr11',
  subject: 'maths',
  grade: 11,
  paper: 2,
  title: 'Analytical Geometry',
  capsWeight: 15,
  // Curated per CAPS sub-topic — see docs/curriculum/ and scripts/curate-videos.ts
  sections: [
    {
      id: 'overview',
      title: 'Analytical Geometry',
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
        }
      ]
    },
    {
      id: 'inclination-of-a-line',
      title: 'Inclination of a line',
      blocks: [
        {
          type: 'video',
          title: 'Watch: Grade 11 Analytical geometry: angle of inclination — Kevinmathscience',
          videoId: 'VB4jH92V-tg'
        }
      ]
    },
    {
      id: 'parallel-and-perpendicular-lines',
      title: 'Parallel and perpendicular lines',
      blocks: [
        {
          type: 'tip',
          body: `We haven't found a CAPS video for this sub-topic yet. Ask Angelo if you're stuck on it.`
        }
      ]
    },
    {
      id: 'solving-geometric-shapes-analytically',
      title: 'Solving geometric shapes analytically',
      blocks: [
        {
          type: 'tip',
          body: `We haven't found a CAPS video for this sub-topic yet. Ask Angelo if you're stuck on it.`
        }
      ]
    }
  ]
}

export default analyticalGeometryGr11
