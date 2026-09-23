import type { TopicContent } from '@/types'

// Scaffolded from the CAPS handbook (src/content/caps-curriculum.ts).
// One section per sub-topic; videos are filled by
// scripts/apply-curated-videos.ts.
export const functionsGr11: TopicContent = {
  id: 'functions-gr11',
  slug: 'functions-gr11',
  subject: 'maths',
  grade: 11,
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
          body: `• The parabola y = a(x - p)² + q
• The hyperbola y = a/(x - p) + q
• The exponential graph y = ab^(x - p) + q
• Introduction to inverse functions`
        }
      ]
    },
    {
      id: 'the-parabola-y-a-x-p-q',
      title: 'The parabola y = a(x - p)² + q',
      blocks: [
        {
          type: 'tip',
          body: `A curated video for this sub-topic is on the way. Ask Angelo if you're stuck on it.`
        }
      ]
    },
    {
      id: 'the-hyperbola-y-a-x-p-q',
      title: 'The hyperbola y = a/(x - p) + q',
      blocks: [
        {
          type: 'tip',
          body: `A curated video for this sub-topic is on the way. Ask Angelo if you're stuck on it.`
        }
      ]
    },
    {
      id: 'the-exponential-graph-y-ab-x-p-q',
      title: 'The exponential graph y = ab^(x - p) + q',
      blocks: [
        {
          type: 'tip',
          body: `A curated video for this sub-topic is on the way. Ask Angelo if you're stuck on it.`
        }
      ]
    },
    {
      id: 'introduction-to-inverse-functions',
      title: 'Introduction to inverse functions',
      blocks: [
        {
          type: 'tip',
          body: `A curated video for this sub-topic is on the way. Ask Angelo if you're stuck on it.`
        }
      ]
    }
  ]
}

export default functionsGr11
