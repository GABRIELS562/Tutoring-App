import type { TopicContent } from '@/types'

export const financeGr10: TopicContent = {
  id: 'finance-gr10',
  slug: 'finance-gr10',
  subject: 'maths',
  grade: 10,
  paper: 1,
  title: 'Finance and Growth',
  capsWeight: 10,
  sections: [
    {
      id: 'coming-soon',
      title: 'Finance and Growth',
      blocks: [
        {
          type: 'theory',
          title: 'What this topic covers',
          body: `• **Simple Interest** - $A = P(1 + in)$
• **Compound Interest** - $A = P(1 + i)^n$
• **Comparing Simple and Compound Interest** - When each is better
• **Hire Purchase** - Calculating repayments with interest
• **Inflation** - Effect on prices over time
• **Exchange Rates** - Converting between currencies
• **Population Growth** - Applying compound growth to populations`
        },
        // PROVISIONAL video picks — auto-filled 2026-09-18 from docs/client-updates/video-candidates; client to confirm.
        {
          type: 'video',
          title: 'Watch: Financial Maths Grade 10 | Simple Interest Introduction — Kevinmathscience',
          videoId: 'AKU4lSQvrnI',
          videoIdAf: 'T7zTTrn1ulE',
          titleAf: 'Watch: Graad 10 enkelvoudige en saamgestelde rente — Rochelle Van der Merwe'
        },
        {
          type: 'video',
          title: 'Watch: Financial Maths Grade 10 Past Paper Exam Question 1 — Miss Martins Maths and Science',
          videoId: '3cj331uG3uI'
        }
        // TODO(curator): add { type: 'formula', formulas: [...] } block
      ]
    }
  ]
}

export default financeGr10
