import type { TopicContent } from '@/types'

// Scaffolded from the CAPS handbook (src/content/caps-curriculum.ts).
// One section per sub-topic; videos are filled by
// scripts/apply-curated-videos.ts.
export const financeGr11: TopicContent = {
  id: 'finance-gr11',
  slug: 'finance-gr11',
  subject: 'maths',
  grade: 11,
  paper: 1,
  title: 'Finance & Growth',
  capsWeight: 0,
  // Curated per CAPS sub-topic — see docs/curriculum/ and scripts/curate-videos.ts
  // Curated per CAPS sub-topic — see docs/curriculum/ and scripts/curate-videos.ts
  // Curated per CAPS sub-topic — see docs/curriculum/ and scripts/curate-videos.ts
  sections: [
    {
      id: 'overview',
      title: 'Finance & Growth',
      blocks: [
        {
          type: 'theory',
          title: 'What this topic covers',
          body: `• Sinking funds
• Future value annuities
• Present value annuities
• Nominal versus effective interest rates`
        }
      ]
    },
    {
      id: 'sinking-funds',
      title: 'Sinking funds',
      blocks: [
        {
          type: 'tip',
          body: `We haven't found a CAPS video for this sub-topic yet. Ask Angelo if you're stuck on it.`
        }
      ]
    },
    {
      id: 'future-value-annuities',
      title: 'Future value annuities',
      blocks: [
        // Labelled for an adjacent grade; CAPS covers this sub-topic in both.
        {
          type: 'video',
          title: 'Watch: Grade 12 Financial Maths Lesson 5 | Present-Value & Future-Value Annuities |  Mlungisi Nkosi — Mlungisi Nkosi Maths & Science',
          videoId: '16Hw202Et5o'
        }
      ]
    },
    {
      id: 'present-value-annuities',
      title: 'Present value annuities',
      blocks: [
        {
          type: 'tip',
          body: `We haven't found a CAPS video for this sub-topic yet. Ask Angelo if you're stuck on it.`
        }
      ]
    },
    {
      id: 'nominal-versus-effective-interest-rates',
      title: 'Nominal versus effective interest rates',
      blocks: [
        {
          type: 'video',
          title: 'Watch: 04 Effective and nominal interest rates — Wiskunde_Mathematics_SUM',
          videoId: 'dml0IOgpPWw',
          videoIdAf: 'Rbgtx-bR9CI'
        }
      ]
    }
  ]
}

export default financeGr11
