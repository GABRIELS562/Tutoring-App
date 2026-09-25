import type { TopicContent } from '@/types'

// Scaffolded from the CAPS Physical Sciences curriculum
// (src/content/caps-science-curriculum.ts). One section per sub-topic;
// videos are filled by scripts/apply-curated-videos.ts.
export const electricityMagnetismGr11: TopicContent = {
  id: 'electricity-magnetism-gr11',
  slug: 'electricity-magnetism-gr11',
  subject: 'science',
  grade: 11,
  paper: 1,
  title: 'Electricity & Magnetism',
  capsWeight: 12.5,
  // Curated per CAPS sub-topic — see docs/curriculum/ and scripts/curate-videos.ts
  sections: [
    {
      id: 'overview',
      title: 'Electricity & Magnetism',
      blocks: [
        {
          type: 'theory',
          title: 'What this topic covers',
          titleAf: 'Wat hierdie onderwerp dek',
          body: `• Coulomb's Law
• Electric fields and electric field lines
• Calculating the electric field at a point
• Magnetic field associated with current-carrying wires, loops and solenoids
• Faraday's Law of electromagnetic induction
• Ohm's Law and ohmic versus non-ohmic conductors
• Power in electric circuits
• Electrical energy and the cost of electricity`
        }
      ]
    },
    {
      id: 'coulomb-s-law',
      title: 'Coulomb\'s Law',
      blocks: [
        {
          type: 'video',
          title: 'Watch: Coulomb\'s Law Electrostatics grade 11 and 12 — Miss Martins Maths and Science',
          videoId: 'ngfkLMOQDms'
        }
      ]
    },
    {
      id: 'electric-fields-and-electric-field-lines',
      title: 'Electric fields and electric field lines',
      blocks: [
        {
          type: 'video',
          title: 'Watch: Physics | Electrostatics | Electric fields Intesity — Mlungisi Nkosi Maths & Science',
          videoId: 'lNMLhV5KdoE'
        }
      ]
    },
    {
      id: 'calculating-the-electric-field-at-a-point',
      title: 'Calculating the electric field at a point',
      blocks: [
        {
          type: 'video',
          title: 'Watch: Electric Fields Electrostatics grade 11 and 12 summary — Miss Martins Maths and Science',
          videoId: 'ozWaTaCZh_I'
        }
      ]
    },
    {
      id: 'magnetic-field-associated-with-current-carrying-',
      title: 'Magnetic field associated with current-carrying wires, loops and solenoids',
      blocks: [
        {
          type: 'tip',
          body: `We haven't found a CAPS video for this sub-topic yet. Ask Angelo if you're stuck on it.`,
          bodyAf: `Ons het nog nie 'n KABV-video vir hierdie onderafdeling gekry nie. Vra vir Angelo as jy vashaak.`
        }
      ]
    },
    {
      id: 'faraday-s-law-of-electromagnetic-induction',
      title: 'Faraday\'s Law of electromagnetic induction',
      blocks: [
        {
          type: 'video',
          title: 'Watch: Grade 11 Electromagnetism Faraday\'s Law of Electromagnetic Induction — Miss Martins Maths and Science',
          videoId: 'mBVBE-5Ei2c'
        }
      ]
    },
    {
      id: 'ohm-s-law-and-ohmic-versus-non-ohmic-conductors',
      title: 'Ohm\'s Law and ohmic versus non-ohmic conductors',
      blocks: [
        {
          type: 'video',
          title: 'Watch: Ohm\'s Law Grade 11 Electric Circuits (Electricity grade 11 & 12) — Miss Martins Maths and Science',
          videoId: 'Wrx8j7839VI'
        }
      ]
    },
    {
      id: 'power-in-electric-circuits',
      title: 'Power in electric circuits',
      blocks: [
        {
          type: 'video',
          title: 'Watch: Physics | Electric circuits | Energy and Power — Mlungisi Nkosi Maths & Science',
          videoId: 'L_lmMdycVyk'
        }
      ]
    },
    {
      id: 'electrical-energy-and-the-cost-of-electricity',
      title: 'Electrical energy and the cost of electricity',
      blocks: [
        {
          type: 'video',
          title: 'Watch: Grade 11 Electricity: Electrical Energy and Cost of Electricity — Miss Martins Maths and Science',
          videoId: 'GMhNNETXmNs'
        }
      ]
    }
  ]
}

export default electricityMagnetismGr11
