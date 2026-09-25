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
  capsWeight: 15,
  // Curated per CAPS sub-topic — see docs/curriculum/ and scripts/curate-videos.ts
  sections: [
    {
      id: 'overview',
      title: 'Matter & Materials',
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
      blocks: [
        {
          type: 'video',
          title: 'Watch: Atomic Combinations grade 11 :Lewis diagram # 1 — Kevinmathscience',
          videoId: 'sCkasELDYls'
        }
      ]
    },
    {
      id: 'molecular-shape-and-vsepr-theory',
      title: 'Molecular shape and VSEPR theory',
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
      blocks: [
        {
          type: 'video',
          title: 'Watch: Intermolecular Forces grade 11: Different types — Kevinmathscience',
          videoId: 'esJ-go0-t84'
        }
      ]
    },
    {
      id: 'intermolecular-forces-physical-state-density-mel',
      title: 'Intermolecular forces, physical state, density, melting and boiling points',
      blocks: [
        {
          type: 'video',
          title: 'Watch: Intermolecular Forces grade 11: Introduction # 1 — Kevinmathscience',
          videoId: 'aJTAj_8pyWI'
        }
      ]
    },
    {
      id: 'the-chemistry-of-water-and-its-three-phases',
      title: 'The chemistry of water and its three phases',
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
