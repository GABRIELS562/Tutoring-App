import type { TopicContent } from '@/types'

export const matterMaterialsGr10: TopicContent = {
  id: 'matter-materials-gr10',
  slug: 'matter-materials-gr10',
  subject: 'science',
  grade: 10,
  paper: 2,
  title: 'Matter and Materials',
  capsWeight: 20,
  sections: [
    {
      id: 'coming-soon',
      title: 'Matter and Materials',
      blocks: [
        {
          type: 'theory',
          title: 'What this topic covers',
          body: `• **Atomic Structure** - Protons, neutrons, electrons
• **Isotopes** - Same element, different mass numbers
• **The Periodic Table** - Groups, periods, trends
• **Electronic Configuration** - Electron arrangement in shells
• **Chemical Bonding** - Ionic, covalent, metallic bonds
• **Lewis Dot Diagrams** - Representing valence electrons
• **Molecular Structure** - Shapes of simple molecules
• **Physical and Chemical Changes** - Distinguishing between them`
        },
        // PROVISIONAL video picks — auto-filled 2026-09-18 from docs/client-updates/video-candidates; client to confirm.
        {
          type: 'video',
          title: 'Watch: Grade 10 Classification of Matter: Properties of materials — Miss Martins Maths and Science',
          videoId: '5M4hJjp3-lQ',
          videoIdAf: '0pf1ilcCd2c',
          titleAf: 'Watch: Hoe om vir Graad 10 Fisiese Wetenskap te leer — Juf. OK se Wetenskap Akademie'
        },
        {
          type: 'video',
          title: 'Watch: Water of Crystallization | Chemistry Grade 10-12 — Miss Martins Maths and Science',
          videoId: 'oADmMF84wbA'
        }
        // TODO(curator): add { type: 'formula', formulas: [...] } block
      ]
    }
  ]
}

export default matterMaterialsGr10
