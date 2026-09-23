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
          body: `A curated video for this sub-topic is on the way. Ask Angelo if you're stuck on it.`
        }
      ]
    },
    {
      id: 'future-value-annuities',
      title: 'Future value annuities',
      blocks: [
        {
          type: 'tip',
          body: `A curated video for this sub-topic is on the way. Ask Angelo if you're stuck on it.`
        }
      ]
    },
    {
      id: 'present-value-annuities',
      title: 'Present value annuities',
      blocks: [
        {
          type: 'tip',
          body: `A curated video for this sub-topic is on the way. Ask Angelo if you're stuck on it.`
        }
      ]
    },
    {
      id: 'nominal-versus-effective-interest-rates',
      title: 'Nominal versus effective interest rates',
      blocks: [
        {
          type: 'tip',
          body: `A curated video for this sub-topic is on the way. Ask Angelo if you're stuck on it.`
        }
      ]
    }
  ]
}

export default financeGr11
