import type { TopicContent } from '@/types'

export const momentumGr12: TopicContent = {
  id: 'momentum-gr12',
  slug: 'momentum-gr12',
  subject: 'science',
  grade: 12,
  paper: 1,
  title: 'Momentum and Impulse',
  capsWeight: 15,
  sections: [
    {
      id: 'coming-soon',
      title: 'Momentum and Impulse',
      blocks: [
        {
          type: 'theory',
          title: 'Full Notes Coming Soon',
          body: `Full notes for this topic are coming soon. In the meantime, watch the Mindset Learn video below.

This topic covers:
• **Momentum** - $p = mv$, vector quantity, units (kg·m·s⁻¹)
• **Impulse** - $J = F\\Delta t = \\Delta p$
• **Newton's Second Law in terms of Momentum** - $F_{net} = \\frac{\\Delta p}{\\Delta t}$
• **Conservation of Momentum** - Isolated systems, before and after collisions
• **Elastic and Inelastic Collisions** - Kinetic energy considerations
• **Explosions** - Applying conservation of momentum
• **Real-world Applications** - Car safety, sports, rockets`
        },
        {
          type: 'video',
          title: 'Watch: Momentum and Impulse — Mindset Learn',
          videoId: 'MINDSET_MOMENTUM_GR12'
        }
      ]
    }
  ]
}

export default momentumGr12
