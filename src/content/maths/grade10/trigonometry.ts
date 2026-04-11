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
          title: 'Full Notes Coming Soon',
          body: `Full notes for this topic are coming soon. In the meantime, watch the Mindset Learn video below.

This topic covers:
• **Right-Angled Triangles** - Identifying sides (opposite, adjacent, hypotenuse)
• **Trigonometric Ratios** - sin, cos, tan definitions (SOH CAH TOA)
• **Calculating Ratios** - Finding trig ratios from given triangles
• **Finding Angles** - Using inverse trig functions
• **Finding Sides** - Using trig ratios to solve for unknown sides
• **Special Angles** - 30°, 45°, 60° exact values
• **Problems in 2D** - Angles of elevation and depression`
        },
        {
          type: 'video',
          title: 'Watch: Introduction to Trigonometry — Mindset Learn',
          videoId: 'MINDSET_TRIG_GR10'
        }
      ]
    }
  ]
}

export default trigonometryGr10
