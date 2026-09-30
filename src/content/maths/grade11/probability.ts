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
  titleAf: 'Waarskynlikheid',
  capsWeight: 0,
  // Curated per CAPS sub-topic — see docs/curriculum/ and scripts/curate-videos.ts
  sections: [
    {
      id: 'overview',
      title: 'Probability',
      titleAf: 'Waarskynlikheid',
      blocks: [
        {
          type: 'theory',
          title: 'What this topic covers',
          titleAf: 'Wat hierdie onderwerp dek',
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
      titleAf: 'Afhanklike en onafhanklike gebeurtenisse',
      blocks: [
        {
          type: 'video',
          title: 'Watch: Gr 11 Probability: Independent events — Kevinmathscience',
          videoId: 'axJSsykVmfE',
          videoIdAf: 'X4qRoXGtfYo',
          titleAf: 'Kyk: 02 Onafhanklike gebeurtenisse — Wiskunde_Mathematics_SUM'
        }
      ]
    },
    {
      id: 'the-product-rule-for-independent-events',
      title: 'The product rule for independent events',
      titleAf: 'Die produkreël vir onafhanklike gebeurtenisse',
      blocks: [
        {
          type: 'video',
          videoIdAf: '3FKNRkhf8Eo',
          titleAf: 'Kyk: Hersiening van waarskynlikheid se reëls - Graad 11 — SlimDink'
        }
      ]
    },
    {
      id: 'tree-diagrams',
      title: 'Tree diagrams',
      titleAf: 'Boomdiagramme',
      blocks: [
        {
          type: 'video',
          title: 'Watch: Gr 11 Probability: Tree diagram — Kevinmathscience',
          videoId: 'twLaGOvMVr8',
          videoIdAf: 'tl8N0x6fH48',
          titleAf: 'Kyk: Waarskynlikheid Boom Diagram Graad 11 en ouer (wiskdou) — Dou Kleefstra'
        }
      ]
    },
    {
      id: 'contingency-two-way-tables',
      title: 'Contingency (two-way) tables',
      titleAf: 'Gebeurlikheidstabelle (tweerigtingtabelle)',
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
