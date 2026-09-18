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
        // PROVISIONAL video picks — auto-filled 2026-09-18 from docs/client-updates/video-candidates; client to confirm.
        {
          type: 'video',
          title: 'Watch: Grade 10 Mechanics Past Paper Question Motion in One Dimension — Miss Martins Maths and Science',
          videoId: 'gtiOPVVKkU4',
          videoIdAf: '0pf1ilcCd2c',
          titleAf: 'Watch: Hoe om vir Graad 10 Fisiese Wetenskap te leer — Juf. OK se Wetenskap Akademie'
        },
        {
          type: 'video',
          title: 'Watch: Grade 10 Mechanics: Equations of Motion Exam Question PART 1 — Miss Martins Maths and Science',
          videoId: '-wHXFMMEltw'
        }
      ]
    }
  ]
}

export default mechanicsGr10
