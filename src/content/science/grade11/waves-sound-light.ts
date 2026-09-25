import type { TopicContent } from '@/types'

// Scaffolded from the CAPS Physical Sciences curriculum
// (src/content/caps-science-curriculum.ts). One section per sub-topic;
// videos are filled by scripts/apply-curated-videos.ts.
export const wavesSoundLightGr11: TopicContent = {
  id: 'waves-sound-light-gr11',
  slug: 'waves-sound-light-gr11',
  subject: 'science',
  grade: 11,
  paper: 1,
  title: 'Waves, Sound & Light',
  capsWeight: 8.13,
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
          body: `• Refraction and refractive index
• Snell's Law
• Critical angle and total internal reflection
• Wavefronts and Huygens' principle
• Diffraction through a single slit`
        }
      ]
    },
    {
      id: 'refraction-and-refractive-index',
      title: 'Refraction and refractive index',
      blocks: [
        {
          type: 'video',
          title: 'Watch: Refraction Snells Law Refractive Index Grade 11 Physical Science Past Paper — Khoza Explains',
          videoId: 'inQOyag5zI8'
        }
      ]
    },
    {
      id: 'snell-s-law',
      title: 'Snell\'s Law',
      blocks: [
        {
          type: 'video',
          title: 'Watch: Grade 11 - Waves, Sound, and Light | Geometric Optics (Snell’s Law) | November 2017 | Mlungisi Nkosi — Mlungisi Nkosi Maths & Science',
          videoId: 'TnZTq6EFaAk'
        }
      ]
    },
    {
      id: 'critical-angle-and-total-internal-reflection',
      title: 'Critical angle and total internal reflection',
      blocks: [
        {
          type: 'video',
          title: 'Watch: 07 Applications of Total Internal Reflection — Mindset',
          videoId: 'LQMIxwTx3qI'
        }
      ]
    },
    {
      id: 'wavefronts-and-huygens-principle',
      title: 'Wavefronts and Huygens\' principle',
      blocks: [
        {
          type: 'video',
          title: 'Watch: Huygens\' Principle and Diffraction of Waves - Science Grade 11 and 12 — Mindset',
          videoId: 'vqa4L0DuWbM'
        }
      ]
    },
    {
      id: 'diffraction-through-a-single-slit',
      title: 'Diffraction through a single slit',
      blocks: [
        {
          type: 'video',
          title: 'Watch: Diffraction — Mindset',
          videoId: 'FahppoRvRDc'
        }
      ]
    }
  ]
}

export default wavesSoundLightGr11
