import type { TopicContent } from '@/types'

export const statisticsGr11: TopicContent = {
  id: 'statistics-gr11',
  slug: 'statistics-gr11',
  subject: 'maths',
  grade: 11,
  paper: 2,
  title: 'Statistics',
  capsWeight: 15,
  // Curated per CAPS sub-topic — see docs/curriculum/ and scripts/curate-videos.ts
  // Curated per CAPS sub-topic — see docs/curriculum/ and scripts/curate-videos.ts
  sections: [
    {
      id: 'overview',
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
        }
      ]
    },
    {
      id: 'grouped-data-analysis',
      title: 'Grouped data analysis',
      blocks: [
        {
          type: 'tip',
          body: `We haven't found a CAPS video for this sub-topic yet. Ask Angelo if you're stuck on it.`
        }
      ]
    },
    {
      id: 'ogives-cumulative-frequency-graphs',
      title: 'Ogives (cumulative frequency graphs)',
      blocks: [
        {
          type: 'video',
          title: 'Watch: Statistics Grade 11: Ogive curve — Kevinmathscience',
          videoId: 'CTj0OE6lkkg',
          videoIdAf: 'ucyLKgz8O_k'
        }
      ]
    },
    {
      id: 'variance-and-standard-deviation',
      title: 'Variance and standard deviation',
      blocks: [
        {
          type: 'tip',
          body: `We haven't found a CAPS video for this sub-topic yet. Ask Angelo if you're stuck on it.`
        }
      ]
    },
    {
      id: 'symmetric-and-skewed-data',
      title: 'Symmetric and skewed data',
      blocks: [
        {
          type: 'tip',
          body: `We haven't found a CAPS video for this sub-topic yet. Ask Angelo if you're stuck on it.`
        }
      ]
    }
  ]
}

export default statisticsGr11
