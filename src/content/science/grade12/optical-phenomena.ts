import type { TopicContent } from '@/types'

// Scaffolded from the CAPS Physical Sciences curriculum
// (src/content/caps-science-curriculum.ts). One section per sub-topic;
// videos are filled by scripts/apply-curated-videos.ts.
export const opticalPhenomenaGr12: TopicContent = {
  id: 'optical-phenomena-gr12',
  slug: 'optical-phenomena-gr12',
  subject: 'science',
  grade: 12,
  paper: 1,
  title: 'Optical Phenomena and Properties of Materials',
  titleAf: 'Optiese Verskynsels en Eienskappe van Materiale',
  capsWeight: 3.75,
  // Curated per CAPS sub-topic — see docs/curriculum/ and scripts/curate-videos.ts
  sections: [
    {
      id: 'overview',
      title: 'Optical Phenomena and Properties of Materials',
      titleAf: 'Optiese Verskynsels en Eienskappe van Materiale',
      blocks: [
        {
          type: 'theory',
          title: 'What this topic covers',
          titleAf: 'Wat hierdie onderwerp dek',
          body: `• The photo-electric effect
• Work function, cut-off frequency and the photo-electric equation
• Intensity, frequency and the number of electrons ejected
• Atomic emission spectra and electron transitions
• Emission versus absorption spectra`
        }
      ]
    },
    {
      id: 'the-photo-electric-effect',
      title: 'The photo-electric effect',
      titleAf: 'Die foto-elektriese effek',
      blocks: [
        {
          type: 'video',
          title: 'Watch: Photoelectric effect Grade 12 | Part 1 — Kevinmathscience',
          videoId: '_hKMDg2Wuq0',
          videoIdAf: 'ozqyFow1KM0'
        }
      ]
    },
    {
      id: 'work-function-cut-off-frequency-and-the-photo-el',
      title: 'Work function, cut-off frequency and the photo-electric equation',
      titleAf: 'Arbeidsfunksie, drempelfrekwensie en die foto-elektriese vergelyking',
      blocks: [
        {
          type: 'video',
          title: 'Watch: Photoelectric effect Grade 12 | Part 2 — Kevinmathscience',
          videoId: 'OucuEAWiMJo',
          videoIdAf: 'Yp-Wgn8Wt6k'
        }
      ]
    },
    {
      id: 'intensity-frequency-and-the-number-of-electrons-',
      title: 'Intensity, frequency and the number of electrons ejected',
      titleAf: 'Intensiteit, frekwensie en die aantal elektrone wat vrygestel word',
      blocks: [
        {
          type: 'video',
          title: 'Watch: Photoelectric Effect Grade 12 Physics: Photon energy and frequency — Miss Martins Maths and Science',
          videoId: 'SyYsY2yDynM'
        }
      ]
    },
    {
      id: 'atomic-emission-spectra-and-electron-transitions',
      title: 'Atomic emission spectra and electron transitions',
      titleAf: 'Atoomemissiespektrums en elektronoorgange',
      blocks: [
        {
          type: 'video',
          title: 'Watch: Energy Level Transitions (for Emission and Absorption Spectra) — Simple Science',
          videoId: '5ahrdgZqQbg',
          videoIdAf: 'hA27-yKJuNM'
        }
      ]
    },
    {
      id: 'emission-versus-absorption-spectra',
      title: 'Emission versus absorption spectra',
      titleAf: 'Emissie- teenoor absorpsiespektrums',
      blocks: [
        {
          type: 'video',
          title: 'Watch: Absorption Spectra — Simple Science',
          videoId: 'hA27-yKJuNM',
          videoIdAf: '57vcGZzJ1Ug'
        }
      ]
    }
  ]
}

export default opticalPhenomenaGr12
