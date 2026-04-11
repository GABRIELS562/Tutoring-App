import type { TopicContent } from '@/types'

export const mechanicsGr10: TopicContent = {
  id: 'mechanics-gr10',
  slug: 'mechanics-gr10',
  subject: 'science',
  grade: 10,
  paper: 1,
  title: 'Mechanics',
  capsWeight: 20,
  sections: [
    {
      id: 'coming-soon',
      title: 'Motion and Forces',
      blocks: [
        {
          type: 'theory',
          title: 'Full Notes Coming Soon',
          body: `Full notes for this topic are coming soon. In the meantime, watch the Mindset Learn video below.

This topic covers:
• **Vectors and Scalars** - Distance vs displacement, speed vs velocity
• **Motion in 1D** - Position, displacement, velocity, acceleration
• **Equations of Motion** - $v = u + at$, $s = ut + \\frac{1}{2}at^2$, $v^2 = u^2 + 2as$
• **Motion Graphs** - Position-time, velocity-time, acceleration-time
• **Free Fall** - Motion under gravity ($g = 9.8$ m/s²)
• **Forces** - Normal, friction, tension, weight
• **Newton's Laws** - First, second, and third law basics`
        },
        {
          type: 'video',
          title: 'Watch: Mechanics — Mindset Learn',
          videoId: 'MINDSET_MECHANICS_GR10'
        }
      ]
    }
  ]
}

export default mechanicsGr10
