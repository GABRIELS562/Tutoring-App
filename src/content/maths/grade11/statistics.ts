import type { TopicContent } from '@/types'

export const statisticsGr11: TopicContent = {
  id: 'statistics-gr11',
  slug: 'statistics-gr11',
  subject: 'maths',
  grade: 11,
  paper: 2,
  title: 'Statistics',
  capsWeight: 15,
  sections: [
    {
      id: 'coming-soon',
      title: 'Statistics',
      blocks: [
        {
          type: 'theory',
          title: 'What this topic covers',
          body: `• **Measures of Central Tendency** - Mean, median, mode for grouped and ungrouped data
• **Measures of Dispersion** - Range, variance, standard deviation
• **Five Number Summary** - Min, Q1, median, Q3, max
• **Box and Whisker Plots** - Drawing and interpreting
• **Histograms and Frequency Polygons** - Displaying data
• **Ogives (Cumulative Frequency Curves)** - Reading percentiles and quartiles
• **Scatter Plots and Correlation** - Identifying trends and relationships`
        },
        // PROVISIONAL video picks — auto-filled 2026-09-18 from docs/client-updates/video-candidates; client to confirm.
        {
          type: 'video',
          title: 'Watch: Statistics Grade 11: Ogive curve — Kevinmathscience',
          videoId: 'CTj0OE6lkkg',
          videoIdAf: 'v0NWn7nXALU',
          titleAf: 'Watch: Gr 11 en 12 Ogief Statistiek Deel 1 - Die Basics — But They Ask It In A Funny Way'
        },
        {
          type: 'video',
          title: 'Watch: Statistics Grade 11 Exam Questions — Kevinmathscience',
          videoId: 'Amf60jAYIaI'
        }
        // TODO(curator): add { type: 'formula', formulas: [...] } block
      ]
    }
  ]
}

export default statisticsGr11
