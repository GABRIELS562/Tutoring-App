import type { TopicContent } from '@/types'

export const emRadiationGr10: TopicContent = {
  id: 'em-radiation-gr10',
  slug: 'em-radiation-gr10',
  subject: 'science',
  grade: 10,
  paper: 1,
  title: 'Electromagnetic Radiation',
  capsWeight: 10,
  sections: [
    {
      id: 'coming-soon',
      title: 'Electromagnetic Radiation',
      blocks: [
        {
          type: 'theory',
          title: 'Full Notes Coming Soon',
          body: `Full notes for this topic are coming soon. In the meantime, watch the Mindset Learn video below.

This topic covers:
• **EM Spectrum** - Radio, microwave, infrared, visible, UV, X-ray, gamma
• **Properties of EM Waves** - Travel at speed of light, don't need a medium
• **Wavelength and Frequency** - Relationship across the spectrum
• **Energy and Frequency** - Higher frequency = more energy
• **Applications** - Uses of each type of EM radiation
• **Dangers** - Harmful effects of high-energy EM radiation
• **The Particle Nature of Light** - Photons and wave-particle duality`
        },
        {
          type: 'video',
          title: 'Watch: Electromagnetic Radiation — Mindset Learn',
          videoId: 'MINDSET_EM_RADIATION_GR10'
        }
      ]
    }
  ]
}

export default emRadiationGr10
