import type { TopicContent } from '@/types'

export const trigonometryGr10: TopicContent = {
  id: 'trig-gr10',
  slug: 'trig-gr10',
  subject: 'maths',
  grade: 10,
  paper: 2,
  title: 'Trigonometry',
  titleAf: 'Trigonometrie',
  capsWeight: 20,
  // Curated per CAPS sub-topic — see docs/curriculum/ and scripts/curate-videos.ts
  sections: [
    {
      id: 'overview',
      title: 'Trigonometry',
      titleAf: 'Trigonometrie',
      blocks: [
        {
          type: 'theory',
          title: 'What this topic covers',
          titleAf: 'Wat hierdie onderwerp dek',
          body: `• **Right-Angled Triangles** - Identifying sides (opposite, adjacent, hypotenuse)
• **Trigonometric Ratios** - sin, cos, tan definitions (SOH CAH TOA)
• **Calculating Ratios** - Finding trig ratios from given triangles
• **Finding Angles** - Using inverse trig functions
• **Finding Sides** - Using trig ratios to solve for unknown sides
• **Special Angles** - 30°, 45°, 60° exact values
• **Problems in 2D** - Angles of elevation and depression`
        }
      ]
    },
    {
      id: 'trig-ratios-in-right-angled-triangles',
      title: 'Trig ratios in right-angled triangles',
      titleAf: 'Trig verhoudings in reghoekige driehoeke',
      blocks: [
        {
          type: 'video',
          title: 'Watch: Trig Triangles Grade 10 — Kevinmathscience',
          videoId: '0Sr8YWwRX28',
          videoIdAf: 'rg3_rjEEWZ0'
        }
      ]
    },
    {
      id: 'trig-ratios-on-the-cartesian-plane-0-to-360',
      title: 'Trig ratios on the Cartesian plane (0° to 360°)',
      titleAf: 'Trig verhoudings op die Cartesiese vlak (0° tot 360°)',
      blocks: [
        {
          type: 'video',
          title: 'Kyk: 09 Trig berekeninge op die kartesiese vlak — Wiskunde_Mathematics_SUM',
          videoIdAf: 'lbfvJw6Ywc8'
        }
      ]
    },
    {
      id: 'two-dimensional-problems-elevation-and-depressio',
      title: 'Two-dimensional problems (elevation and depression)',
      titleAf: 'Tweedimensionele probleme (elevasie en depressie)',
      blocks: [
        {
          type: 'video',
          title: 'Watch: Trigonometry 2D Grade 10 Angle of elevation and depression — Miss Martins Maths and Science',
          videoId: 'KvBqPFfzfEM'
        }
      ]
    },
    {
      id: 'basic-trig-graphs-sin-cos-tan',
      title: 'Basic trig graphs: sin, cos, tan',
      titleAf: 'Basiese trig grafieke: sin, cos, tan',
      blocks: [
        {
          type: 'video',
          title: 'Watch: Sin Graph Grade 10 — Kevinmathscience',
          videoId: 'XmN3h5nTGis',
          videoIdAf: 'XT9ufKe7Khw'
        }
      ]
    }
  ]
}

export default trigonometryGr10
