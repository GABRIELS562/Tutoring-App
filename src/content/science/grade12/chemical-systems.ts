import type { TopicContent } from '@/types'

// Scaffolded from the CAPS Physical Sciences curriculum
// (src/content/caps-science-curriculum.ts). One section per sub-topic;
// videos are filled by scripts/apply-curated-videos.ts.
export const chemicalSystemsGr12: TopicContent = {
  id: 'chemical-systems-gr12',
  slug: 'chemical-systems-gr12',
  subject: 'science',
  grade: 12,
  paper: 2,
  title: 'Chemical Systems',
  capsWeight: 3.5,
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
          body: `• Plant nutrients: non-mineral nutrients and the primary nutrients N, P and K
• The function and sources of N, P and K and the N:P:K ratio
• The Haber process: manufacturing ammonia
• The Ostwald process: manufacturing nitric acid
• The contact process: manufacturing sulfuric acid
• Manufacturing fertilizers: ammonium nitrate, ammonium sulfate and superphosphates
• Eutrophication and evaluating the use of inorganic fertilizers`
        }
      ]
    },
    {
      id: 'plant-nutrients-and-why-fertilizers-are-needed',
      title: 'Plant nutrients and why fertilizers are needed',
      blocks: [
        {
          type: 'video',
          title: 'Watch: Fertilizer Theory — Simple Science',
          videoId: 'YtyMCjBN1so'
        }
      ]
    },
    {
      id: 'the-function-of-nitrogen-phosphorus-and-potassiu',
      title: 'The function of nitrogen, phosphorus and potassium in plants',
      blocks: [
        {
          type: 'content_gap',
          body: `No CAPS video has been sourced for this sub-topic yet. Ask Angelo if you're stuck on it in the meantime.`,
          bodyAf: `Daar is nog nie 'n KABV-video vir hierdie onderafdeling nie. Vra solank vir Angelo as jy vashaak.`
        }
      ]
    },
    {
      id: 'the-haber-process-manufacturing-ammonia',
      title: 'The Haber process: manufacturing ammonia',
      blocks: [
        {
          type: 'video',
          title: 'Watch: The Haber Process — Simple Science',
          videoId: 'Vr8N5P-X4qI'
        }
      ]
    },
    {
      id: 'the-ostwald-process-manufacturing-nitric-acid',
      title: 'The Ostwald process: manufacturing nitric acid',
      blocks: [
        {
          type: 'video',
          title: 'Watch: The Ostwald Process — Simple Science',
          videoId: 'Mx12D7AOV50'
        }
      ]
    },
    {
      id: 'the-contact-process-manufacturing-sulfuric-acid',
      title: 'The contact process: manufacturing sulfuric acid',
      blocks: [
        {
          type: 'video',
          title: 'Watch: The Contact Process — Simple Science',
          videoId: 'sWZFGtywF_c'
        }
      ]
    },
    {
      id: 'manufacturing-fertilizers-ammonium-nitrate-ammon',
      title: 'Manufacturing fertilizers: ammonium nitrate, ammonium sulfate and superphosphates',
      blocks: [
        {
          type: 'video',
          title: 'Watch: Prelim 2020 NPK, Fertilizers, Chemical Industry Grade 12 Physical Sciences — Khoza Explains',
          videoId: 'J-TxSnptZ30'
        }
      ]
    },
    {
      id: 'eutrophication-and-evaluating-the-use-of-inorgan',
      title: 'Eutrophication and evaluating the use of inorganic fertilizers',
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

export default chemicalSystemsGr12
