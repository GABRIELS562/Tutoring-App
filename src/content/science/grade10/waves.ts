import type { TopicContent } from '@/types'

export const wavesGr10: TopicContent = {
  id: 'waves-gr10',
  slug: 'waves-gr10',
  subject: 'science',
  grade: 10,
  paper: 1,
  title: 'Transverse Waves',
  capsWeight: 15,
  sections: [
    {
      id: 'coming-soon',
      title: 'Transverse Waves',
      blocks: [
        {
          type: 'theory',
          title: 'Full Notes Coming Soon',
          body: `Full notes for this topic are coming soon. In the meantime, watch the Mindset Learn video below.

This topic covers:
• **Pulses** - Single disturbances, amplitude, pulse length
• **Transverse Waves** - Crests, troughs, perpendicular vibration
• **Wave Properties** - Amplitude, wavelength, frequency, period
• **Wave Equation** - $v = f\\lambda$
• **Superposition** - Constructive and destructive interference
• **Standing Waves** - Nodes and antinodes
• **Wave Behaviour** - Reflection, refraction at boundaries`
        },
        {
          type: 'video',
          title: 'Watch: Transverse Waves — Mindset Learn',
          videoId: 'MINDSET_WAVES_GR10'
        }
      ]
    }
  ]
}

export default wavesGr10
