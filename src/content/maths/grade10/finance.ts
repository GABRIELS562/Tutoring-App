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
          title: 'Full Notes Coming Soon',
          body: `Full notes for this topic are coming soon. In the meantime, watch the Mindset Learn video below.

This topic covers:
• **Simple Interest** - $A = P(1 + in)$
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
          videoIdAf: 'OEZNES1qBuE',
          titleAf: 'Watch: Enkelvoudig en Saamgestelde rente - lang metode Wisk Gelet — TheWhiteboardSA'
        },
        {
          type: 'video',
          title: 'Watch: Financial Maths Grade 10 Past Paper Exam Question 1 — Miss Martins Maths and Science',
          videoId: '3cj331uG3uI'
        }
      ]
    }
  ]
}

export default financeGr10
