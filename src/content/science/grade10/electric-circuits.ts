import type { TopicContent } from '@/types'

export const electricCircuitsGr10: TopicContent = {
  id: 'electric-circuits-gr10',
  slug: 'electric-circuits-gr10',
  subject: 'science',
  grade: 10,
  paper: 1,
  title: 'Electric Circuits',
  capsWeight: 15,
  sections: [
    {
      id: 'coming-soon',
      title: 'Electric Circuits',
      blocks: [
        {
          type: 'theory',
          title: 'Full Notes Coming Soon',
          body: `Full notes for this topic are coming soon. In the meantime, watch the Mindset Learn video below.

This topic covers:
• **Current** - Flow of charge, measured in amperes (A)
• **Potential Difference (Voltage)** - Energy per unit charge, measured in volts (V)
• **Resistance** - Opposition to current flow, measured in ohms (Ω)
• **Ohm's Law** - $V = IR$
• **Series Circuits** - Same current, voltages add up
• **Parallel Circuits** - Same voltage, currents add up
• **Resistors in Series and Parallel** - Calculating total resistance
• **Power** - $P = VI = I^2R = \\frac{V^2}{R}$`
        },
        {
          type: 'video',
          title: 'Watch: Electric Circuits — Mindset Learn',
          videoId: 'MINDSET_ELECTRIC_CIRCUITS_GR10'
        }
      ]
    }
  ]
}

export default electricCircuitsGr10
