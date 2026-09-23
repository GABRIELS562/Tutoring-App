import type { TopicContent } from '@/types'

// Scaffolded from the CAPS handbook (src/content/caps-curriculum.ts).
// One section per sub-topic; videos are filled by
// scripts/apply-curated-videos.ts.
export const probabilityGr11: TopicContent = {
  id: 'probability-gr11',
  slug: 'probability-gr11',
  subject: 'maths',
  grade: 11,
  paper: 1,
  title: 'Probability',
  capsWeight: 0,
  sections: [
    {
      id: 'overview',
      title: 'Probability',
      blocks: [
        {
          type: 'theory',
          title: 'What this topic covers',
          body: `• Dependent and independent events
• The product rule for independent events
• Tree diagrams
• Contingency (two-way) tables`
        }
      ]
    },
    {
      id: 'dependent-and-independent-events',
      title: 'Dependent and independent events',
      blocks: [
        {
          type: 'tip',
          body: `A curated video for this sub-topic is on the way. Ask Angelo if you're stuck on it.`
        }
      ]
    },
    {
      id: 'the-product-rule-for-independent-events',
      title: 'The product rule for independent events',
      blocks: [
        {
          type: 'tip',
          body: `A curated video for this sub-topic is on the way. Ask Angelo if you're stuck on it.`
        }
      ]
    },
    {
      id: 'tree-diagrams',
      title: 'Tree diagrams',
      blocks: [
        {
          type: 'tip',
          body: `A curated video for this sub-topic is on the way. Ask Angelo if you're stuck on it.`
        }
      ]
    },
    {
      id: 'contingency-two-way-tables',
      title: 'Contingency (two-way) tables',
      blocks: [
        {
          type: 'tip',
          body: `A curated video for this sub-topic is on the way. Ask Angelo if you're stuck on it.`
        }
      ]
    }
  ]
}

export default probabilityGr11
