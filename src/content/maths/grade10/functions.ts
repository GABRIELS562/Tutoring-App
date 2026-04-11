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
          title: 'Full Notes Coming Soon',
          body: `Full notes for this topic are coming soon. In the meantime, watch the Mindset Learn video below.

This topic covers:
• **Function Notation** - Understanding $f(x)$ notation
• **Linear Functions** - $y = mx + c$, gradient and y-intercept
• **Quadratic Functions** - $y = ax^2 + q$, parabolas, turning points
• **Hyperbolic Functions** - $y = \\frac{a}{x} + q$, asymptotes
• **Exponential Functions** - $y = ab^x + q$, growth and decay
• **Sketching Graphs** - Domain, range, intercepts, asymptotes
• **Transformations** - Effects of $a$ and $q$ on graphs`
        },
        {
          type: 'video',
          title: 'Watch: Functions and Graphs — Mindset Learn',
          videoId: 'MINDSET_FUNCTIONS_GR10'
        }
      ]
    }
  ]
}

export default functionsGr10
