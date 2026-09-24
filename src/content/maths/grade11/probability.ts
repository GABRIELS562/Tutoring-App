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
  // Curated per CAPS sub-topic — see docs/curriculum/ and scripts/curate-videos.ts
  // Curated per CAPS sub-topic — see docs/curriculum/ and scripts/curate-videos.ts
  // Curated per CAPS sub-topic — see docs/curriculum/ and scripts/curate-videos.ts
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
          type: 'video',
          title: 'Watch: Gr 11 Probability: Independent events — Kevinmathscience',
          videoId: 'axJSsykVmfE',
          videoIdAf: 'X4qRoXGtfYo'
        }
      ]
    },
    {
      id: 'the-product-rule-for-independent-events',
      title: 'The product rule for independent events',
      blocks: [
        {
          type: 'tip',
          body: `We haven't found a CAPS video for this sub-topic yet. Ask Angelo if you're stuck on it.`
        }
      ]
    },
    {
      id: 'tree-diagrams',
      title: 'Tree diagrams',
      blocks: [
        {
          type: 'video',
          title: 'Watch: Gr 11 Probability: Tree diagram — Kevinmathscience',
          videoId: 'twLaGOvMVr8',
          videoIdAf: 'tl8N0x6fH48'
        }
      ]
    },
    {
      id: 'contingency-two-way-tables',
      title: 'Contingency (two-way) tables',
      blocks: [
        {
          type: 'video',
          title: 'Watch: Gr 11 Probability: Contingency table — Kevinmathscience',
          videoId: '1kMkeNoU7SU'
        }
      ]
    }
  ]
}

export default probabilityGr11
