import { db } from './index'
import { topics } from './schema'
import { eq } from 'drizzle-orm'

// All topics for Grade 10-12 Maths and Science
const topicsData = [
  // Grade 10 Mathematics
  {
    subject: 'maths',
    grade: 10,
    paper: 1,
    name: 'Algebraic Expressions',
    slug: 'algebra-gr10',
    term: 1,
    capsWeightPercent: 20,
    sortOrder: 1,
  },
  {
    subject: 'maths',
    grade: 10,
    paper: 1,
    name: 'Equations and Inequalities',
    slug: 'equations-gr10',
    term: 1,
    capsWeightPercent: 15,
    sortOrder: 2,
  },
  {
    subject: 'maths',
    grade: 10,
    paper: 1,
    name: 'Number Patterns',
    slug: 'number-patterns-gr10',
    term: 1,
    capsWeightPercent: 10,
    sortOrder: 3,
  },
  {
    subject: 'maths',
    grade: 10,
    paper: 1,
    name: 'Functions and Graphs',
    slug: 'functions-gr10',
    term: 2,
    capsWeightPercent: 25,
    sortOrder: 4,
  },
  {
    subject: 'maths',
    grade: 10,
    paper: 1,
    name: 'Finance and Growth',
    slug: 'finance-gr10',
    term: 2,
    capsWeightPercent: 10,
    sortOrder: 5,
  },
  {
    subject: 'maths',
    grade: 10,
    paper: 1,
    name: 'Probability',
    slug: 'probability-gr10',
    term: 4,
    capsWeightPercent: 10,
    sortOrder: 6,
  },
  {
    subject: 'maths',
    grade: 10,
    paper: 2,
    name: 'Trigonometry',
    slug: 'trig-gr10',
    term: 2,
    capsWeightPercent: 20,
    sortOrder: 7,
  },
  {
    subject: 'maths',
    grade: 10,
    paper: 2,
    name: 'Euclidean Geometry',
    slug: 'euclidean-geometry-gr10',
    term: 3,
    capsWeightPercent: 20,
    sortOrder: 8,
  },
  {
    subject: 'maths',
    grade: 10,
    paper: 2,
    name: 'Analytical Geometry',
    slug: 'analytical-geometry-gr10',
    term: 3,
    capsWeightPercent: 15,
    sortOrder: 9,
  },
  {
    subject: 'maths',
    grade: 10,
    paper: 2,
    name: 'Statistics',
    slug: 'statistics-gr10',
    term: 4,
    capsWeightPercent: 15,
    sortOrder: 10,
  },
  // Grade 10 Physical Sciences
  {
    subject: 'science',
    grade: 10,
    paper: 1,
    name: 'Mechanics',
    slug: 'mechanics-gr10',
    term: 1,
    capsWeightPercent: 20,
    sortOrder: 1,
  },
  {
    subject: 'science',
    grade: 10,
    paper: 1,
    name: 'Transverse Waves',
    slug: 'waves-gr10',
    term: 2,
    capsWeightPercent: 15,
    sortOrder: 2,
  },
  {
    subject: 'science',
    grade: 10,
    paper: 1,
    name: 'Sound',
    slug: 'sound-gr10',
    term: 2,
    capsWeightPercent: 10,
    sortOrder: 3,
  },
  {
    subject: 'science',
    grade: 10,
    paper: 1,
    name: 'Electromagnetic Radiation',
    slug: 'em-radiation-gr10',
    term: 2,
    capsWeightPercent: 10,
    sortOrder: 4,
  },
  {
    subject: 'science',
    grade: 10,
    paper: 1,
    name: 'Electric Circuits',
    slug: 'electric-circuits-gr10',
    term: 3,
    capsWeightPercent: 15,
    sortOrder: 5,
  },
  {
    subject: 'science',
    grade: 10,
    paper: 2,
    name: 'Matter and Materials',
    slug: 'matter-materials-gr10',
    term: 1,
    capsWeightPercent: 20,
    sortOrder: 6,
  },
  // Grade 11 Mathematics
  {
    subject: 'maths',
    grade: 11,
    paper: 2,
    name: 'Trigonometry',
    slug: 'trig-gr11',
    term: 1,
    capsWeightPercent: 40,
    sortOrder: 1,
  },
  {
    subject: 'maths',
    grade: 11,
    paper: 2,
    name: 'Analytical Geometry',
    slug: 'analytical-geometry-gr11',
    term: 2,
    capsWeightPercent: 15,
    sortOrder: 2,
  },
  {
    subject: 'maths',
    grade: 11,
    paper: 2,
    name: 'Euclidean Geometry',
    slug: 'euclidean-geometry-gr11',
    term: 3,
    capsWeightPercent: 25,
    sortOrder: 3,
  },
  {
    subject: 'maths',
    grade: 11,
    paper: 2,
    name: 'Statistics',
    slug: 'statistics-gr11',
    term: 4,
    capsWeightPercent: 15,
    sortOrder: 4,
  },
  // Grade 12 Mathematics
  {
    subject: 'maths',
    grade: 12,
    paper: 1,
    name: 'Calculus',
    slug: 'calculus-gr12',
    term: 1,
    capsWeightPercent: 35,
    sortOrder: 1,
  },
  {
    subject: 'maths',
    grade: 12,
    paper: 1,
    name: 'Sequences and Series',
    slug: 'sequences-series-gr12',
    term: 1,
    capsWeightPercent: 25,
    sortOrder: 2,
  },
  {
    subject: 'maths',
    grade: 12,
    paper: 2,
    name: 'Analytical Geometry',
    slug: 'analytical-geometry-gr12',
    term: 2,
    capsWeightPercent: 20,
    sortOrder: 3,
  },
  {
    subject: 'maths',
    grade: 12,
    paper: 2,
    name: 'Euclidean Geometry',
    slug: 'euclidean-geometry-gr12',
    term: 3,
    capsWeightPercent: 25,
    sortOrder: 4,
  },
  {
    subject: 'maths',
    grade: 12,
    paper: 1,
    name: 'Probability',
    slug: 'probability-gr12',
    term: 2,
    capsWeightPercent: 15,
    sortOrder: 5,
  },
  // Grade 11 Physical Sciences
  {
    subject: 'science',
    grade: 11,
    paper: 1,
    name: "Newton's Laws",
    slug: 'newtons-laws-gr11',
    term: 1,
    capsWeightPercent: 20,
    sortOrder: 1,
  },
  {
    subject: 'science',
    grade: 11,
    paper: 1,
    name: 'Waves and Sound',
    slug: 'waves-sound-gr11',
    term: 2,
    capsWeightPercent: 15,
    sortOrder: 2,
  },
  // Grade 12 Physical Sciences
  {
    subject: 'science',
    grade: 12,
    paper: 1,
    name: 'Momentum and Impulse',
    slug: 'momentum-gr12',
    term: 1,
    capsWeightPercent: 15,
    sortOrder: 1,
  },
]

async function seedTopics() {
  console.log('Starting topics seed...')

  for (const topicData of topicsData) {
    // Check if topic already exists
    const existing = await db
      .select()
      .from(topics)
      .where(eq(topics.slug, topicData.slug))

    if (existing.length > 0) {
      console.log(`Topic already exists: ${topicData.name} (${topicData.slug})`)
      continue
    }

    // Insert new topic
    const newTopic = await db
      .insert(topics)
      .values(topicData)
      .returning({ id: topics.id, name: topics.name })

    console.log(`Created topic: ${newTopic[0].name} (${topicData.slug})`)
  }

  console.log('Topics seed complete!')
  process.exit(0)
}

seedTopics().catch((err) => {
  console.error('Seed error:', err)
  process.exit(1)
})
