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
          title: 'What this topic covers',
          body: `• **EM Spectrum** - Radio, microwave, infrared, visible, UV, X-ray, gamma
• **Properties of EM Waves** - Travel at speed of light, don't need a medium
• **Wavelength and Frequency** - Relationship across the spectrum
• **Energy and Frequency** - Higher frequency = more energy
• **Applications** - Uses of each type of EM radiation
• **Dangers** - Harmful effects of high-energy EM radiation
• **The Particle Nature of Light** - Photons and wave-particle duality`
        },
        // PROVISIONAL video picks — auto-filled 2026-09-18 from docs/client-updates/video-candidates; client to confirm.
        {
          type: 'video',
          title: 'Watch: Grade 10 Electromagnetic Radiation Physics: Introduction — Miss Martins Maths and Science',
          videoId: 'a4aHyWtV2Kw',
          videoIdAf: 'nxug2Fhnud8',
          titleAf: 'Watch: Gr.10 Formuleblad. Elektromagnetiese golwe. — Douwliena Fourie'
        },
        {
          type: 'video',
          title: 'Watch: Electromagnetic radiation calculations Grade 10 Physics — Miss Martins Maths and Science',
          videoId: 'AAyPp8W9mWw'
        }
        // TODO(curator): add { type: 'formula', formulas: [...] } block
      ]
    }
  ]
}

export default emRadiationGr10
