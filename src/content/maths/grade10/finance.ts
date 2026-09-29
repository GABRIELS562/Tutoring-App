import type { TopicContent } from '@/types'

export const financeGr10: TopicContent = {
  id: 'finance-gr10',
  slug: 'finance-gr10',
  subject: 'maths',
  grade: 10,
  paper: 1,
  title: 'Finance & Growth',
  titleAf: 'Finansiële Wiskunde',
  capsWeight: 10,
  // Curated per CAPS sub-topic — see docs/curriculum/ and scripts/curate-videos.ts
  sections: [
    {
      id: 'overview',
      title: 'Finance & Growth',
      titleAf: 'Finansiële Wiskunde',
      blocks: [
        {
          type: 'theory',
          title: 'What this topic covers',
          titleAf: 'Wat hierdie onderwerp dek',
          body: `• **Simple Interest** - $A = P(1 + in)$
• **Compound Interest** - $A = P(1 + i)^n$
• **Comparing Simple and Compound Interest** - When each is better
• **Hire Purchase** - Calculating repayments with interest
• **Inflation** - Effect on prices over time
• **Exchange Rates** - Converting between currencies
• **Population Growth** - Applying compound growth to populations`
        }
      ]
    },
    {
      id: 'simple-interest',
      title: 'Simple interest',
      titleAf: 'Enkelvoudige rente',
      blocks: [
        {
          type: 'video',
          title: 'Watch: Financial Maths Grade 10 | Simple Interest Introduction — Kevinmathscience',
          videoId: 'AKU4lSQvrnI',
          videoIdAf: 'u5Hee0AuS0c',
          titleAf: 'Kyk: Enkelvoudige Rente — Wiskunde Broers'
        }
      ]
    },
    {
      id: 'compound-interest',
      title: 'Compound interest',
      titleAf: 'Saamgestelde rente',
      blocks: [
        {
          type: 'video',
          title: 'Watch: Financial Maths Grade 10 | Compound Interest | Introduction — Kevinmathscience',
          videoId: 'JfxQPa9cvtM',
          videoIdAf: 'wx1oj6V5yYY',
          titleAf: 'Kyk: Saamgestelde Rente — Wiskunde Broers'
        }
      ]
    },
    {
      id: 'simple-and-compound-depreciation',
      title: 'Simple and compound depreciation',
      titleAf: 'Enkelvoudige en saamgestelde waardevermindering',
      blocks: [
        // Labelled for an adjacent grade; CAPS covers this sub-topic in both.
        {
          type: 'video',
          title: 'Watch: Financial maths grade 11 | Depreciation — Kevinmathscience',
          videoId: 'uXwERKx08C4',
          videoIdAf: '2S7XoVOFKJ4',
          titleAf: 'Kyk: Waardevermindering of Depresiasie Gr11&12 — TheWhiteboardSA'
        }
      ]
    },
    {
      id: 'hire-purchase',
      title: 'Hire-purchase',
      titleAf: 'Huurkoop',
      blocks: [
        {
          type: 'video',
          title: 'Watch: Financial Maths Grade 10 | Hire Purchase | Introduction — Kevinmathscience',
          videoId: 't3ENY1s1zaw',
          videoIdAf: 'LXRlc1LRrDQ',
          titleAf: 'Kyk: 03 Huurkoop — Wiskunde_Mathematics_SUM'
        }
      ]
    },
    {
      id: 'exchange-rates',
      title: 'Exchange rates',
      titleAf: 'Wisselkoerse',
      blocks: [
        {
          type: 'video',
          title: 'Watch: 08 Exchange rate — Wiskunde_Mathematics_SUM',
          videoId: 'Rr9b0jNVLiE',
          videoIdAf: 'FDq8ifmRCGE',
          titleAf: 'Kyk: Wisselkoers — Wiskunde Broers'
        }
      ]
    }
  ]
}

export default financeGr10
