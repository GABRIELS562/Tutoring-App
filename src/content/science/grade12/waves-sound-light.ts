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
  titleAf: 'Golwe, Klank en Lig',
  capsWeight: 3.75,
  // Curated per CAPS sub-topic — see docs/curriculum/ and scripts/curate-videos.ts
  sections: [
    {
      id: 'overview',
      title: 'Waves, Sound & Light',
      titleAf: 'Golwe, Klank en Lig',
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
      titleAf: 'Die Doppler-effek vir klank',
      blocks: [
        {
          type: 'video',
          title: 'Watch: Doppler Effect grade 12: Introduction — Kevinmathscience',
          videoId: 'DdS_wVxrPuI',
          videoIdAf: '_oqI8mOrg84'
        }
      ]
    },
    {
      id: 'doppler-effect-calculations-for-a-moving-source-',
      title: 'Doppler effect calculations for a moving source or moving listener',
      titleAf: 'Doppler-effek-berekeninge vir \'n bewegende bron of bewegende luisteraar',
      blocks: [
        {
          type: 'video',
          title: 'Watch: Doppler Effect grade 12: Red and Blue Shift — Kevinmathscience',
          videoId: 'g4OYz75zZ8w',
          videoIdAf: 'wJn76p15F9s'
        }
      ]
    },
    {
      id: 'applications-of-the-doppler-effect-with-ultrasou',
      title: 'Applications of the Doppler effect with ultrasound in medicine',
      titleAf: 'Toepassings van die Doppler-effek met ultraklank in die medisyne',
      blocks: [
        {
          type: 'content_gap',
          body: `No CAPS video has been sourced for this sub-topic yet. Ask Angelo if you're stuck on it in the meantime.`,
          bodyAf: `Daar is nog nie 'n KABV-video vir hierdie onderafdeling nie. Vra solank vir Angelo as jy vashaak.`
        }
      ]
    },
    {
      id: 'the-doppler-effect-with-light-red-shifts-and-the',
      title: 'The Doppler effect with light: red shifts and the expanding universe',
      titleAf: 'Die Doppler-effek met lig: rooiverskuiwings en die uitdyende heelal',
      blocks: [
        {
          type: 'video',
          title: 'Watch: Doppler Effect grade 12: Simultaneous — Kevinmathscience',
          videoId: 'h9Po4ug3MZ8',
          videoIdAf: 'VcuIqqDvanY'
        }
      ]
    }
  ]
}

export default wavesSoundLightGr12
