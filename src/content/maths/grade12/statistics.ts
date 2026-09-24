import type { TopicContent } from '@/types'

// Scaffolded from the CAPS handbook (src/content/caps-curriculum.ts).
// One section per sub-topic; videos are filled by
// scripts/apply-curated-videos.ts.
export const statisticsGr12: TopicContent = {
  id: 'statistics-gr12',
  slug: 'statistics-gr12',
  subject: 'maths',
  grade: 12,
  paper: 2,
  title: 'Statistics',
  titleAf: 'Statistiek',
  capsWeight: 0,
  // Curated per CAPS sub-topic — see docs/curriculum/ and scripts/curate-videos.ts
  sections: [
    {
      id: 'overview',
      title: 'Statistics',
      titleAf: 'Statistiek',
      blocks: [
        {
          type: 'theory',
          title: 'What this topic covers',
          titleAf: 'Wat hierdie onderwerp dek',
          body: `• Bivariate data
• Scatter plots and lines of best fit
• The least-squares regression line y = A + Bx
• The correlation coefficient r`
        }
      ]
    },
    {
      id: 'bivariate-data',
      title: 'Bivariate data',
      titleAf: 'Tweeveranderlike data',
      blocks: [
        {
          type: 'video',
          title: 'Watch: Mlungisi Nkosi | Grade 12 Mathematics | Statistics | Least Square Regression Line | Line of best fit — Mlungisi Nkosi Maths & Science',
          videoId: 'cFYwJhUcPRM'
        }
      ]
    },
    {
      id: 'scatter-plots-and-lines-of-best-fit',
      title: 'Scatter plots and lines of best fit',
      titleAf: 'Spreidiagramme en lyne van beste passing',
      blocks: [
        {
          type: 'video',
          title: 'Watch: Statistics Grade 12 : line of best fit — Kevinmathscience',
          videoId: 'yXbx5EHE1ag'
        }
      ]
    },
    {
      id: 'the-least-squares-regression-line-y-a-bx',
      title: 'The least-squares regression line y = A + Bx',
      titleAf: 'Die kleinstekwadrate-regressielyn y = A + Bx',
      blocks: [
        {
          type: 'video',
          title: 'Watch: Statistics Grade 12 Mathematics September 2021 Trial | Scatter Plot, Least Squares Regression Line.. — Khoza Explains',
          videoId: 'vEDMk4xVa8k'
        }
      ]
    },
    {
      id: 'the-correlation-coefficient-r',
      title: 'The correlation coefficient r',
      titleAf: 'Die korrelasiekoëffisiënt r',
      blocks: [
        {
          type: 'video',
          title: 'Kyk: Statistiek Graad12:L3 Korrelasie en korrelasiekoeffisiënt — Online Maths by Miss Pythagoras',
          videoIdAf: 'Jiml5rfBIlw'
        }
      ]
    }
  ]
}

export default statisticsGr12
