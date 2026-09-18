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
          title: 'What this topic covers',
          body: `• **Limits and Continuity** - Understanding the foundation of calculus
• **Differentiation from First Principles** - The definition of the derivative
• **Rules of Differentiation** - Power rule, product rule, quotient rule, chain rule
• **Applications of Derivatives** - Tangents, normals, rates of change
• **Curve Sketching** - Using calculus to analyze functions
• **Optimization Problems** - Finding maxima and minima
• **Integration** - The reverse of differentiation
• **Area Under Curves** - Definite integrals and applications`
        },
        {
          type: 'tip',
          body: `Calculus is worth approximately 35% of Paper 1. Master differentiation rules first — they form the foundation for everything else in this topic.`
        },
        // PROVISIONAL video picks — auto-filled 2026-09-18 from docs/client-updates/video-candidates; client to confirm.
        {
          type: 'video',
          title: 'Watch: Determine Cubic Equation Calculus grade 12 — Kevinmathscience',
          videoId: 'UzVKkR-XArM',
          videoIdAf: 'n3XE5NtY-Ls',
          titleAf: 'Watch: Differensiasie - Verduideliking en Voorbeelde || Wiskunde Graad 12 — CollieMath Studio'
        },
        {
          type: 'video',
          title: 'Watch: Lesson 7: How To Solve Optimisation Questions | Area, Volume & Cost | Grade 12 Calculus — Mlungisi Nkosi Maths & Science',
          videoId: '1ye4FhvMazo'
        }
        // TODO(curator): add { type: 'formula', formulas: [...] } block
      ]
    }
  ]
}

export default calculusGr12
