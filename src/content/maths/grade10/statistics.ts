import type { TopicContent } from '@/types'

export const statisticsGr10: TopicContent = {
  id: 'statistics-gr10',
  slug: 'statistics-gr10',
  subject: 'maths',
  grade: 10,
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
          body: `• **Measures of Central Tendency** - Mean, median, mode
• **Measures of Dispersion** - Range, quartiles, interquartile range
• **Five Number Summary** - Minimum, Q1, median, Q3, maximum
• **Box and Whisker Diagrams** - Drawing and interpreting
• **Grouped Data** - Frequency tables, class intervals
• **Histograms** - Drawing and interpreting frequency histograms
• **Frequency Polygons** - Connecting midpoints of histogram bars`
        },
        // PROVISIONAL video picks — auto-filled 2026-09-18 from docs/client-updates/video-candidates; client to confirm.
        {
          type: 'video',
          title: 'Watch: Statistics Grade 10: Mean, mode, median — Kevinmathscience',
          videoId: 'xi8VjMmWdgI',
          videoIdAf: 'twoRWkbvv_o',
          titleAf: 'Watch: Graad 10 Wiskunde Les 1 Statistiek — Rochelle Van der Merwe'
        },
        {
          type: 'video',
          title: 'Watch: Statistics Grade 10: Exam Question — Kevinmathscience',
          videoId: 'Hc-BUqBaUkQ'
        }
        // TODO(curator): add { type: 'formula', formulas: [...] } block
      ]
    }
  ]
}

export default statisticsGr10
