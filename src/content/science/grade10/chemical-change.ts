import type { TopicContent } from '@/types'

// Scaffolded from the CAPS Physical Sciences curriculum
// (src/content/caps-science-curriculum.ts). One section per sub-topic;
// videos are filled by scripts/apply-curated-videos.ts.
export const chemicalChangeGr10: TopicContent = {
  id: 'chemical-change-gr10',
  slug: 'chemical-change-gr10',
  subject: 'science',
  grade: 10,
  paper: 2,
  title: 'Chemical Change',
  capsWeight: 15,
  // Curated per CAPS sub-topic — see docs/curriculum/ and scripts/curate-videos.ts
  sections: [
    {
      id: 'overview',
      title: 'Chemical Change',
      blocks: [
        {
          type: 'theory',
          title: 'What this topic covers',
          titleAf: 'Wat hierdie onderwerp dek',
          body: `• Physical and chemical change, conservation of atoms and mass
• Balancing chemical equations
• Ions in aqueous solution: dissolving, hydration and conductivity
• Precipitation reactions and testing for anions
• Reaction types: ion exchange, gas forming, acid-base and redox
• The mole concept and Avogadro's number
• Molar mass, percentage composition and empirical formula
• Concentration of solutions and the molar volume of gases
• Basic stoichiometric calculations`
        }
      ]
    },
    {
      id: 'physical-and-chemical-change',
      title: 'Physical and chemical change',
      blocks: [
        {
          type: 'video',
          title: 'Watch: Grade 10 Chemistry Physical and Chemical change — Miss Martins Maths and Science',
          videoId: 'pCojzn5sauU'
        }
      ]
    },
    {
      id: 'balancing-chemical-equations',
      title: 'Balancing chemical equations',
      blocks: [
        {
          type: 'video',
          title: 'Watch: Balancing Chemical Equations Chemistry — Miss Martins Maths and Science',
          videoId: 'WNaib8LP0_w'
        }
      ]
    },
    {
      id: 'ions-in-aqueous-solution-dissolving-hydration-an',
      title: 'Ions in aqueous solution: dissolving, hydration and conductivity',
      blocks: [
        {
          type: 'video',
          title: 'Watch: Dissolving and Hydration Grade 10 — Kevinmathscience',
          videoId: 'kuVpsyKvIeg'
        }
      ]
    },
    {
      id: 'precipitation-reactions-and-testing-for-anions',
      title: 'Precipitation reactions and testing for anions',
      blocks: [
        {
          type: 'content_gap',
          body: `No CAPS video has been sourced for this sub-topic yet. Ask Angelo if you're stuck on it in the meantime.`,
          bodyAf: `Daar is nog nie 'n KABV-video vir hierdie onderafdeling nie. Vra solank vir Angelo as jy vashaak.`
        }
      ]
    },
    {
      id: 'reaction-types-ion-exchange-gas-forming-acid-bas',
      title: 'Reaction types: ion exchange, gas forming, acid-base and redox',
      blocks: [
        // Labelled for an adjacent grade; CAPS covers this sub-topic in both.
        {
          type: 'video',
          title: 'Watch: Redox reactions grade 11 Chemistry: Introduction and Overview — Miss Martins Maths and Science',
          videoId: 'Ol2vv4WM7FA'
        }
      ]
    },
    {
      id: 'the-mole-concept-and-avogadro-s-number',
      title: 'The mole concept and Avogadro\'s number',
      blocks: [
        {
          type: 'video',
          title: 'Watch: Calculating Mole Grade 10 | Part 1 — Kevinmathscience',
          videoId: 'nAlbPOUili0'
        }
      ]
    },
    {
      id: 'molar-mass-and-percentage-composition',
      title: 'Molar mass and percentage composition',
      blocks: [
        {
          type: 'video',
          title: 'Watch: Quantitative Aspects of Chemical Change: Molar Volume — Kevinmathscience',
          videoId: 'rEVNjscIpic'
        }
      ]
    },
    {
      id: 'empirical-formula',
      title: 'Empirical formula',
      blocks: [
        {
          type: 'video',
          title: 'Watch: Empirical Formula: How to calculate | Stoichiometry | Chemistry — Miss Martins Maths and Science',
          videoId: '1u6B4LePBKo'
        }
      ]
    },
    {
      id: 'concentration-of-solutions-and-the-molar-volume-',
      title: 'Concentration of solutions and the molar volume of gases',
      blocks: [
        {
          type: 'video',
          title: 'Watch: Grade 10 - Physical Science | 09 July 2020 | molar concentration — Africa Teen Geeks',
          videoId: 'Yx4h2hEK_Is'
        }
      ]
    },
    {
      id: 'basic-stoichiometric-calculations',
      title: 'Basic stoichiometric calculations',
      blocks: [
        {
          type: 'video',
          title: 'Watch: PHYSICAL SCIENCES GRADE 10: STOICHIOMETRIC CALCULATIONS. — PHAKAMA RESEARCH',
          videoId: 'JXk770w902g'
        }
      ]
    }
  ]
}

export default chemicalChangeGr10
