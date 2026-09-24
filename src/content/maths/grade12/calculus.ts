import type { TopicContent } from '@/types'

export const calculusGr12: TopicContent = {
  id: 'calculus-gr12',
  slug: 'calculus-gr12',
  subject: 'maths',
  grade: 12,
  paper: 1,
  title: 'Calculus',
  capsWeight: 35,
  // Curated per CAPS sub-topic — see docs/curriculum/ and scripts/curate-videos.ts
  // Curated per CAPS sub-topic — see docs/curriculum/ and scripts/curate-videos.ts
  // Curated per CAPS sub-topic — see docs/curriculum/ and scripts/curate-videos.ts
  sections: [
    {
      id: 'overview',
      title: 'Calculus',
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
        }
      ]
    },
    {
      id: 'the-definition-of-a-limit',
      title: 'The definition of a limit',
      blocks: [
        {
          type: 'video',
          title: 'Watch: Limits Calculus Grade 12 — Kevinmathscience',
          videoId: '4VUWIiudCk0'
        }
      ]
    },
    {
      id: 'differentiation-from-first-principles',
      title: 'Differentiation from first principles',
      blocks: [
        {
          type: 'video',
          title: 'Watch: First Principles Calculus Grade 12 — Kevinmathscience',
          videoId: 'alUkVWVEP10',
          videoIdAf: 'xW9vijvWp7c'
        }
      ]
    },
    {
      id: 'the-rules-of-differentiation',
      title: 'The rules of differentiation',
      blocks: [
        {
          type: 'video',
          title: 'Kyk: 4 Differensiasie reels deel 1 — Wiskunde Graad 12 Juffrou Koorsen',
          videoIdAf: 'iymP84P3njM'
        }
      ]
    },
    {
      id: 'sketching-cubic-graphs',
      title: 'Sketching cubic graphs',
      blocks: [
        {
          type: 'video',
          title: 'Watch: Draw Cubic Graph Grade 12 — Kevinmathscience',
          videoId: '6rUoChk1awg',
          videoIdAf: 'hzr8uS7hisE'
        }
      ]
    },
    {
      id: 'optimisation-problems',
      title: 'Optimisation problems',
      blocks: [
        {
          type: 'video',
          title: 'Watch: Optimisation Gr 12 — Kevinmathscience',
          videoId: 'xcEeslakFCY'
        }
      ]
    },
    {
      id: 'rates-of-change',
      title: 'Rates of change',
      blocks: [
        {
          type: 'video',
          title: 'Watch: Differential Calculus: Lesson: Rates of Change — Mindset',
          videoId: '7ms2EI0LaxU',
          videoIdAf: 'h5w28ZLc4dw'
        }
      ]
    }
  ]
}

export default calculusGr12
