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
          title: 'Full Notes Coming Soon',
          body: `Full notes for this topic are coming soon. In the meantime, watch the Mindset Learn video below.

This topic covers:
• **Measures of Central Tendency** - Mean, median, mode
• **Measures of Dispersion** - Range, quartiles, interquartile range
• **Five Number Summary** - Minimum, Q1, median, Q3, maximum
• **Box and Whisker Diagrams** - Drawing and interpreting
• **Grouped Data** - Frequency tables, class intervals
• **Histograms** - Drawing and interpreting frequency histograms
• **Frequency Polygons** - Connecting midpoints of histogram bars`
        },
        {
          type: 'video',
          title: 'Watch: Statistics — Mindset Learn',
          videoId: 'MINDSET_STATISTICS_GR10'
        }
      ]
    }
  ]
}

export default statisticsGr10
