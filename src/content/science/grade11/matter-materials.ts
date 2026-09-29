import type { TopicContent } from '@/types'

// Scaffolded from the CAPS Physical Sciences curriculum
// (src/content/caps-science-curriculum.ts). One section per sub-topic;
// videos are filled by scripts/apply-curated-videos.ts.
export const matterMaterialsGr11: TopicContent = {
  id: 'matter-materials-gr11',
  slug: 'matter-materials-gr11',
  subject: 'science',
  grade: 11,
  paper: 2,
  title: 'Matter & Materials',
  titleAf: 'Materie en Materiale',
  capsWeight: 15,
  // Curated per CAPS sub-topic — see docs/curriculum/ and scripts/curate-videos.ts
  sections: [
    {
      id: 'overview',
      title: 'Matter & Materials',
      titleAf: 'Materie en Materiale',
      blocks: [
        {
          type: 'theory',
          title: 'What this topic covers',
          titleAf: 'Wat hierdie onderwerp dek',
          body: `• The chemical bond and Lewis diagrams
• Molecular shape and VSEPR theory
• Electronegativity and bond polarity
• Bond energy and bond length
• Types of intermolecular forces
• Intermolecular forces, physical state, density, melting and boiling points
• The chemistry of water and its three phases
• Kinetic theory of gases: temperature, pressure and ideal gas behaviour
• The gas laws and the ideal gas equation`
        }
      ]
    },
    {
      id: 'the-chemical-bond-and-lewis-diagrams',
      title: 'The chemical bond and Lewis diagrams',
      titleAf: 'Die chemiese binding en Lewis-diagramme',
      blocks: [
        {
          type: 'video',
          title: 'Watch: Atomic Combinations grade 11 :Lewis diagram # 1 — Kevinmathscience',
          videoId: 'sCkasELDYls',
          videoIdAf: 'qox7TP5hNT4',
          titleAf: 'Kyk: Gr. 11 Chemie: Lewis-diagramme — Danike Aucamp_Wiskunde en Wetenskap '
        }
      ]
    },
    {
      id: 'molecular-shape-and-vsepr-theory',
      title: 'Molecular shape and VSEPR theory',
      titleAf: 'Molekulêre vorm en VSEPR-teorie',
      blocks: [
        {
          type: 'video',
          title: 'Watch: Molecular shapes VSEPR Theory Grade 11 Chemistry — Miss Martins Maths and Science',
          videoId: 'VBfq02D9Pv0'
        }
      ]
    },
    {
      id: 'electronegativity-and-bond-polarity',
      title: 'Electronegativity and bond polarity',
      titleAf: 'Elektronegatiwiteit en bindingspolariteit',
      blocks: [
        {
          type: 'video',
          title: 'Watch: Electronegativity Grade 11 Chemistry Polarity of Bonds — Miss Martins Maths and Science',
          videoId: 'JFeN3nWano0'
        }
      ]
    },
    {
      id: 'bond-energy-and-bond-length',
      title: 'Bond energy and bond length',
      titleAf: 'Bindingsenergie en bindingslengte',
      blocks: [
        {
          type: 'video',
          title: 'Watch: Grade 11 Chemistry: Bond energy and length: Potential Energy Graph — Miss Martins Maths and Science',
          videoId: '1LKSo15MFKk'
        }
      ]
    },
    {
      id: 'types-of-intermolecular-forces',
      title: 'Types of intermolecular forces',
      titleAf: 'Tipes intermolekulêre kragte',
      blocks: [
        {
          type: 'video',
          title: 'Watch: Intermolecular Forces grade 11: Different types — Kevinmathscience',
          videoId: 'esJ-go0-t84',
          videoIdAf: 'cMW-o3Ai7SU',
          titleAf: 'Kyk: Gr. 11 Chemie: Intermolekulêre kragte | ALLES wat jy moet weet in 10min — Danike Aucamp_Wiskunde en Wetenskap '
        }
      ]
    },
    {
      id: 'intermolecular-forces-physical-state-density-mel',
      title: 'Intermolecular forces, physical state, density, melting and boiling points',
      titleAf: 'Intermolekulêre kragte, fisiese toestand, digtheid, smelt- en kookpunte',
      blocks: [
        {
          type: 'video',
          title: 'Watch: Intermolecular Forces grade 11: Introduction # 1 — Kevinmathscience',
          videoId: 'aJTAj_8pyWI',
          videoIdAf: 'HkWjBev_3hc',
          titleAf: 'Kyk: Gr. 11 Chemie: Die effek van intermolekulêre kragte — Danike Aucamp_Wiskunde en Wetenskap '
        }
      ]
    },
    {
      id: 'the-chemistry-of-water-and-its-three-phases',
      title: 'The chemistry of water and its three phases',
      titleAf: 'Die chemie van water en sy drie fases',
      blocks: [
        {
          type: 'content_gap',
          body: `No CAPS video has been sourced for this sub-topic yet. Ask Angelo if you're stuck on it in the meantime.`,
          bodyAf: `Daar is nog nie 'n KABV-video vir hierdie onderafdeling nie. Vra solank vir Angelo as jy vashaak.`
        }
      ]
    },
    {
      id: 'kinetic-theory-of-gases-temperature-pressure-and',
      title: 'Kinetic theory of gases: temperature, pressure and ideal gas behaviour',
      titleAf: 'Kinetiese teorie van gasse: temperatuur, druk en ideale gasgedrag',
      blocks: [
        {
          type: 'video',
          title: 'Watch: Gas Laws Grade 11: Motion of particles and kinetic theory of gases — Miss Martins Maths and Science',
          videoId: 'NPVQs8BVIL0'
        }
      ]
    },
    {
      id: 'the-gas-laws-and-the-ideal-gas-equation',
      title: 'The gas laws and the ideal gas equation',
      titleAf: 'Die gaswette en die ideale gasvergelyking',
      blocks: [
        {
          type: 'video',
          title: 'Watch: Ideal Gas vs Real Gas: Grade 11 Gas Laws Chemistry — Miss Martins Maths and Science',
          videoId: 's2WWpBzaG28'
        }
      ]
    }
  ]
}

export default matterMaterialsGr11
