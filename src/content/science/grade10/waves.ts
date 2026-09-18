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
          title: 'What this topic covers',
          body: `• **Pulses** - Single disturbances, amplitude, pulse length
• **Transverse Waves** - Crests, troughs, perpendicular vibration
• **Wave Properties** - Amplitude, wavelength, frequency, period
• **Wave Equation** - $v = f\\lambda$
• **Superposition** - Constructive and destructive interference
• **Standing Waves** - Nodes and antinodes
• **Wave Behaviour** - Reflection, refraction at boundaries`
        },
        // PROVISIONAL video picks — auto-filled 2026-09-18 from docs/client-updates/video-candidates; client to confirm.
        {
          type: 'video',
          title: 'Watch: Grade 10 Transverse Waves Points in phase and points out of phase — Miss Martins Maths and Science',
          videoId: 'PGgeSD7vPOQ',
          videoIdAf: 'fhCoYWh97Nc',
          titleAf: 'Watch: Transversale golwe: Graad 10 Fisika — Ekstra Wetenskap Klasse'
        },
        {
          type: 'video',
          title: 'Watch: Grade 10 Transverse waves Exam question Wavelength — Miss Martins Maths and Science',
          videoId: 'o7BDo4CcQOI'
        }
        // TODO(curator): add { type: 'formula', formulas: [...] } block
      ]
    }
  ]
}

export default wavesGr10
