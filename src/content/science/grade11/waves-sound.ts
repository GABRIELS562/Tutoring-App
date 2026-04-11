import type { TopicContent } from '@/types'

export const wavesSoundGr11: TopicContent = {
  id: 'waves-sound-gr11',
  slug: 'waves-sound-gr11',
  subject: 'science',
  grade: 11,
  paper: 1,
  title: 'Waves and Sound',
  capsWeight: 15,
  sections: [
    {
      id: 'coming-soon',
      title: 'Waves and Sound',
      blocks: [
        {
          type: 'theory',
          title: 'Full Notes Coming Soon',
          body: `Full notes for this topic are coming soon. In the meantime, watch the Mindset Learn video below.

This topic covers:
• **Wave Properties** - Amplitude, wavelength, frequency, period
• **Wave Equation** - $v = f\\lambda$
• **Transverse and Longitudinal Waves** - Differences and examples
• **Sound Waves** - Production, propagation, speed of sound
• **Doppler Effect** - Change in frequency due to relative motion
• **Applications of Doppler Effect** - Speed traps, medical imaging, astronomy
• **Superposition and Interference** - Constructive and destructive interference`
        },
        {
          type: 'video',
          title: 'Watch: Waves and Sound — Mindset Learn',
          videoId: 'MINDSET_WAVES_SOUND_GR11'
        }
      ]
    }
  ]
}

export default wavesSoundGr11
