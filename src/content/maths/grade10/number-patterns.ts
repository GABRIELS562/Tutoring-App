import type { TopicContent } from '@/types'

export const numberPatternsGr10: TopicContent = {
  id: 'number-patterns-gr10',
  slug: 'number-patterns-gr10',
  subject: 'maths',
  grade: 10,
  paper: 1,
  title: 'Number Patterns',
  capsWeight: 10,
  sections: [
    {
      id: 'coming-soon',
      title: 'Number Patterns',
      blocks: [
        {
          type: 'theory',
          title: 'Full Notes Coming Soon',
          body: `Full notes for this topic are coming soon. In the meantime, watch the Mindset Learn video below.

This topic covers:
• **Linear Patterns** - Constant first difference
• **Quadratic Patterns** - Constant second difference
• **General Term** - Finding the $n$th term ($T_n$)
• **Linear Sequences** - $T_n = an + b$
• **Quadratic Sequences** - $T_n = an^2 + bn + c$
• **Pattern Recognition** - Identifying types of sequences`
        },
        {
          type: 'video',
          title: 'Watch: Number Patterns — Mindset Learn',
          videoId: 'MINDSET_NUMBER_PATTERNS_GR10'
        }
      ]
    }
  ]
}

export default numberPatternsGr10
