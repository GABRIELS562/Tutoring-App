import type { TopicContent } from '@/types'

// Scaffolded from the CAPS Physical Sciences curriculum
// (src/content/caps-science-curriculum.ts). One section per sub-topic;
// videos are filled by scripts/apply-curated-videos.ts.
export const electricityMagnetismGr12: TopicContent = {
  id: 'electricity-magnetism-gr12',
  slug: 'electricity-magnetism-gr12',
  subject: 'science',
  grade: 12,
  paper: 1,
  title: 'Electricity & Magnetism',
  capsWeight: 7.5,
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
          body: `• Series and parallel resistor networks
• Internal resistance and emf of a battery
• Circuit calculations with internal resistance and series-parallel networks
• AC and DC generators
• Electric motors
• Alternating current: current and voltage graphs
• rms values and average power in AC circuits`
        }
      ]
    },
    {
      id: 'series-and-parallel-resistor-networks',
      title: 'Series and parallel resistor networks',
      blocks: [
        {
          type: 'tip',
          body: `We haven't found a CAPS video for this sub-topic yet. Ask Angelo if you're stuck on it.`,
          bodyAf: `Ons het nog nie 'n KABV-video vir hierdie onderafdeling gekry nie. Vra vir Angelo as jy vashaak.`
        }
      ]
    },
    {
      id: 'internal-resistance-and-emf-of-a-battery',
      title: 'Internal resistance and emf of a battery',
      blocks: [
        {
          type: 'video',
          title: 'Watch: Physics Revision | Internal Resistance & EMF Explained | Mlungisi Nkosi — Mlungisi Nkosi Maths & Science',
          videoId: 'WiIeeqC5XDQ'
        }
      ]
    },
    {
      id: 'circuit-calculations-with-internal-resistance-an',
      title: 'Circuit calculations with internal resistance and series-parallel networks',
      blocks: [
        {
          type: 'video',
          title: 'Watch: Physics | Electric circuits | EMF and Internal resistance (Made simple) — Mlungisi Nkosi Maths & Science',
          videoId: 'Z6ZyHYLY1N8'
        }
      ]
    },
    {
      id: 'ac-and-dc-generators',
      title: 'AC and DC generators',
      blocks: [
        {
          type: 'video',
          title: 'Watch: Electrodynamics: Motors and generators Physics — Miss Martins Maths and Science',
          videoId: 'RlP97BAez74'
        }
      ]
    },
    {
      id: 'electric-motors',
      title: 'Electric motors',
      blocks: [
        {
          type: 'video',
          title: 'Watch: Electrodynamics Motors SUMMARY Grade 12 Physics — Miss Martins Maths and Science',
          videoId: 'g-9GARYLfKQ'
        }
      ]
    },
    {
      id: 'alternating-current-current-and-voltage-graphs',
      title: 'Alternating current: current and voltage graphs',
      blocks: [
        {
          type: 'video',
          title: 'Watch: Physics | Electric Circuits | Voltage vs Current graphs — Mlungisi Nkosi Maths & Science',
          videoId: 'Vg8Tu668af8'
        }
      ]
    },
    {
      id: 'rms-values-and-average-power-in-ac-circuits',
      title: 'rms values and average power in AC circuits',
      blocks: [
        {
          type: 'tip',
          body: `We haven't found a CAPS video for this sub-topic yet. Ask Angelo if you're stuck on it.`,
          bodyAf: `Ons het nog nie 'n KABV-video vir hierdie onderafdeling gekry nie. Vra vir Angelo as jy vashaak.`
        }
      ]
    }
  ]
}

export default electricityMagnetismGr12
