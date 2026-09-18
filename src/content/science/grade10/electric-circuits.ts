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
        // PROVISIONAL video picks — auto-filled 2026-09-18 from docs/client-updates/video-candidates; client to confirm.
        {
          type: 'video',
          title: 'Watch: Circuits grade 10 | Part 1 — Kevinmathscience',
          videoId: 'imoShDLnQqE',
          videoIdAf: 'xO7N97B1RB0',
          titleAf: 'Watch: Stroombane: Berekeninge Graad 10 Fisika — Ekstra Wetenskap Klasse'
        },
        {
          type: 'video',
          title: 'Watch: Circuits Grade 10 | Calculations — Kevinmathscience',
          videoId: '5WRqdTr9WmQ'
        }
      ]
    }
  ]
}

export default electricCircuitsGr10
