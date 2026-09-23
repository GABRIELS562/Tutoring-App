import type { TopicContent } from '@/types'

// Scaffolded from the CAPS handbook (src/content/caps-curriculum.ts).
// One section per sub-topic; videos are filled by
// scripts/apply-curated-videos.ts.
export const trigGr12: TopicContent = {
  id: 'trig-gr12',
  slug: 'trig-gr12',
  subject: 'maths',
  grade: 12,
  paper: 2,
  title: 'Trigonometry',
  capsWeight: 0,
  sections: [
    {
      id: 'overview',
      title: 'Trigonometry',
      blocks: [
        {
          type: 'theory',
          title: 'What this topic covers',
          body: `• Compound angle identities
• Double angle identities
• Expansion and simplification of trig expressions
• Trigonometry in three-dimensional problems`
        }
      ]
    },
    {
      id: 'compound-angle-identities',
      title: 'Compound angle identities',
      blocks: [
        {
          type: 'tip',
          body: `A curated video for this sub-topic is on the way. Ask Angelo if you're stuck on it.`
        }
      ]
    },
    {
      id: 'double-angle-identities',
      title: 'Double angle identities',
      blocks: [
        {
          type: 'tip',
          body: `A curated video for this sub-topic is on the way. Ask Angelo if you're stuck on it.`
        }
      ]
    },
    {
      id: 'expansion-and-simplification-of-trig-expressions',
      title: 'Expansion and simplification of trig expressions',
      blocks: [
        {
          type: 'tip',
          body: `A curated video for this sub-topic is on the way. Ask Angelo if you're stuck on it.`
        }
      ]
    },
    {
      id: 'trigonometry-in-three-dimensional-problems',
      title: 'Trigonometry in three-dimensional problems',
      blocks: [
        {
          type: 'tip',
          body: `A curated video for this sub-topic is on the way. Ask Angelo if you're stuck on it.`
        }
      ]
    }
  ]
}

export default trigGr12
