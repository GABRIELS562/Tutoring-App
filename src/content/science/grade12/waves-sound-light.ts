import type { TopicContent } from '@/types'

// Scaffolded from the CAPS Physical Sciences curriculum
// (src/content/caps-science-curriculum.ts). One section per sub-topic;
// videos are filled by scripts/apply-curated-videos.ts.
export const wavesSoundLightGr12: TopicContent = {
  id: 'waves-sound-light-gr12',
  slug: 'waves-sound-light-gr12',
  subject: 'science',
  grade: 12,
  paper: 1,
  title: 'Waves, Sound & Light',
  capsWeight: 3.75,
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
          body: `• The Doppler effect for sound
• Doppler effect calculations for a moving source or moving listener
• Applications of the Doppler effect with ultrasound in medicine
• The Doppler effect with light: red shifts and the expanding universe`
        }
      ]
    },
    {
      id: 'the-doppler-effect-for-sound',
      title: 'The Doppler effect for sound',
      blocks: [
        {
          type: 'video',
          title: 'Watch: Doppler Effect grade 12: Introduction — Kevinmathscience',
          videoId: 'DdS_wVxrPuI'
        }
      ]
    },
    {
      id: 'doppler-effect-calculations-for-a-moving-source-',
      title: 'Doppler effect calculations for a moving source or moving listener',
      blocks: [
        {
          type: 'video',
          title: 'Watch: Doppler Effect grade 12: Red and Blue Shift — Kevinmathscience',
          videoId: 'g4OYz75zZ8w'
        }
      ]
    },
    {
      id: 'applications-of-the-doppler-effect-with-ultrasou',
      title: 'Applications of the Doppler effect with ultrasound in medicine',
      blocks: [
        {
          type: 'tip',
          body: `We haven't found a CAPS video for this sub-topic yet. Ask Angelo if you're stuck on it.`,
          bodyAf: `Ons het nog nie 'n KABV-video vir hierdie onderafdeling gekry nie. Vra vir Angelo as jy vashaak.`
        }
      ]
    },
    {
      id: 'the-doppler-effect-with-light-red-shifts-and-the',
      title: 'The Doppler effect with light: red shifts and the expanding universe',
      blocks: [
        {
          type: 'video',
          title: 'Watch: Doppler Effect grade 12: Simultaneous — Kevinmathscience',
          videoId: 'h9Po4ug3MZ8'
        }
      ]
    }
  ]
}

export default wavesSoundLightGr12
