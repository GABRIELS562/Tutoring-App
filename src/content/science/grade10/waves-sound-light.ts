import type { TopicContent } from '@/types'

// Scaffolded from the CAPS Physical Sciences curriculum
// (src/content/caps-science-curriculum.ts). One section per sub-topic;
// videos are filled by scripts/apply-curated-videos.ts.
export const wavesSoundLightGr10: TopicContent = {
  id: 'waves-sound-light-gr10',
  slug: 'waves-sound-light-gr10',
  subject: 'science',
  grade: 10,
  paper: 1,
  title: 'Waves, Sound & Light',
  capsWeight: 10,
  // Curated per CAPS sub-topic — see docs/curriculum/ and scripts/curate-videos.ts
  sections: [
    {
      id: 'overview',
      title: 'Waves, Sound & Light',
      blocks: [
        {
          type: 'theory',
          title: 'What this topic covers',
          titleAf: 'Wat hierdie onderwerp dek',
          body: `• Transverse pulses on a string or spring
• Superposition of pulses: constructive and destructive interference
• Transverse waves: wavelength, frequency, period and wave speed
• Longitudinal waves: compressions and rarefactions
• Sound waves and the speed of sound in different media
• Pitch, loudness and quality of sound
• Ultrasound and its medical uses
• Electromagnetic radiation and the electromagnetic spectrum
• The energy of a photon`
        }
      ]
    },
    {
      id: 'transverse-pulses-on-a-string-or-spring',
      title: 'Transverse pulses on a string or spring',
      blocks: [
        {
          type: 'video',
          title: 'Watch: Grade 10 Transverse Pulses and the Principle of superposition — Miss Martins Maths and Science',
          videoId: 'C3n4cqNpHto'
        }
      ]
    },
    {
      id: 'superposition-of-pulses-constructive-and-destruc',
      title: 'Superposition of pulses: constructive and destructive interference',
      blocks: [
        {
          type: 'video',
          title: 'Watch: 2) Superposition Principle Grade 10 — Kevinmathscience',
          videoId: 'ZRuUcdQl91k'
        }
      ]
    },
    {
      id: 'transverse-waves-wavelength-frequency-period-and',
      title: 'Transverse waves: wavelength, frequency, period and wave speed',
      blocks: [
        {
          type: 'video',
          title: 'Watch: Grade 10 Physics Transverse waves Period and Frequency — Miss Martins Maths and Science',
          videoId: '4vDk3W66s5I'
        }
      ]
    },
    {
      id: 'longitudinal-waves-compressions-and-rarefactions',
      title: 'Longitudinal waves: compressions and rarefactions',
      blocks: [
        {
          type: 'video',
          title: 'Watch: 4) Longitudinal  Waves Grade 10 — Kevinmathscience',
          videoId: '9sP74zJKcIQ'
        }
      ]
    },
    {
      id: 'sound-waves-and-the-speed-of-sound-in-different-',
      title: 'Sound waves and the speed of sound in different media',
      blocks: [
        {
          type: 'video',
          title: 'Watch: Grade 10 Physics Wave Speed — Miss Martins Maths and Science',
          videoId: '3uLSchY75B0'
        }
      ]
    },
    {
      id: 'pitch-loudness-and-quality-of-sound',
      title: 'Pitch, loudness and quality of sound',
      blocks: [
        {
          type: 'video',
          title: 'Watch: Loudness and Pitch: Grade 10 Waves and Light — Mindset',
          videoId: 'h5kPzCQYhyY'
        }
      ]
    },
    {
      id: 'ultrasound-and-its-medical-uses',
      title: 'Ultrasound and its medical uses',
      blocks: [
        {
          type: 'tip',
          body: `We haven't found a CAPS video for this sub-topic yet. Ask Angelo if you're stuck on it.`,
          bodyAf: `Ons het nog nie 'n KABV-video vir hierdie onderafdeling gekry nie. Vra vir Angelo as jy vashaak.`
        }
      ]
    },
    {
      id: 'electromagnetic-radiation-and-the-electromagneti',
      title: 'Electromagnetic radiation and the electromagnetic spectrum',
      blocks: [
        {
          type: 'video',
          title: 'Watch: Grade 10 Physics - Electromagnetic Spectrum — Kevin\'s Classroom',
          videoId: 'OtaVlik8nuo'
        }
      ]
    },
    {
      id: 'the-energy-of-a-photon',
      title: 'The energy of a photon',
      blocks: [
        {
          type: 'tip',
          body: `We haven't found a CAPS video for this sub-topic yet. Ask Angelo if you're stuck on it.`,
          bodyAf: `Ons het nog nie 'n KABV-video vir hierdie onderafdeling gekry nie. Vra vir Angelo as jy vashaak.`
        }
      ]
    }
  ]
}

export default wavesSoundLightGr10
