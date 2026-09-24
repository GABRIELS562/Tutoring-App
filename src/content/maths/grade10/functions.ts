import type { TopicContent } from '@/types'

export const functionsGr10: TopicContent = {
  id: 'functions-gr10',
  slug: 'functions-gr10',
  subject: 'maths',
  grade: 10,
  paper: 1,
  title: 'Functions & Graphs',
  capsWeight: 25,
  // Curated per CAPS sub-topic — see docs/curriculum/ and scripts/curate-videos.ts
  // Curated per CAPS sub-topic — see docs/curriculum/ and scripts/curate-videos.ts
  // Curated per CAPS sub-topic — see docs/curriculum/ and scripts/curate-videos.ts
  // Curated per CAPS sub-topic — see docs/curriculum/ and scripts/curate-videos.ts
  // Curated per CAPS sub-topic — see docs/curriculum/ and scripts/curate-videos.ts
  // Curated per CAPS sub-topic — see docs/curriculum/ and scripts/curate-videos.ts
  sections: [
    {
      id: 'overview',
      title: 'Functions & Graphs',
      blocks: [
        {
          type: 'theory',
          title: 'What this topic covers',
          body: `• **Function Notation** - Understanding $f(x)$ notation
• **Linear Functions** - $y = mx + c$, gradient and y-intercept
• **Quadratic Functions** - $y = ax^2 + q$, parabolas, turning points
• **Hyperbolic Functions** - $y = \\frac{a}{x} + q$, asymptotes
• **Exponential Functions** - $y = ab^x + q$, growth and decay
• **Sketching Graphs** - Domain, range, intercepts, asymptotes
• **Transformations** - Effects of $a$ and $q$ on graphs`
        }
      ]
    },
    {
      id: 'the-linear-function-y-mx-c',
      title: 'The linear function y = mx + c',
      blocks: [
        {
          type: 'video',
          title: 'Watch: Exam Functions Grade 10 — Kevinmathscience',
          videoId: '1RnuVXYcVpE',
          videoIdAf: 'szNc_lCDmDQ'
        }
      ]
    },
    {
      id: 'the-quadratic-function-y-ax',
      title: 'The quadratic function y = ax²',
      blocks: [
        {
          type: 'video',
          title: 'Watch: Parabola Grade 10 Functions (Introduction) — Miss Martins Maths and Science',
          videoId: 'Nujt5qcZWqE'
        }
      ]
    },
    {
      id: 'the-hyperbolic-function-y-a-x',
      title: 'The hyperbolic function y = a/x',
      blocks: [
        {
          type: 'video',
          title: 'Watch: Hyperbola Grade 10 Functions Introduction — Miss Martins Maths and Science',
          videoId: 'oWDjn_PRndg',
          videoIdAf: '06baipkT2_k'
        }
      ]
    },
    {
      id: 'the-exponential-function-y-ab-x',
      title: 'The exponential function y = ab^x',
      blocks: [
        {
          type: 'video',
          title: 'Watch: Exponential Function grade 10: #1 — Kevinmathscience',
          videoId: 'Ijfu6KuR6mQ'
        }
      ]
    }
  ]
}

export default functionsGr10
