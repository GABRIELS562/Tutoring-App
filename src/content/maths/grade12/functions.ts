import type { TopicContent } from '@/types'

// Scaffolded from the CAPS handbook (src/content/caps-curriculum.ts).
// One section per sub-topic; videos are filled by
// scripts/apply-curated-videos.ts.
export const functionsGr12: TopicContent = {
  id: 'functions-gr12',
  slug: 'functions-gr12',
  subject: 'maths',
  grade: 12,
  paper: 1,
  title: 'Functions & Graphs',
  capsWeight: 0,
  sections: [
    {
      id: 'overview',
      title: 'Functions & Graphs',
      blocks: [
        {
          type: 'theory',
          title: 'What this topic covers',
          body: `• Domain and range
• The formal definition of an inverse function
• Restricting the domain of a quadratic to invert it (y = √x)`
        }
      ]
    },
    {
      id: 'domain-and-range',
      title: 'Domain and range',
      blocks: [
        {
          type: 'tip',
          body: `A curated video for this sub-topic is on the way. Ask Angelo if you're stuck on it.`
        }
      ]
    },
    {
      id: 'the-formal-definition-of-an-inverse-function',
      title: 'The formal definition of an inverse function',
      blocks: [
        {
          type: 'tip',
          body: `A curated video for this sub-topic is on the way. Ask Angelo if you're stuck on it.`
        }
      ]
    },
    {
      id: 'restricting-the-domain-of-a-quadratic-to-invert-',
      title: 'Restricting the domain of a quadratic to invert it (y = √x)',
      blocks: [
        {
          type: 'tip',
          body: `A curated video for this sub-topic is on the way. Ask Angelo if you're stuck on it.`
        }
      ]
    }
  ]
}

export default functionsGr12
