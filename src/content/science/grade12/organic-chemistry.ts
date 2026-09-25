import type { TopicContent } from '@/types'

// Scaffolded from the CAPS Physical Sciences curriculum
// (src/content/caps-science-curriculum.ts). One section per sub-topic;
// videos are filled by scripts/apply-curated-videos.ts.
export const organicChemistryGr12: TopicContent = {
  id: 'organic-chemistry-gr12',
  slug: 'organic-chemistry-gr12',
  subject: 'science',
  grade: 12,
  paper: 2,
  title: 'Organic Chemistry',
  capsWeight: 11.5,
  // Curated per CAPS sub-topic — see docs/curriculum/ and scripts/curate-videos.ts
  sections: [
    {
      id: 'overview',
      title: 'Organic Chemistry',
      blocks: [
        {
          type: 'theory',
          title: 'What this topic covers',
          titleAf: 'Wat hierdie onderwerp dek',
          body: `• Organic molecules: functional groups, saturated and unsaturated structures
• Structural isomers: chain, positional and functional
• IUPAC naming and formulae of organic compounds
• Physical properties and intermolecular forces of organic compounds
• Combustion of alkanes and the preparation of esters
• Addition reactions of alkenes
• Elimination reactions and cracking
• Substitution reactions of alkanes, alcohols and haloalkanes
• Addition and condensation polymerisation: plastics and polymers`
        }
      ]
    },
    {
      id: 'organic-molecules-functional-groups-saturated-an',
      title: 'Organic molecules: functional groups, saturated and unsaturated structures',
      blocks: [
        {
          type: 'video',
          title: 'Watch: Grade 12 Organic Chemistry Physical Properties and Structure PART 2: IMF & Type of Functional Group — Miss Martins Maths and Science',
          videoId: 'bN3MteumaTQ'
        }
      ]
    },
    {
      id: 'structural-isomers-chain-positional-and-function',
      title: 'Structural isomers: chain, positional and functional',
      blocks: [
        {
          type: 'video',
          title: 'Watch: Isomers Organic Chemistry Grade 12 — Kevinmathscience',
          videoId: 'Kis0W4iOZr8'
        }
      ]
    },
    {
      id: 'iupac-naming-and-formulae-of-organic-compounds',
      title: 'IUPAC naming and formulae of organic compounds',
      blocks: [
        {
          type: 'video',
          title: 'Watch: Grade 12 Organic chemistry: Naming alkanes- Branched alkanes (IUPAC naming) — Miss Martins Maths and Science',
          videoId: 'GELIVV8JO3A'
        }
      ]
    },
    {
      id: 'physical-properties-and-intermolecular-forces-of',
      title: 'Physical properties and intermolecular forces of organic compounds',
      blocks: [
        {
          type: 'video',
          title: 'Watch: Chemistry | Intermolecular forces | Physical properties of organic compound — Mlungisi Nkosi Maths & Science',
          videoId: 'ameAElR0Pac'
        }
      ]
    },
    {
      id: 'combustion-of-alkanes-and-the-preparation-of-est',
      title: 'Combustion of alkanes and the preparation of esters',
      blocks: [
        {
          type: 'tip',
          body: `We haven't found a CAPS video for this sub-topic yet. Ask Angelo if you're stuck on it.`,
          bodyAf: `Ons het nog nie 'n KABV-video vir hierdie onderafdeling gekry nie. Vra vir Angelo as jy vashaak.`
        }
      ]
    },
    {
      id: 'addition-reactions-of-alkenes',
      title: 'Addition reactions of alkenes',
      blocks: [
        {
          type: 'tip',
          body: `We haven't found a CAPS video for this sub-topic yet. Ask Angelo if you're stuck on it.`,
          bodyAf: `Ons het nog nie 'n KABV-video vir hierdie onderafdeling gekry nie. Vra vir Angelo as jy vashaak.`
        }
      ]
    },
    {
      id: 'elimination-reactions-and-cracking',
      title: 'Elimination reactions and cracking',
      blocks: [
        {
          type: 'video',
          title: 'Watch: 7  Gr12 Physical Science - Reactions in Organic Chemistry - Cracking Elimination Reaction — JuniorTukkie at the University of Pretoria',
          videoId: '0df8ZNhpfyc'
        }
      ]
    },
    {
      id: 'substitution-reactions-of-alkanes-alcohols-and-h',
      title: 'Substitution reactions of alkanes, alcohols and haloalkanes',
      blocks: [
        {
          type: 'video',
          title: 'Watch: 8  Gr12 Physical Science - Reactions in Organic Chemistry - Halogenation Substitution (Alkane) — JuniorTukkie at the University of Pretoria',
          videoId: 'Akk42dzCxeU'
        }
      ]
    },
    {
      id: 'addition-and-condensation-polymerisation-plastic',
      title: 'Addition and condensation polymerisation: plastics and polymers',
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

export default organicChemistryGr12
