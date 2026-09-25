import type { TopicContent } from '@/types'

// Scaffolded from the CAPS Physical Sciences curriculum
// (src/content/caps-science-curriculum.ts). One section per sub-topic;
// videos are filled by scripts/apply-curated-videos.ts.
export const electricityMagnetismGr10: TopicContent = {
  id: 'electricity-magnetism-gr10',
  slug: 'electricity-magnetism-gr10',
  subject: 'science',
  grade: 10,
  paper: 1,
  title: 'Electricity & Magnetism',
  capsWeight: 8.75,
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
          body: `• Magnetic fields and magnetic field lines of permanent magnets
• The Earth's magnetic field and the compass
• Two kinds of charge, charging by contact and polarisation
• Conservation and quantisation of charge
• Potential difference, emf and terminal potential difference
• Current, and measuring current and voltage in a circuit
• Resistance and the factors that affect it
• Resistors in series
• Resistors in parallel`
        }
      ]
    },
    {
      id: 'magnetic-fields-and-magnetic-field-lines-of-perm',
      title: 'Magnetic fields and magnetic field lines of permanent magnets',
      blocks: [
        {
          type: 'content_gap',
          body: `No CAPS video has been sourced for this sub-topic yet. Ask Angelo if you're stuck on it in the meantime.`,
          bodyAf: `Daar is nog nie 'n KABV-video vir hierdie onderafdeling nie. Vra solank vir Angelo as jy vashaak.`
        }
      ]
    },
    {
      id: 'the-earth-s-magnetic-field-and-the-compass',
      title: 'The Earth\'s magnetic field and the compass',
      blocks: [
        {
          type: 'content_gap',
          body: `No CAPS video has been sourced for this sub-topic yet. Ask Angelo if you're stuck on it in the meantime.`,
          bodyAf: `Daar is nog nie 'n KABV-video vir hierdie onderafdeling nie. Vra solank vir Angelo as jy vashaak.`
        }
      ]
    },
    {
      id: 'two-kinds-of-charge-charging-by-contact-and-pola',
      title: 'Two kinds of charge, charging by contact and polarisation',
      blocks: [
        {
          type: 'video',
          title: 'Watch: Polarisation of Charge: Electrostatic Induction — Mindset',
          videoId: 'kxOPr0r5yc0'
        }
      ]
    },
    {
      id: 'conservation-and-quantisation-of-charge',
      title: 'Conservation and quantisation of charge',
      blocks: [
        {
          type: 'video',
          title: 'Watch: Grade 10 - Electrostatics | Conservation of Charge | Mlungisi Nkosi — Mlungisi Nkosi Maths & Science',
          videoId: '68Mw4MEX_z0'
        }
      ]
    },
    {
      id: 'potential-difference-emf-and-terminal-potential-',
      title: 'Potential difference, emf and terminal potential difference',
      blocks: [
        {
          type: 'content_gap',
          body: `No CAPS video has been sourced for this sub-topic yet. Ask Angelo if you're stuck on it in the meantime.`,
          bodyAf: `Daar is nog nie 'n KABV-video vir hierdie onderafdeling nie. Vra solank vir Angelo as jy vashaak.`
        }
      ]
    },
    {
      id: 'current-and-measuring-current-and-voltage-in-a-c',
      title: 'Current, and measuring current and voltage in a circuit',
      blocks: [
        {
          type: 'content_gap',
          body: `No CAPS video has been sourced for this sub-topic yet. Ask Angelo if you're stuck on it in the meantime.`,
          bodyAf: `Daar is nog nie 'n KABV-video vir hierdie onderafdeling nie. Vra solank vir Angelo as jy vashaak.`
        }
      ]
    },
    {
      id: 'resistance-and-the-factors-that-affect-it',
      title: 'Resistance and the factors that affect it',
      blocks: [
        {
          type: 'video',
          title: 'Watch: Resistance Grade 10 — Kevinmathscience',
          videoId: 'JZJlJ18ggc0'
        }
      ]
    },
    {
      id: 'resistors-in-series',
      title: 'Resistors in series',
      blocks: [
        {
          type: 'video',
          title: 'Watch: Physics | Electricity Circuits Part 1 | Resistors in series — Mlungisi Nkosi Maths & Science',
          videoId: 'LIgyQkUsmWo'
        }
      ]
    },
    {
      id: 'resistors-in-parallel',
      title: 'Resistors in parallel',
      blocks: [
        {
          type: 'video',
          title: 'Watch: Physics | Electric circuits | Resistors in parallel — Mlungisi Nkosi Maths & Science',
          videoId: 'mpQacbiR0BY'
        }
      ]
    }
  ]
}

export default electricityMagnetismGr10
