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
          type: 'tip',
          body: `We haven't found a CAPS video for this sub-topic yet. Ask Angelo if you're stuck on it.`,
          bodyAf: `Ons het nog nie 'n KABV-video vir hierdie onderafdeling gekry nie. Vra vir Angelo as jy vashaak.`
        }
      ]
    },
    {
      id: 'snell-s-law',
      title: 'Snell\'s Law',
      blocks: [
        {
          type: 'video',
          title: 'Watch: Refraction Calculations: Snells Law — Mindset',
          videoId: 'X-sTSkNzGVk'
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
          type: 'tip',
          body: `We haven't found a CAPS video for this sub-topic yet. Ask Angelo if you're stuck on it.`,
          bodyAf: `Ons het nog nie 'n KABV-video vir hierdie onderafdeling gekry nie. Vra vir Angelo as jy vashaak.`
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
