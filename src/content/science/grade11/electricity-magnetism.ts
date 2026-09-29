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
  titleAf: 'Elektrisiteit en Magnetisme',
  capsWeight: 12.5,
  // Curated per CAPS sub-topic — see docs/curriculum/ and scripts/curate-videos.ts
  sections: [
    {
      id: 'overview',
      title: 'Electricity & Magnetism',
      titleAf: 'Elektrisiteit en Magnetisme',
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
      titleAf: 'Coulomb se wet',
      blocks: [
        {
          type: 'video',
          title: 'Watch: Coulomb\'s Law Electrostatics grade 11 and 12 — Miss Martins Maths and Science',
          videoId: 'ngfkLMOQDms',
          videoIdAf: 'It7YMCQugpg',
          titleAf: 'Kyk: Graad 11 en 12 Fisika: Elektrostatika Coulomb se Wet — Hoërskool Alberton'
        }
      ]
    },
    {
      id: 'electric-fields-and-electric-field-lines',
      title: 'Electric fields and electric field lines',
      titleAf: 'Elektriese velde en elektriese veldlyne',
      blocks: [
        {
          type: 'video',
          title: 'Watch: Physics | Electrostatics | Electric fields Intesity — Mlungisi Nkosi Maths & Science',
          videoId: 'lNMLhV5KdoE',
          videoIdAf: 'ax-hC_X6cNY',
          titleAf: 'Kyk: Elektrostatika (Elektriese veld): Sept 2019 (Vrystaat) se Vraag 7 — HenBot Wetenskap'
        }
      ]
    },
    {
      id: 'calculating-the-electric-field-at-a-point',
      title: 'Calculating the electric field at a point',
      titleAf: 'Berekening van die elektriese veld by \'n punt',
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
      titleAf: 'Magneetveld geassosieer met stroomdraende drade, lusse en solenoïdes',
      blocks: [
        {
          type: 'video',
          title: 'Watch: Electromagnetism grade 11 Lesson 2: Magnetic Flux — Kevinmathscience',
          videoId: 'faxTUQButK0'
        }
      ]
    },
    {
      id: 'faraday-s-law-of-electromagnetic-induction',
      title: 'Faraday\'s Law of electromagnetic induction',
      titleAf: 'Faraday se wet van elektromagnetiese induksie',
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
      titleAf: 'Ohm se wet en ohmiese teenoor nie-ohmiese geleiers',
      blocks: [
        {
          type: 'video',
          title: 'Watch: Ohm\'s Law Grade 11 Electric Circuits (Electricity grade 11 & 12) — Miss Martins Maths and Science',
          videoId: 'Wrx8j7839VI',
          videoIdAf: 'mfGXo-jY_jg',
          titleAf: 'Kyk: Gr.10 Ohm se wet — Douwliena Fourie'
        }
      ]
    },
    {
      id: 'power-in-electric-circuits',
      title: 'Power in electric circuits',
      titleAf: 'Drywing in elektriese stroombane',
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
      titleAf: 'Elektriese energie en die koste van elektrisiteit',
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
