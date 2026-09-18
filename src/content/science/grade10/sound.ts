import type { TopicContent } from '@/types'

export const soundGr10: TopicContent = {
  id: 'sound-gr10',
  slug: 'sound-gr10',
  subject: 'science',
  grade: 10,
  paper: 1,
  title: 'Sound',
  capsWeight: 10,
  sections: [
    {
      id: 'coming-soon',
      title: 'Sound',
      blocks: [
        {
          type: 'theory',
          title: 'What this topic covers',
          body: `• **Longitudinal Waves** - Compressions and rarefactions
• **Sound Production** - Vibrating objects creating sound
• **Sound Propagation** - Requires a medium (solid, liquid, gas)
• **Speed of Sound** - Different in different media
• **Pitch and Frequency** - Higher frequency = higher pitch
• **Loudness and Amplitude** - Greater amplitude = louder sound
• **Ultrasound** - Applications in medicine and industry`
        },
        // PROVISIONAL video picks — auto-filled 2026-09-18 from docs/client-updates/video-candidates; client to confirm.
        {
          type: 'video',
          title: 'Watch: Grade 10 Physics Sound waves — Miss Martins Maths and Science',
          videoId: '4IpqrR4vqOw',
          videoIdAf: 'Ye7QmYuHeBE',
          titleAf: 'Watch: Gr 10 Fisiese Wetenskappe Longitudinale Golwe - Janiena Daubert — Hoërskool Noordheuwel'
        },
        {
          type: 'video',
          title: 'Watch: 5) Sound Waves Grade 10 — Kevinmathscience',
          videoId: '1u5GSxuSj7A'
        }
        // TODO(curator): add { type: 'formula', formulas: [...] } block
      ]
    }
  ]
}

export default soundGr10
