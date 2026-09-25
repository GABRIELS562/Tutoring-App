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
      titleAf: 'Delgingsfondse',
      blocks: [
        {
          type: 'content_gap',
          body: `No CAPS video has been sourced for this sub-topic yet. Ask Angelo if you're stuck on it in the meantime.`,
          bodyAf: `Daar is nog nie 'n KABV-video vir hierdie onderafdeling nie. Vra solank vir Angelo as jy vashaak.`
        }
      ]
    },
    {
      id: 'future-value-annuities',
      title: 'Future value annuities',
      titleAf: 'Toekomstige waarde-annuïteite',
      blocks: [
        // Labelled for an adjacent grade; CAPS covers this sub-topic in both.
        {
          type: 'video',
          title: 'Watch: Grade 12 Financial Maths Lesson 5 | Present-Value & Future-Value Annuities |  Mlungisi Nkosi — Mlungisi Nkosi Maths & Science',
          videoId: '16Hw202Et5o',
          videoIdAf: 'xmgSEimN_G0'
        }
      ]
    },
    {
      id: 'present-value-annuities',
      title: 'Present value annuities',
      titleAf: 'Huidige waarde-annuïteite',
      blocks: [
        {
          type: 'video',
          title: 'Kyk: 03 Huidige waarde annuïteite — Wiskunde_Mathematics_SUM',
          videoIdAf: 'xgMk-9CT0dI'
        }
      ]
    },
    {
      id: 'nominal-versus-effective-interest-rates',
      title: 'Nominal versus effective interest rates',
      titleAf: 'Nominale teenoor effektiewe rentekoerse',
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
