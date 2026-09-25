import type { TopicContent } from '@/types'

// Scaffolded from the CAPS Physical Sciences curriculum
// (src/content/caps-science-curriculum.ts). One section per sub-topic;
// videos are filled by scripts/apply-curated-videos.ts.
export const mechanicsGr12: TopicContent = {
  id: 'mechanics-gr12',
  slug: 'mechanics-gr12',
  subject: 'science',
  grade: 12,
  paper: 1,
  title: 'Mechanics',
  capsWeight: 17.5,
  // Curated per CAPS sub-topic — see docs/curriculum/ and scripts/curate-videos.ts
  sections: [
    {
      id: 'overview',
      title: 'Mechanics',
      blocks: [
        {
          type: 'theory',
          title: 'What this topic covers',
          titleAf: 'Wat hierdie onderwerp dek',
          body: `• Momentum and its vector nature
• Newton's second law in terms of momentum
• Conservation of momentum
• Elastic and inelastic collisions
• Impulse and the impulse-momentum theorem
• Vertical projectile motion: equations of motion
• Graphs of vertical projectile motion (x-t, v-t and a-t)
• Work done by a force
• The work-energy theorem
• Conservation of energy with non-conservative forces present
• Power`
        }
      ]
    },
    {
      id: 'momentum-and-its-vector-nature',
      title: 'Momentum and its vector nature',
      blocks: [
        {
          type: 'video',
          title: 'Watch: Vector nature of Momentum: Momentum Vector Diagrams — Miss Martins Maths and Science',
          videoId: 'T-Rkyifd_54'
        }
      ]
    },
    {
      id: 'newton-s-second-law-in-terms-of-momentum',
      title: 'Newton\'s second law in terms of momentum',
      blocks: [
        {
          type: 'video',
          title: 'Watch: Grade 12 momentum Newtons second law in terms of momentum — Miss Martins Maths and Science',
          videoId: 'yDoQnWeNU4k'
        }
      ]
    },
    {
      id: 'conservation-of-momentum',
      title: 'Conservation of momentum',
      blocks: [
        {
          type: 'video',
          title: 'Watch: 4) Linear Momentum Conservation | Intro — Kevinmathscience',
          videoId: 'BLOcAfK2xq8'
        }
      ]
    },
    {
      id: 'elastic-and-inelastic-collisions',
      title: 'Elastic and inelastic collisions',
      blocks: [
        {
          type: 'video',
          title: 'Watch: 5)Elastic Inelastic Collisions | Intro part 1 — Kevinmathscience',
          videoId: '9mfzOT04eHM'
        }
      ]
    },
    {
      id: 'impulse-and-the-impulse-momentum-theorem',
      title: 'Impulse and the impulse-momentum theorem',
      blocks: [
        {
          type: 'video',
          title: 'Watch: Grade 12 Impulse and impulse momentum theorem — Miss Martins Maths and Science',
          videoId: 'SSUo3FSQCD8'
        }
      ]
    },
    {
      id: 'vertical-projectile-motion-equations-of-motion',
      title: 'Vertical projectile motion: equations of motion',
      blocks: [
        {
          type: 'video',
          title: 'Watch: 1) Vertical projectile motion introduction — Kevinmathscience',
          videoId: 'gSdX5US3mm0'
        }
      ]
    },
    {
      id: 'graphs-of-vertical-projectile-motion-x-t-v-t-and',
      title: 'Graphs of vertical projectile motion (x-t, v-t and a-t)',
      blocks: [
        {
          type: 'video',
          title: 'Watch: 2) Vertical projectile motion calculations — Kevinmathscience',
          videoId: 'FSt53TnJ6xM'
        }
      ]
    },
    {
      id: 'work-done-by-a-force',
      title: 'Work done by a force',
      blocks: [
        {
          type: 'video',
          title: 'Watch: Grade 12 work energy and power : What is work? — Kevinmathscience',
          videoId: 'HT34ge6EZgE'
        }
      ]
    },
    {
      id: 'the-work-energy-theorem',
      title: 'The work-energy theorem',
      blocks: [
        {
          type: 'video',
          title: 'Watch: Grade 12 work energy and power : Work energy theorem — Kevinmathscience',
          videoId: 'RAghwed1-ss'
        }
      ]
    },
    {
      id: 'conservation-of-energy-with-non-conservative-for',
      title: 'Conservation of energy with non-conservative forces present',
      blocks: [
        {
          type: 'video',
          title: 'Watch: Physics | Momentum | Conservation of linear momentum (Made easy) — Mlungisi Nkosi Maths & Science',
          videoId: 'QAURZq43508'
        }
      ]
    },
    {
      id: 'power',
      title: 'Power',
      blocks: [
        {
          type: 'video',
          title: 'Watch: Grade 12 work energy and power : Work practice questions — Kevinmathscience',
          videoId: 'GJ_-5Fxt-ok'
        }
      ]
    }
  ]
}

export default mechanicsGr12
