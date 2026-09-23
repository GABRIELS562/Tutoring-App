import type { TopicContent } from '@/types'

// Scaffolded from the CAPS handbook (src/content/caps-curriculum.ts).
// One section per sub-topic; videos are filled by
// scripts/apply-curated-videos.ts.
export const functionsGr11: TopicContent = {
  id: 'functions-gr11',
  slug: 'functions-gr11',
  subject: 'maths',
  grade: 11,
  paper: 1,
  title: 'Functions & Graphs',
  capsWeight: 0,
  // Curated per CAPS sub-topic — see docs/curriculum/ and scripts/curate-videos.ts
  sections: [
    {
      id: 'overview',
      title: 'Functions & Graphs',
      blocks: [
        {
          type: 'theory',
          title: 'What this topic covers',
          body: `• The parabola y = a(x - p)² + q
• The hyperbola y = a/(x - p) + q
• The exponential graph y = ab^(x - p) + q
• Introduction to inverse functions`
        }
      ]
    },
    {
      id: 'the-parabola-y-a-x-p-q',
      title: 'The parabola y = a(x - p)² + q',
      blocks: [
        {
          type: 'video',
          title: 'Watch: Draw Parabola Grade 11 | Part 1 | Grade 11 Functions — Kevinmathscience',
          videoId: 'VEFdT971Tzs'
        }
      ]
    },
    {
      id: 'the-hyperbola-y-a-x-p-q',
      title: 'The hyperbola y = a/(x - p) + q',
      blocks: [
        {
          type: 'video',
          title: 'Watch: Draw Hyperbola | Grade 11 Functions — Kevinmathscience',
          videoId: 'L1KXB4w1uM8'
        }
      ]
    },
    {
      id: 'the-exponential-graph-y-ab-x-p-q',
      title: 'The exponential graph y = ab^(x - p) + q',
      blocks: [
        {
          type: 'video',
          title: 'Watch: Exponential Equation Given Graph | Grade 11 Functions — Kevinmathscience',
          videoId: 'mlk0Df2z9No'
        }
      ]
    },
    {
      id: 'introduction-to-inverse-functions',
      title: 'Introduction to inverse functions',
      blocks: [
        {
          type: 'video',
          title: 'Watch: 9a) Worksheet Functions Inverses — Kevinmathscience',
          videoId: '25ey8Ea0jcM'
        }
      ]
    }
  ]
}

export default functionsGr11
