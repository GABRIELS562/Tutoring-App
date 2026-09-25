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
  titleAf: 'Meganika',
  capsWeight: 17.5,
  // Curated per CAPS sub-topic — see docs/curriculum/ and scripts/curate-videos.ts
  sections: [
    {
      id: 'overview',
      title: 'Mechanics',
      titleAf: 'Meganika',
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
      titleAf: 'Momentum en die vektoraard daarvan',
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
      titleAf: 'Newton se tweede wet in terme van momentum',
      blocks: [
        {
          type: 'video',
          title: 'Watch: Grade 12 momentum Newtons second law in terms of momentum — Miss Martins Maths and Science',
          videoId: 'yDoQnWeNU4k',
          videoIdAf: 'iXF_7-EjS9w'
        }
      ]
    },
    {
      id: 'conservation-of-momentum',
      title: 'Conservation of momentum',
      titleAf: 'Behoud van momentum',
      blocks: [
        {
          type: 'video',
          title: 'Watch: 4) Linear Momentum Conservation | Intro — Kevinmathscience',
          videoId: 'BLOcAfK2xq8',
          videoIdAf: 'XrGaqWTueOQ'
        }
      ]
    },
    {
      id: 'elastic-and-inelastic-collisions',
      title: 'Elastic and inelastic collisions',
      titleAf: 'Elastiese en onelastiese botsings',
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
      titleAf: 'Impuls en die impuls-momentum-stelling',
      blocks: [
        {
          type: 'video',
          title: 'Watch: Grade 12 Impulse and impulse momentum theorem — Miss Martins Maths and Science',
          videoId: 'SSUo3FSQCD8',
          videoIdAf: 'szBVJIBS4HE'
        }
      ]
    },
    {
      id: 'vertical-projectile-motion-equations-of-motion',
      title: 'Vertical projectile motion: equations of motion',
      titleAf: 'Vertikale projektielbeweging: bewegingsvergelykings',
      blocks: [
        {
          type: 'video',
          title: 'Watch: 1) Vertical projectile motion introduction — Kevinmathscience',
          videoId: 'gSdX5US3mm0',
          videoIdAf: 'G02o72zDL0c'
        }
      ]
    },
    {
      id: 'graphs-of-vertical-projectile-motion-x-t-v-t-and',
      title: 'Graphs of vertical projectile motion (x-t, v-t and a-t)',
      titleAf: 'Grafieke van vertikale projektielbeweging (x-t, v-t en a-t)',
      blocks: [
        {
          type: 'video',
          title: 'Watch: 2) Vertical projectile motion calculations — Kevinmathscience',
          videoId: 'FSt53TnJ6xM',
          videoIdAf: 'KZtGnXvpJz0'
        }
      ]
    },
    {
      id: 'work-done-by-a-force',
      title: 'Work done by a force',
      titleAf: 'Arbeid verrig deur \'n krag',
      blocks: [
        {
          type: 'video',
          title: 'Watch: Grade 12 work energy and power : What is work? — Kevinmathscience',
          videoId: 'HT34ge6EZgE',
          videoIdAf: 'D_uuoHCa30c'
        }
      ]
    },
    {
      id: 'the-work-energy-theorem',
      title: 'The work-energy theorem',
      titleAf: 'Die arbeid-energie-stelling',
      blocks: [
        {
          type: 'video',
          title: 'Watch: Grade 12 work energy and power : Work energy theorem — Kevinmathscience',
          videoId: 'RAghwed1-ss',
          videoIdAf: 'dmw6A4kkzwQ'
        }
      ]
    },
    {
      id: 'conservation-of-energy-with-non-conservative-for',
      title: 'Conservation of energy with non-conservative forces present',
      titleAf: 'Behoud van energie met nie-konserwatiewe kragte teenwoordig',
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
      titleAf: 'Drywing',
      blocks: [
        {
          type: 'video',
          title: 'Watch: Grade 12 work energy and power : Work practice questions — Kevinmathscience',
          videoId: 'GJ_-5Fxt-ok',
          videoIdAf: 'RNQmaj__ri8'
        }
      ]
    }
  ]
}

export default mechanicsGr12
