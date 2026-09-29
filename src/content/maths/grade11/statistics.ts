import type { TopicContent } from '@/types'

export const statisticsGr11: TopicContent = {
  id: 'statistics-gr11',
  slug: 'statistics-gr11',
  subject: 'maths',
  grade: 11,
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
      titleAf: 'Ontleding van gegroepeerde data',
      blocks: [
        {
          type: 'content_gap',
          body: `No CAPS video has been sourced for this sub-topic yet. Ask Angelo if you're stuck on it in the meantime.`,
          bodyAf: `Daar is nog nie 'n KABV-video vir hierdie onderafdeling nie. Vra solank vir Angelo as jy vashaak.`
        }
      ]
    },
    {
      id: 'ogives-cumulative-frequency-graphs',
      title: 'Ogives (cumulative frequency graphs)',
      titleAf: 'Ogiewe (kumulatiewe frekwensiegrafieke)',
      blocks: [
        {
          type: 'video',
          title: 'Watch: Statistics Grade 11: Ogive curve — Kevinmathscience',
          videoId: 'CTj0OE6lkkg',
          videoIdAf: 'gv0EoWtjvq0',
          titleAf: 'Kyk: Ogief — Wolkskool'
        }
      ]
    },
    {
      id: 'variance-and-standard-deviation',
      title: 'Variance and standard deviation',
      titleAf: 'Variansie en standaardafwyking',
      blocks: [
        {
          type: 'content_gap',
          body: `No CAPS video has been sourced for this sub-topic yet. Ask Angelo if you're stuck on it in the meantime.`,
          bodyAf: `Daar is nog nie 'n KABV-video vir hierdie onderafdeling nie. Vra solank vir Angelo as jy vashaak.`
        }
      ]
    },
    {
      id: 'symmetric-and-skewed-data',
      title: 'Symmetric and skewed data',
      titleAf: 'Simmetriese en skewe data',
      blocks: [
        {
          type: 'content_gap',
          body: `No CAPS video has been sourced for this sub-topic yet. Ask Angelo if you're stuck on it in the meantime.`,
          bodyAf: `Daar is nog nie 'n KABV-video vir hierdie onderafdeling nie. Vra solank vir Angelo as jy vashaak.`
        }
      ]
    }
  ]
}

export default statisticsGr11
