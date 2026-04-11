import type { TopicContent } from '@/types'

export const calculusGr12: TopicContent = {
  id: 'calculus-gr12',
  slug: 'calculus-gr12',
  subject: 'maths',
  grade: 12,
  paper: 1,
  title: 'Calculus',
  capsWeight: 35,
  sections: [
    {
      id: 'coming-soon',
      title: 'Coming Soon',
      blocks: [
        {
          type: 'theory',
          title: 'Content Under Development',
          body: `This topic is currently being developed. Check back soon for comprehensive content on:

• **Limits and Continuity** - Understanding the foundation of calculus
• **Differentiation from First Principles** - The definition of the derivative
• **Rules of Differentiation** - Power rule, product rule, quotient rule, chain rule
• **Applications of Derivatives** - Tangents, normals, rates of change
• **Curve Sketching** - Using calculus to analyze functions
• **Optimization Problems** - Finding maxima and minima
• **Integration** - The reverse of differentiation
• **Area Under Curves** - Definite integrals and applications

In the meantime, practice with past papers available in the Papers section.`
        },
        {
          type: 'tip',
          body: `Calculus is worth approximately 35% of Paper 1. Master differentiation rules first — they form the foundation for everything else in this topic.`
        },
        {
          type: 'video',
          title: 'Watch: Introduction to Calculus — Mindset Learn',
          videoId: 'MINDSET_CALCULUS_GR12'
        }
      ]
    }
  ]
}

export default calculusGr12
