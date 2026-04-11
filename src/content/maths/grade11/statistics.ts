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
          title: 'Full Notes Coming Soon',
          body: `Full notes for this topic are coming soon. In the meantime, watch the Mindset Learn video below.

This topic covers:
• **Measures of Central Tendency** - Mean, median, mode for grouped and ungrouped data
• **Measures of Dispersion** - Range, variance, standard deviation
• **Five Number Summary** - Min, Q1, median, Q3, max
• **Box and Whisker Plots** - Drawing and interpreting
• **Histograms and Frequency Polygons** - Displaying data
• **Ogives (Cumulative Frequency Curves)** - Reading percentiles and quartiles
• **Scatter Plots and Correlation** - Identifying trends and relationships`
        },
        {
          type: 'video',
          title: 'Watch: Statistics — Mindset Learn',
          videoId: 'MINDSET_STATISTICS_GR11'
        }
      ]
    }
  ]
}

export default statisticsGr11
