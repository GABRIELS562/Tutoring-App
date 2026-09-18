import type { TopicContent } from '@/types'

export const functionsGr10: TopicContent = {
  id: 'functions-gr10',
  slug: 'functions-gr10',
  subject: 'maths',
  grade: 10,
  paper: 1,
  title: 'Functions and Graphs',
  capsWeight: 25,
  sections: [
    {
      id: 'coming-soon',
      title: 'Functions and Graphs',
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
        },
        // PROVISIONAL video picks — auto-filled 2026-09-18 from docs/client-updates/video-candidates; client to confirm.
        {
          type: 'video',
          title: 'Watch: Exam Functions Grade 10 — Kevinmathscience',
          videoId: '1RnuVXYcVpE',
          videoIdAf: '90DcF3f3V7c',
          titleAf: 'Watch: Funksies Parabool Graad10: L6 Grafiek Interpretasie Eksamen vraag — Online Maths by Miss Pythagoras'
        },
        {
          type: 'video',
          title: 'Watch: 🚀 Grade 10 Mathematics | Straight Line Functions Made Easy — SmartPrep MathsScience',
          videoId: 'ZqRXA19yhMM'
        }
        // TODO(curator): add { type: 'formula', formulas: [...] } block
      ]
    }
  ]
}

export default functionsGr10
