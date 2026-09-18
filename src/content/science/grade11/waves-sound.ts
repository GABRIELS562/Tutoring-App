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
          title: 'What this topic covers',
          body: `• **Wave Properties** - Amplitude, wavelength, frequency, period
• **Wave Equation** - $v = f\\lambda$
• **Transverse and Longitudinal Waves** - Differences and examples
• **Sound Waves** - Production, propagation, speed of sound
• **Doppler Effect** - Change in frequency due to relative motion
• **Applications of Doppler Effect** - Speed traps, medical imaging, astronomy
• **Superposition and Interference** - Constructive and destructive interference`
        },
        // PROVISIONAL video picks — auto-filled 2026-09-18 from docs/client-updates/video-candidates; client to confirm.
        {
          type: 'video',
          title: 'Watch: Grade 11 - Diffraction | Huygen’s Principle & Wavefronts | November 2017 | Mlungisi Nkosi — Mlungisi Nkosi Maths & Science',
          videoId: 'KXRnmQGweJE',
          videoIdAf: '4r76JWyXLnw',
          titleAf: 'Watch: Hoe om vir Graad 11 Fisiese Wetenskap te leer — Juf. OK se Wetenskap Akademie'
        },
        {
          type: 'video',
          title: 'Watch: 2D & 3D Wavefronts — Mindset',
          videoId: 'IQ_HH68wmHw'
        }
        // TODO(curator): add { type: 'formula', formulas: [...] } block
      ]
    }
  ]
}

export default wavesSoundGr11
