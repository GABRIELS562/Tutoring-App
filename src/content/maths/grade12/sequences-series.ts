import type { TopicContent } from '@/types'

export const sequencesSeriesGr12: TopicContent = {
  id: 'sequences-series-gr12',
  slug: 'sequences-series-gr12',
  subject: 'maths',
  grade: 12,
  paper: 1,
  title: 'Sequences and Series',
  capsWeight: 25,
  sections: [
    {
      id: 'coming-soon',
      title: 'Coming Soon',
      blocks: [
        {
          type: 'theory',
          title: 'Content Under Development',
          body: `This topic is currently being developed. Check back soon for comprehensive content on:

• **Arithmetic Sequences** - Finding terms and the common difference
• **Arithmetic Series** - Sum of arithmetic sequences
• **Geometric Sequences** - Finding terms and the common ratio
• **Geometric Series** - Sum of geometric sequences (finite and infinite)
• **Sigma Notation** - Understanding and using summation notation
• **Convergence** - When infinite series have a finite sum
• **Mixed Problems** - Combining arithmetic and geometric concepts
• **Real-World Applications** - Finance, growth, and decay problems

In the meantime, practice with past papers available in the Papers section.`
        },
        {
          type: 'tip',
          body: `Always identify whether a sequence is arithmetic (constant difference) or geometric (constant ratio) first. This determines which formulas to use.`
        },
        {
          type: 'video',
          title: 'Watch: Sequences and Series — Mindset Learn',
          videoId: 'MINDSET_SEQUENCES_SERIES_GR12'
        }
      ]
    }
  ]
}

export default sequencesSeriesGr12
