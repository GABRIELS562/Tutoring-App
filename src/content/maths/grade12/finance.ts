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
  titleAf: 'Finansiële Wiskunde',
  capsWeight: 0,
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
          body: `• Future value annuity formula
• Present value annuity formula
• Loan repayments and outstanding balances`
        }
      ]
    },
    {
      id: 'future-value-annuity-formula',
      title: 'Future value annuity formula',
      titleAf: 'Formule vir toekomstige waarde-annuïteite',
      blocks: [
        {
          type: 'video',
          title: 'Watch: Financial Mathematics Grade 12: L3 Future Value Annuities — Online Maths by Miss Pythagoras',
          videoId: 'rlShQ-qRGmo'
        }
      ]
    },
    {
      id: 'present-value-annuity-formula',
      title: 'Present value annuity formula',
      titleAf: 'Formule vir huidige waarde-annuïteite',
      blocks: [
        {
          type: 'video',
          title: 'Watch: Grade 12 Financial Maths Present Value Annuity with Missed Payments (DBE/NSC Maths/CAPS) | NTE — NTE \\ New Technological Education',
          videoId: 'du0inCjMRYw'
        }
      ]
    },
    {
      id: 'loan-repayments-and-outstanding-balances',
      title: 'Loan repayments and outstanding balances',
      titleAf: 'Leningterugbetalings en uitstaande balanse',
      blocks: [
        {
          type: 'video',
          title: 'Watch: Outstanding balance grade 12: Present value method — Kevinmathscience',
          videoId: 'OtG6hAC7L0Q'
        }
      ]
    }
  ]
}

export default financeGr12
