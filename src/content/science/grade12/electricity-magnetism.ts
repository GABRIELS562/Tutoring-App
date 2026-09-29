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
  titleAf: 'Elektrisiteit en Magnetisme',
  capsWeight: 7.5,
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
      titleAf: 'Serie- en parallelweerstandsnetwerke',
      blocks: [
        {
          type: 'video',
          title: 'Kyk: Gr. 12 Fisika: Elektrisiteit (interne weerstand) | die ENIGSTE video wat jy nodig het! — Danike Aucamp_Wiskunde en Wetenskap ',
          videoIdAf: '1lpHeTHZI6E',
          titleAf: 'Kyk: Gr. 12 Fisika: Elektrisiteit (interne weerstand) | die ENIGSTE video wat jy nodig het! — Danike Aucamp_Wiskunde en Wetenskap '
        }
      ]
    },
    {
      id: 'internal-resistance-and-emf-of-a-battery',
      title: 'Internal resistance and emf of a battery',
      titleAf: 'Interne weerstand en emk van \'n battery',
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
      titleAf: 'Stroombaanberekeninge met interne weerstand en serie-parallelnetwerke',
      blocks: [
        {
          type: 'video',
          title: 'Watch: Physics | Electric circuits | EMF and Internal resistance (Made simple) — Mlungisi Nkosi Maths & Science',
          videoId: 'Z6ZyHYLY1N8',
          videoIdAf: 'iMeyrFFJy60',
          titleAf: 'Kyk: Stroombane 2 (sonder interne weerstand) — WSILAB'
        }
      ]
    },
    {
      id: 'ac-and-dc-generators',
      title: 'AC and DC generators',
      titleAf: 'WS- en GS-generators',
      blocks: [
        {
          type: 'video',
          title: 'Watch: Electrodynamics: Motors and generators Physics — Miss Martins Maths and Science',
          videoId: 'RlP97BAez74',
          videoIdAf: 'gPb7fO3NLwA',
          titleAf: 'Kyk: Gr. 12 Fisika: Elektrodinamika Generators in \'n NEUTEDOP — Danike Aucamp_Wiskunde en Wetenskap '
        }
      ]
    },
    {
      id: 'electric-motors',
      title: 'Electric motors',
      titleAf: 'Elektriese motors',
      blocks: [
        {
          type: 'video',
          title: 'Watch: Electrodynamics Motors SUMMARY Grade 12 Physics — Miss Martins Maths and Science',
          videoId: 'g-9GARYLfKQ',
          videoIdAf: 'u7X759MljIs',
          titleAf: 'Kyk: Elektriese motors: Wisselstroom- en Gelykstroommotors Graad 12 Fisika — Ekstra Wetenskap Klasse'
        }
      ]
    },
    {
      id: 'alternating-current-current-and-voltage-graphs',
      title: 'Alternating current: current and voltage graphs',
      titleAf: 'Wisselstroom: stroom- en spanningsgrafieke',
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
      titleAf: 'Wgk-waardes en gemiddelde drywing in wisselstroombane',
      blocks: [
        {
          type: 'content_gap',
          body: `No CAPS video has been sourced for this sub-topic yet. Ask Angelo if you're stuck on it in the meantime.`,
          bodyAf: `Daar is nog nie 'n KABV-video vir hierdie onderafdeling nie. Vra solank vir Angelo as jy vashaak.`
        }
      ]
    }
  ]
}

export default electricityMagnetismGr12
