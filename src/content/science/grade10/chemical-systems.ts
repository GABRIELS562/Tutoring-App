import type { TopicContent } from '@/types'

// Scaffolded from the CAPS Physical Sciences curriculum
// (src/content/caps-science-curriculum.ts). One section per sub-topic;
// videos are filled by scripts/apply-curated-videos.ts.
export const chemicalSystemsGr10: TopicContent = {
  id: 'chemical-systems-gr10',
  slug: 'chemical-systems-gr10',
  subject: 'science',
  grade: 10,
  paper: 2,
  title: 'Chemical Systems',
  titleAf: 'Chemiese Stelsels',
  capsWeight: 5,
  // Curated per CAPS sub-topic — see docs/curriculum/ and scripts/curate-videos.ts
  sections: [
    {
      id: 'overview',
      title: 'Chemical Systems',
      titleAf: 'Chemiese Stelsels',
      blocks: [
        {
          type: 'theory',
          title: 'What this topic covers',
          titleAf: 'Wat hierdie onderwerp dek',
          body: `• The hydrosphere: where the Earth's water is found
• Interaction of the hydrosphere with the atmosphere, lithosphere and biosphere
• Water quality and the purification of water
• The impact of dams on people and ecology`
        }
      ]
    },
    {
      id: 'the-hydrosphere-where-the-earth-s-water-is-found',
      title: 'The hydrosphere: where the Earth\'s water is found',
      titleAf: 'Die hidrosfeer: waar die aarde se water voorkom',
      blocks: [
        {
          type: 'video',
          title: 'Watch: Interaction Between Hydrosphere and Biosphere | Grade 10 Chemistry — Goon School',
          videoId: 'uJhN2VbOpag'
        }
      ]
    },
    {
      id: 'interaction-of-the-hydrosphere-with-the-atmosphe',
      title: 'Interaction of the hydrosphere with the atmosphere, lithosphere and biosphere',
      titleAf: 'Wisselwerking van die hidrosfeer met die atmosfeer, litosfeer en biosfeer',
      blocks: [
        {
          type: 'content_gap',
          body: `No CAPS video has been sourced for this sub-topic yet. Ask Angelo if you're stuck on it in the meantime.`,
          bodyAf: `Daar is nog nie 'n KABV-video vir hierdie onderafdeling nie. Vra solank vir Angelo as jy vashaak.`
        }
      ]
    },
    {
      id: 'water-quality-and-the-purification-of-water',
      title: 'Water quality and the purification of water',
      titleAf: 'Watergehalte en die suiwering van water',
      blocks: [
        {
          type: 'content_gap',
          body: `No CAPS video has been sourced for this sub-topic yet. Ask Angelo if you're stuck on it in the meantime.`,
          bodyAf: `Daar is nog nie 'n KABV-video vir hierdie onderafdeling nie. Vra solank vir Angelo as jy vashaak.`
        }
      ]
    },
    {
      id: 'the-impact-of-dams-on-people-and-ecology',
      title: 'The impact of dams on people and ecology',
      titleAf: 'Die impak van damme op mense en ekologie',
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

export default chemicalSystemsGr10
