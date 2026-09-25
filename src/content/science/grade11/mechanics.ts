import type { TopicContent } from '@/types'

// Scaffolded from the CAPS Physical Sciences curriculum
// (src/content/caps-science-curriculum.ts). One section per sub-topic;
// videos are filled by scripts/apply-curated-videos.ts.
export const mechanicsGr11: TopicContent = {
  id: 'mechanics-gr11',
  slug: 'mechanics-gr11',
  subject: 'science',
  grade: 11,
  paper: 1,
  title: 'Mechanics',
  capsWeight: 16.87,
  // Curated per CAPS sub-topic — see docs/curriculum/ and scripts/curate-videos.ts
  sections: [
    {
      id: 'overview',
      title: 'Mechanics',
      blocks: [
        {
          type: 'theory',
          title: 'What this topic covers',
          titleAf: 'Wat hierdie onderwerp dek',
          body: `• Resultant of perpendicular vectors
• Resolving a vector into its horizontal and vertical components
• Different kinds of forces: weight, normal force, tension and applied force
• Static and kinetic frictional force
• Force diagrams and free body diagrams
• Newton's first and second laws
• Newton's third law and action-reaction pairs
• Applying Newton's laws: inclined planes, lifts and two-body systems
• Newton's law of universal gravitation, mass and weight`
        }
      ]
    },
    {
      id: 'resultant-of-perpendicular-vectors',
      title: 'Resultant of perpendicular vectors',
      blocks: [
        {
          type: 'video',
          title: 'Watch: Grade 11 vector in two dimensions physics LEVEL EASY — Miss Martins Maths and Science',
          videoId: 'LT_0pICM7Ns'
        }
      ]
    },
    {
      id: 'resolving-a-vector-into-its-horizontal-and-verti',
      title: 'Resolving a vector into its horizontal and vertical components',
      blocks: [
        {
          type: 'video',
          title: 'Watch: Grade 11 Physics Resolving Vectors into Components Finding the x and y components — Miss Martins Maths and Science',
          videoId: '-GRcFVx3iz4'
        }
      ]
    },
    {
      id: 'different-kinds-of-forces-weight-normal-force-te',
      title: 'Different kinds of forces: weight, normal force, tension and applied force',
      blocks: [
        {
          type: 'video',
          title: 'Watch: Grade 11 Newton Laws: Look out for normal force — Kevinmathscience',
          videoId: '7YhkjSlxsrc'
        }
      ]
    },
    {
      id: 'static-and-kinetic-frictional-force',
      title: 'Static and kinetic frictional force',
      blocks: [
        {
          type: 'video',
          title: 'Watch: Grade 11 and 12 Forces Friction: Static and kinetic friction — Miss Martins Maths and Science',
          videoId: 'kAOWkry0BaM'
        }
      ]
    },
    {
      id: 'force-diagrams-and-free-body-diagrams',
      title: 'Force diagrams and free body diagrams',
      blocks: [
        {
          type: 'video',
          title: 'Watch: Grade 11 Newton Laws: Free body and force diagram — Kevinmathscience',
          videoId: 'Rd7acAcly4Q'
        }
      ]
    },
    {
      id: 'newton-s-first-and-second-laws',
      title: 'Newton\'s first and second laws',
      blocks: [
        {
          type: 'video',
          title: 'Watch: Grade 11 Newton Laws: Newtons 1st — Kevinmathscience',
          videoId: 'LHn9e_efynM'
        }
      ]
    },
    {
      id: 'newton-s-third-law-and-action-reaction-pairs',
      title: 'Newton\'s third law and action-reaction pairs',
      blocks: [
        {
          type: 'video',
          title: 'Watch: Newton\'s Third Law of Motion Grade 11 and 12 Physics — Miss Martins Maths and Science',
          videoId: '1Gr3hBgK3MQ'
        }
      ]
    },
    {
      id: 'applying-newton-s-laws-inclined-planes-lifts-and',
      title: 'Applying Newton\'s laws: inclined planes, lifts and two-body systems',
      blocks: [
        {
          type: 'video',
          title: 'Watch: Newton\'s Laws simultaneous equations Two Body Systems — Miss Martins Maths and Science',
          videoId: 'SgjxpUkH73M'
        }
      ]
    },
    {
      id: 'newton-s-law-of-universal-gravitation-mass-and-w',
      title: 'Newton\'s law of universal gravitation, mass and weight',
      blocks: [
        {
          type: 'video',
          title: 'Watch: Newton\'s Law of Universal Gravitation Grade 11 and 12 Physics — Miss Martins Maths and Science',
          videoId: 'TcgBamEa4W8'
        }
      ]
    }
  ]
}

export default mechanicsGr11
