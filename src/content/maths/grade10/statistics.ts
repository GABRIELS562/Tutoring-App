import type { TopicContent } from '@/types'

export const statisticsGr10: TopicContent = {
  id: 'statistics-gr10',
  slug: 'statistics-gr10',
  subject: 'maths',
  grade: 10,
  paper: 2,
  title: 'Statistics',
  titleAf: 'Statistiek',
  capsWeight: 15,
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
      titleAf: 'Dataversameling en -organisasie',
      blocks: [
        {
          type: 'content_gap',
          body: `No CAPS video has been sourced for this sub-topic yet. Ask Angelo if you're stuck on it in the meantime.`,
          bodyAf: `Daar is nog nie 'n KABV-video vir hierdie onderafdeling nie. Vra solank vir Angelo as jy vashaak.`
        }
      ]
    },
    {
      id: 'measures-of-central-tendency-mean-median-mode',
      title: 'Measures of central tendency: mean, median, mode',
      titleAf: 'Maatstawwe van sentrale neiging: gemiddeld, mediaan, modus',
      blocks: [
        {
          type: 'video',
          title: 'Watch: Statistics Grade 10: Mean, mode, median — Kevinmathscience',
          videoId: 'xi8VjMmWdgI',
          videoIdAf: 'fkKU5F9LR7U',
          titleAf: 'Kyk: W10 Gemiddeld, Mediaan, Modus — Stefan Buys'
        }
      ]
    },
    {
      id: 'measures-of-dispersion-range-quartiles-percentil',
      title: 'Measures of dispersion: range, quartiles, percentiles',
      titleAf: 'Maatstawwe van spreiding: omvang, kwartiele, persentiele',
      blocks: [
        {
          type: 'video',
          title: 'Watch: Statistics Grade 10: Quartiles — Kevinmathscience',
          videoId: 'dxLjUO8tzSA',
          videoIdAf: 'udHAZsQxn0Q',
          titleAf: 'Kyk: W10 Kwartiele en persentiele — Stefan Buys'
        }
      ]
    },
    {
      id: 'box-and-whisker-plots',
      title: 'Box and whisker plots',
      titleAf: 'Mond-en-snordiagramme',
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
