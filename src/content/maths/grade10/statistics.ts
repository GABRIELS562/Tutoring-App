import type { TopicContent } from '@/types'

export const statisticsGr10: TopicContent = {
  id: 'statistics-gr10',
  slug: 'statistics-gr10',
  subject: 'maths',
  grade: 10,
  paper: 2,
  title: 'Statistics',
  capsWeight: 15,
  // Curated per CAPS sub-topic — see docs/curriculum/ and scripts/curate-videos.ts
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
          body: `• **Measures of Central Tendency** - Mean, median, mode
• **Measures of Dispersion** - Range, quartiles, interquartile range
• **Five Number Summary** - Minimum, Q1, median, Q3, maximum
• **Box and Whisker Diagrams** - Drawing and interpreting
• **Grouped Data** - Frequency tables, class intervals
• **Histograms** - Drawing and interpreting frequency histograms
• **Frequency Polygons** - Connecting midpoints of histogram bars`
        }
      ]
    },
    {
      id: 'data-collection-and-organisation',
      title: 'Data collection and organisation',
      blocks: [
        {
          type: 'tip',
          body: `We haven't found a CAPS video for this sub-topic yet. Ask Angelo if you're stuck on it.`
        }
      ]
    },
    {
      id: 'measures-of-central-tendency-mean-median-mode',
      title: 'Measures of central tendency: mean, median, mode',
      blocks: [
        {
          type: 'video',
          title: 'Watch: Statistics Grade 10: Mean, mode, median — Kevinmathscience',
          videoId: 'xi8VjMmWdgI'
        }
      ]
    },
    {
      id: 'measures-of-dispersion-range-quartiles-percentil',
      title: 'Measures of dispersion: range, quartiles, percentiles',
      blocks: [
        {
          type: 'video',
          title: 'Watch: Statistics Grade 10: Quartiles — Kevinmathscience',
          videoId: 'dxLjUO8tzSA'
        }
      ]
    },
    {
      id: 'box-and-whisker-plots',
      title: 'Box and whisker plots',
      blocks: [
        {
          type: 'video',
          title: 'Watch: Statistics Grade 10: Box and whisker — Kevinmathscience',
          videoId: '94_ljD-J19Y'
        }
      ]
    }
  ]
}

export default statisticsGr10
