import type { TopicContent } from '@/types'

// Scaffolded from the CAPS handbook (src/content/caps-curriculum.ts).
// One section per sub-topic; videos are filled by
// scripts/apply-curated-videos.ts.
export const algebraGr12: TopicContent = {
  id: 'algebra-gr12',
  slug: 'algebra-gr12',
  subject: 'maths',
  grade: 12,
  paper: 1,
  title: 'Algebra & Equations',
  capsWeight: 0,
  sections: [
    {
      id: 'overview',
      title: 'Algebra & Equations',
      blocks: [
        {
          type: 'theory',
          title: 'What this topic covers',
          body: `• Revision of quadratic equations and inequalities
• Advanced simultaneous equations
• Logarithms applied to exponential equations`
        }
      ]
    },
    {
      id: 'revision-of-quadratic-equations-and-inequalities',
      title: 'Revision of quadratic equations and inequalities',
      blocks: [
        {
          type: 'tip',
          body: `A curated video for this sub-topic is on the way. Ask Angelo if you're stuck on it.`
        }
      ]
    },
    {
      id: 'advanced-simultaneous-equations',
      title: 'Advanced simultaneous equations',
      blocks: [
        {
          type: 'tip',
          body: `A curated video for this sub-topic is on the way. Ask Angelo if you're stuck on it.`
        }
      ]
    },
    {
      id: 'logarithms-applied-to-exponential-equations',
      title: 'Logarithms applied to exponential equations',
      blocks: [
        {
          type: 'tip',
          body: `A curated video for this sub-topic is on the way. Ask Angelo if you're stuck on it.`
        }
      ]
    }
  ]
}

export default algebraGr12
