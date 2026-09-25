import type { TopicContent } from '@/types'

export const matterMaterialsGr10: TopicContent = {
  id: 'matter-materials-gr10',
  slug: 'matter-materials-gr10',
  subject: 'science',
  grade: 10,
  paper: 2,
  title: 'Matter & Materials',
  titleAf: 'Materie en Materiale',
  capsWeight: 20,
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
          body: `• **Atomic Structure** - Protons, neutrons, electrons
• **Isotopes** - Same element, different mass numbers
• **The Periodic Table** - Groups, periods, trends
• **Electronic Configuration** - Electron arrangement in shells
• **Chemical Bonding** - Ionic, covalent, metallic bonds
• **Lewis Dot Diagrams** - Representing valence electrons
• **Molecular Structure** - Shapes of simple molecules
• **Physical and Chemical Changes** - Distinguishing between them`
        }
      ]
    },
    {
      id: 'classification-of-matter-mixtures-pure-substance',
      title: 'Classification of matter: mixtures, pure substances, metals and non-metals',
      titleAf: 'Klassifikasie van materie: mengsels, suiwer stowwe, metale en nie-metale',
      blocks: [
        {
          type: 'video',
          title: 'Watch: 2) Mixture vs pure substance gr 10 — Kevinmathscience',
          videoId: 'TxpKUZpF_BI',
          videoIdAf: 'XsqSSWDBaj8'
        }
      ]
    },
    {
      id: 'names-and-formulae-of-compounds',
      title: 'Names and formulae of compounds',
      titleAf: 'Name en formules van verbindings',
      blocks: [
        {
          type: 'video',
          title: 'Kyk: Name en formules van chemiese verbindings Gr. 10 Chemie — Danike Aucamp_Wiskunde en Wetenskap ',
          videoIdAf: '44SNuly1CdU'
        }
      ]
    },
    {
      id: 'states-of-matter-and-the-kinetic-molecular-theor',
      title: 'States of matter and the kinetic molecular theory',
      titleAf: 'Fasetoestande van materie en die kinetiese molekulêre teorie',
      blocks: [
        {
          type: 'video',
          title: 'Watch: Kinetic Molecular Theory grade 10 Introduction — Miss Martins Maths and Science',
          videoId: 'QuVBXvLJjD8',
          videoIdAf: 'tw1A9JlRxnk'
        }
      ]
    },
    {
      id: 'models-of-the-atom-and-the-structure-of-the-atom',
      title: 'Models of the atom and the structure of the atom',
      titleAf: 'Modelle van die atoom en die struktuur van die atoom',
      blocks: [
        {
          type: 'content_gap',
          body: `No CAPS video has been sourced for this sub-topic yet. Ask Angelo if you're stuck on it in the meantime.`,
          bodyAf: `Daar is nog nie 'n KABV-video vir hierdie onderafdeling nie. Vra solank vir Angelo as jy vashaak.`
        }
      ]
    },
    {
      id: 'isotopes-and-relative-atomic-mass',
      title: 'Isotopes and relative atomic mass',
      titleAf: 'Isotope en relatiewe atoommassa',
      blocks: [
        {
          type: 'video',
          title: 'Watch: Grade 10 Isotopes and Relative Atomic Mass Chemistry PART 1 — Miss Martins Maths and Science',
          videoId: '0ZGRD9q6WGE'
        }
      ]
    },
    {
      id: 'electron-configuration-of-atoms',
      title: 'Electron configuration of atoms',
      titleAf: 'Elektronkonfigurasie van atome',
      blocks: [
        {
          type: 'content_gap',
          body: `No CAPS video has been sourced for this sub-topic yet. Ask Angelo if you're stuck on it in the meantime.`,
          bodyAf: `Daar is nog nie 'n KABV-video vir hierdie onderafdeling nie. Vra solank vir Angelo as jy vashaak.`
        }
      ]
    },
    {
      id: 'the-periodic-table-groups-periods-and-periodic-t',
      title: 'The periodic table: groups, periods and periodic trends',
      titleAf: 'Die periodieke tabel: groepe, periodes en periodieke tendense',
      blocks: [
        {
          type: 'video',
          title: 'Watch: 18) Periodic table gr 10 — Kevinmathscience',
          videoId: 'WRNsXTyeZI0',
          videoIdAf: '_Sb93EoNknU'
        }
      ]
    },
    {
      id: 'chemical-bonding-covalent-ionic-and-metallic',
      title: 'Chemical bonding: covalent, ionic and metallic',
      titleAf: 'Chemiese binding: kovalent, ionies en metaalbinding',
      blocks: [
        {
          type: 'video',
          title: 'Watch: 24) Ionic Bonding Grade 10 — Kevinmathscience',
          videoId: '59CwQ-hjp00'
        }
      ]
    },
    {
      id: 'particles-substances-are-made-of-molecular-ionic',
      title: 'Particles substances are made of: molecular, ionic and metallic structures',
      titleAf: 'Deeltjies waaruit stowwe bestaan: molekulêre, ioniese en metaalstrukture',
      blocks: [
        {
          type: 'video',
          title: 'Watch: Chemical Bonding: Ionic Bonding Lewis Dot Diagrams — Miss Martins Maths and Science',
          videoId: '1EK711NkEds'
        }
      ]
    }
  ]
}

export default matterMaterialsGr10
