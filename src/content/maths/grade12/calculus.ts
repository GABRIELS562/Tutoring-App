import type { TopicContent } from '@/types'

export const calculusGr12: TopicContent = {
  id: 'calculus-gr12',
  slug: 'calculus-gr12',
  subject: 'maths',
  grade: 12,
  paper: 1,
  title: 'Calculus',
  titleAf: 'Differensiaalrekene',
  capsWeight: 35,
  // Curated per CAPS sub-topic — see docs/curriculum/ and scripts/curate-videos.ts
  sections: [
    {
      id: 'overview',
      title: 'Calculus',
      titleAf: 'Differensiaalrekene',
      blocks: [
        {
          type: 'theory',
          title: 'What this topic covers',
          titleAf: 'Wat hierdie onderwerp dek',
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
      titleAf: 'Die definisie van ’n limiet',
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
      titleAf: 'Differensiasie vanuit eerste beginsels',
      blocks: [
        {
          type: 'video',
          title: 'Watch: First Principles Calculus Grade 12 — Kevinmathscience',
          videoId: 'alUkVWVEP10',
          videoIdAf: 'xW9vijvWp7c',
          titleAf: 'Kyk: Differensiasie Graad12: L1 Bepaal die afgeleide deur middel van Eerste Beginsels — Online Maths by Miss Pythagoras'
        }
      ]
    },
    {
      id: 'the-rules-of-differentiation',
      title: 'The rules of differentiation',
      titleAf: 'Die reëls van differensiasie',
      blocks: [
        {
          type: 'video',
          title: 'Kyk: Differensiasie Graad12: L2 Reëls van Differensiasie — Online Maths by Miss Pythagoras',
          videoIdAf: 'y-CzYdhCBAU',
          titleAf: 'Kyk: Differensiasie Graad12: L2 Reëls van Differensiasie — Online Maths by Miss Pythagoras'
        }
      ]
    },
    {
      id: 'sketching-cubic-graphs',
      title: 'Sketching cubic graphs',
      titleAf: 'Skets van derdegraadse grafieke',
      blocks: [
        {
          type: 'video',
          title: 'Watch: Draw Cubic Graph Grade 12 — Kevinmathscience',
          videoId: '6rUoChk1awg',
          videoIdAf: 'wlsrqsvyimY',
          titleAf: 'Kyk: W12.11 Teken derdegraadse grafieke met stas buigpunte — Stefan Buys'
        }
      ]
    },
    {
      id: 'optimisation-problems',
      title: 'Optimisation problems',
      titleAf: 'Optimeringsprobleme',
      blocks: [
        {
          type: 'video',
          title: 'Watch: Optimisation Gr 12 — Kevinmathscience',
          videoId: 'xcEeslakFCY',
          videoIdAf: 'xpUxJfXgDmA',
          titleAf: 'Kyk: Graad 12 Hoofstuk 8 Les 10 Optimering en veranderingstempo — Rochelle Van der Merwe'
        }
      ]
    },
    {
      id: 'rates-of-change',
      title: 'Rates of change',
      titleAf: 'Tempo van verandering',
      blocks: [
        {
          type: 'video',
          title: 'Watch: Differential Calculus: Lesson: Rates of Change — Mindset',
          videoId: '7ms2EI0LaxU',
          videoIdAf: 'h5w28ZLc4dw',
          titleAf: 'Kyk: 15  Tempo van verandering en beweging — Wiskunde_Mathematics_SUM'
        }
      ]
    }
  ]
}

export default calculusGr12
