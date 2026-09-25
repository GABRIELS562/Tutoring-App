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
  capsWeight: 3.75,
  // Curated per CAPS sub-topic — see docs/curriculum/ and scripts/curate-videos.ts
  sections: [
    {
      id: 'overview',
      title: 'Optical Phenomena and Properties of Materials',
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
      blocks: [
        {
          type: 'video',
          title: 'Watch: Photoelectric effect Grade 12 | Part 1 — Kevinmathscience',
          videoId: '_hKMDg2Wuq0'
        }
      ]
    },
    {
      id: 'work-function-cut-off-frequency-and-the-photo-el',
      title: 'Work function, cut-off frequency and the photo-electric equation',
      blocks: [
        {
          type: 'video',
          title: 'Watch: Threshold Frequency and Work Function Grade 12 Photoelectric Effect — Miss Martins Maths and Science',
          videoId: 'IHo22w2SG9A'
        }
      ]
    },
    {
      id: 'intensity-frequency-and-the-number-of-electrons-',
      title: 'Intensity, frequency and the number of electrons ejected',
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
      blocks: [
        {
          type: 'video',
          title: 'Watch: Energy Level Transitions (for Emission and Absorption Spectra) — Simple Science',
          videoId: '5ahrdgZqQbg'
        }
      ]
    },
    {
      id: 'emission-versus-absorption-spectra',
      title: 'Emission versus absorption spectra',
      blocks: [
        {
          type: 'video',
          title: 'Watch: Absorption Spectra — Simple Science',
          videoId: 'hA27-yKJuNM'
        }
      ]
    }
  ]
}

export default opticalPhenomenaGr12
