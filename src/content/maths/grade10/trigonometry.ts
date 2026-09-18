import type { TopicContent } from '@/types'

export const trigonometryGr10: TopicContent = {
  id: 'trig-gr10',
  slug: 'trig-gr10',
  subject: 'maths',
  grade: 10,
  paper: 2,
  title: 'Trigonometry',
  capsWeight: 20,
  sections: [
    {
      id: 'coming-soon',
      title: 'Introduction to Trigonometry',
      blocks: [
        {
          type: 'theory',
          title: 'What this topic covers',
          body: `• **Right-Angled Triangles** - Identifying sides (opposite, adjacent, hypotenuse)
• **Trigonometric Ratios** - sin, cos, tan definitions (SOH CAH TOA)
• **Calculating Ratios** - Finding trig ratios from given triangles
• **Finding Angles** - Using inverse trig functions
• **Finding Sides** - Using trig ratios to solve for unknown sides
• **Special Angles** - 30°, 45°, 60° exact values
• **Problems in 2D** - Angles of elevation and depression`
        },
        // PROVISIONAL video picks — auto-filled 2026-09-18 from docs/client-updates/video-candidates; client to confirm.
        {
          type: 'video',
          title: 'Watch: Sin Triangle Grade 10 — Kevinmathscience',
          videoId: '4jSqFXdmKR0',
          videoIdAf: 'U3rGPy484Ro',
          titleAf: 'Watch: Graad 10 Trigonometrie — YCDM - YouCanDoMaths'
        },
        {
          type: 'video',
          title: 'Watch: Trigonometry 2D Grade 10 Angle of elevation and depression — Miss Martins Maths and Science',
          videoId: 'KvBqPFfzfEM'
        }
        // TODO(curator): add { type: 'formula', formulas: [...] } block
      ]
    }
  ]
}

export default trigonometryGr10
