import type { TopicContent } from '@/types'

export const analyticalGeometryGr10: TopicContent = {
  id: 'analytical-geometry-gr10',
  slug: 'analytical-geometry-gr10',
  subject: 'maths',
  grade: 10,
  paper: 2,
  title: 'Analytical Geometry',
  titleAf: 'Analitiese Meetkunde',
  capsWeight: 15,
  // Curated per CAPS sub-topic — see docs/curriculum/ and scripts/curate-videos.ts
  sections: [
    {
      id: 'overview',
      title: 'Analytical Geometry',
      titleAf: 'Analitiese Meetkunde',
      blocks: [
        {
          type: 'theory',
          title: 'What this topic covers',
          titleAf: 'Wat hierdie onderwerp dek',
          body: `• **Distance Formula** - $d = \\sqrt{(x_2-x_1)^2 + (y_2-y_1)^2}$
• **Midpoint Formula** - $M = \\left(\\frac{x_1+x_2}{2}, \\frac{y_1+y_2}{2}\\right)$
• **Gradient of a Line** - $m = \\frac{y_2-y_1}{x_2-x_1}$
• **Equation of a Straight Line** - $y = mx + c$ and $y - y_1 = m(x - x_1)$
• **Parallel Lines** - Equal gradients ($m_1 = m_2$)
• **Perpendicular Lines** - Product of gradients = -1 ($m_1 \\times m_2 = -1$)`
        }
      ]
    },
    {
      id: 'the-distance-formula',
      title: 'The distance formula',
      titleAf: 'Die afstandsformule',
      blocks: [
        {
          type: 'video',
          title: 'Watch: Analytical Geometry Grade 10: Distance formula — Kevinmathscience',
          videoId: 'H5hq7wkldj8',
          videoIdAf: 'Qk9O9PhyqtM',
          titleAf: 'Kyk: Analitiese meetkunde Afstand graad 10 en ouer — VAW-Vereniging vir Afrikaanse Wiskunde-onderwysers'
        }
      ]
    },
    {
      id: 'the-midpoint-formula',
      title: 'The midpoint formula',
      titleAf: 'Die middelpuntformule',
      blocks: [
        {
          type: 'video',
          title: 'Watch: Analytical Geometry Grade 10: Midpoint — Kevinmathscience',
          videoId: 'HtNFDWGpE7U',
          videoIdAf: 'uNtfSc_RUZE',
          titleAf: 'Kyk: 03 Middelpunt van \'n lynsegment — Wiskunde_Mathematics_SUM'
        }
      ]
    },
    {
      id: 'gradient-of-a-line-segment',
      title: 'Gradient of a line segment',
      titleAf: 'Gradiënt van ’n lynsegment',
      blocks: [
        {
          type: 'video',
          title: 'Watch: Analytical Geometry Grade 10: Gradient formula — Kevinmathscience',
          videoId: 'Pqafv6sV6Ng',
          videoIdAf: 'HLjh0U2C248',
          titleAf: 'Kyk: Gradiënt afsnit metode. Skets reguit lyn grafiek (wiskdou) — Dou Kleefstra'
        }
      ]
    }
  ]
}

export default analyticalGeometryGr10
