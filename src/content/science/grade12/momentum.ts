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
        // PROVISIONAL video picks — auto-filled 2026-09-18 from docs/client-updates/video-candidates; client to confirm.
        {
          type: 'video',
          title: 'Watch: 1) Momentum Gr 12 | Intro — Kevinmathscience',
          videoId: 'JOyL0KJRe0g',
          videoIdAf: '2YERVz7HUMI',
          titleAf: 'Watch: Momentum en Impuls - Afrikaans Potgooi / Fisika / Fisiese Wetenskappe / Graad 12 NSS — Simple Science'
        },
        {
          type: 'video',
          title: 'Watch: Exam question momentum gr 12 — Kevinmathscience',
          videoId: '7Zq7PjYaySU'
        }
      ]
    }
  ]
}

export default momentumGr12
