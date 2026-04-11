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
          title: 'Full Notes Coming Soon',
          body: `Full notes for this topic are coming soon. In the meantime, watch the Mindset Learn video below.

This topic covers:
• **Atomic Structure** - Protons, neutrons, electrons
• **Isotopes** - Same element, different mass numbers
• **The Periodic Table** - Groups, periods, trends
• **Electronic Configuration** - Electron arrangement in shells
• **Chemical Bonding** - Ionic, covalent, metallic bonds
• **Lewis Dot Diagrams** - Representing valence electrons
• **Molecular Structure** - Shapes of simple molecules
• **Physical and Chemical Changes** - Distinguishing between them`
        },
        {
          type: 'video',
          title: 'Watch: Matter and Materials — Mindset Learn',
          videoId: 'MINDSET_MATTER_MATERIALS_GR10'
        }
      ]
    }
  ]
}

export default matterMaterialsGr10
