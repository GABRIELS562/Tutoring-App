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
  capsWeight: 0,
  sections: [
    {
      id: 'overview',
      title: 'Statistics',
      blocks: [
        {
          type: 'theory',
          title: 'What this topic covers',
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
      blocks: [
        {
          type: 'tip',
          body: `A curated video for this sub-topic is on the way. Ask Angelo if you're stuck on it.`
        }
      ]
    },
    {
      id: 'scatter-plots-and-lines-of-best-fit',
      title: 'Scatter plots and lines of best fit',
      blocks: [
        {
          type: 'tip',
          body: `A curated video for this sub-topic is on the way. Ask Angelo if you're stuck on it.`
        }
      ]
    },
    {
      id: 'the-least-squares-regression-line-y-a-bx',
      title: 'The least-squares regression line y = A + Bx',
      blocks: [
        {
          type: 'tip',
          body: `A curated video for this sub-topic is on the way. Ask Angelo if you're stuck on it.`
        }
      ]
    },
    {
      id: 'the-correlation-coefficient-r',
      title: 'The correlation coefficient r',
      blocks: [
        {
          type: 'tip',
          body: `A curated video for this sub-topic is on the way. Ask Angelo if you're stuck on it.`
        }
      ]
    }
  ]
}

export default statisticsGr12
