import type { TopicContent } from '@/types'

// Scaffolded from the CAPS handbook (src/content/caps-curriculum.ts).
// One section per sub-topic; videos are filled by
// scripts/apply-curated-videos.ts.
export const numberPatternsGr11: TopicContent = {
  id: 'number-patterns-gr11',
  slug: 'number-patterns-gr11',
  subject: 'maths',
  grade: 11,
  paper: 1,
  title: 'Number Patterns',
  capsWeight: 0,
  sections: [
    {
      id: 'overview',
      title: 'Number Patterns',
      blocks: [
        {
          type: 'theory',
          title: 'What this topic covers',
          body: `• Quadratic number patterns and the second constant difference
• The general term Tn = an² + bn + c`
        }
      ]
    },
    {
      id: 'quadratic-number-patterns-and-the-second-constan',
      title: 'Quadratic number patterns and the second constant difference',
      blocks: [
        {
          type: 'tip',
          body: `A curated video for this sub-topic is on the way. Ask Angelo if you're stuck on it.`
        }
      ]
    },
    {
      id: 'the-general-term-tn-an-bn-c',
      title: 'The general term Tn = an² + bn + c',
      blocks: [
        {
          type: 'tip',
          body: `A curated video for this sub-topic is on the way. Ask Angelo if you're stuck on it.`
        }
      ]
    }
  ]
}

export default numberPatternsGr11
