import type { TopicContent } from '@/types'

// Scaffolded from the CAPS handbook (src/content/caps-curriculum.ts).
// One section per sub-topic; videos are filled by
// scripts/apply-curated-videos.ts.
export const financeGr12: TopicContent = {
  id: 'finance-gr12',
  slug: 'finance-gr12',
  subject: 'maths',
  grade: 12,
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
          body: `• Future value annuity formula
• Present value annuity formula
• Loan repayments and outstanding balances`
        }
      ]
    },
    {
      id: 'future-value-annuity-formula',
      title: 'Future value annuity formula',
      blocks: [
        {
          type: 'tip',
          body: `A curated video for this sub-topic is on the way. Ask Angelo if you're stuck on it.`
        }
      ]
    },
    {
      id: 'present-value-annuity-formula',
      title: 'Present value annuity formula',
      blocks: [
        {
          type: 'tip',
          body: `A curated video for this sub-topic is on the way. Ask Angelo if you're stuck on it.`
        }
      ]
    },
    {
      id: 'loan-repayments-and-outstanding-balances',
      title: 'Loan repayments and outstanding balances',
      blocks: [
        {
          type: 'tip',
          body: `A curated video for this sub-topic is on the way. Ask Angelo if you're stuck on it.`
        }
      ]
    }
  ]
}

export default financeGr12
