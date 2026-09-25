import type { TopicContent } from '@/types'

// Scaffolded from the CAPS Physical Sciences curriculum
// (src/content/caps-science-curriculum.ts). One section per sub-topic;
// videos are filled by scripts/apply-curated-videos.ts.
export const chemicalSystemsGr11: TopicContent = {
  id: 'chemical-systems-gr11',
  slug: 'chemical-systems-gr11',
  subject: 'science',
  grade: 11,
  paper: 2,
  title: 'Chemical Systems',
  capsWeight: 5,
  // Curated per CAPS sub-topic — see docs/curriculum/ and scripts/curate-videos.ts
  sections: [
    {
      id: 'overview',
      title: 'Chemical Systems',
      blocks: [
        {
          type: 'theory',
          title: 'What this topic covers',
          titleAf: 'Wat hierdie onderwerp dek',
          body: `• The lithosphere as a source of materials: abundance, distribution and ores
• Mining and mineral processing in South Africa
• The recovery of gold: from ore to metal
• Environmental impact of mining and mineral recovery
• Burning of fossil fuels and global warming`
        }
      ]
    },
    {
      id: 'the-lithosphere-as-a-source-of-materials-abundan',
      title: 'The lithosphere as a source of materials: abundance, distribution and ores',
      blocks: [
        {
          type: 'video',
          title: 'Watch: Mineral Resources Of The Lithosphere  (English) — Mindset',
          videoId: 'dk8CrwdqElo'
        }
      ]
    },
    {
      id: 'mining-and-mineral-processing-in-south-africa',
      title: 'Mining and mineral processing in South Africa',
      blocks: [
        {
          type: 'content_gap',
          body: `No CAPS video has been sourced for this sub-topic yet. Ask Angelo if you're stuck on it in the meantime.`,
          bodyAf: `Daar is nog nie 'n KABV-video vir hierdie onderafdeling nie. Vra solank vir Angelo as jy vashaak.`
        }
      ]
    },
    {
      id: 'the-recovery-of-gold-from-ore-to-metal',
      title: 'The recovery of gold: from ore to metal',
      blocks: [
        {
          type: 'content_gap',
          body: `No CAPS video has been sourced for this sub-topic yet. Ask Angelo if you're stuck on it in the meantime.`,
          bodyAf: `Daar is nog nie 'n KABV-video vir hierdie onderafdeling nie. Vra solank vir Angelo as jy vashaak.`
        }
      ]
    },
    {
      id: 'environmental-impact-of-mining-and-mineral-recov',
      title: 'Environmental impact of mining and mineral recovery',
      blocks: [
        {
          type: 'content_gap',
          body: `No CAPS video has been sourced for this sub-topic yet. Ask Angelo if you're stuck on it in the meantime.`,
          bodyAf: `Daar is nog nie 'n KABV-video vir hierdie onderafdeling nie. Vra solank vir Angelo as jy vashaak.`
        }
      ]
    },
    {
      id: 'burning-of-fossil-fuels-and-global-warming',
      title: 'Burning of fossil fuels and global warming',
      blocks: [
        {
          type: 'content_gap',
          body: `No CAPS video has been sourced for this sub-topic yet. Ask Angelo if you're stuck on it in the meantime.`,
          bodyAf: `Daar is nog nie 'n KABV-video vir hierdie onderafdeling nie. Vra solank vir Angelo as jy vashaak.`
        }
      ]
    }
  ]
}

export default chemicalSystemsGr11
