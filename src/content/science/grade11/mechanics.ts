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
  titleAf: 'Meganika',
  capsWeight: 16.87,
  // Curated per CAPS sub-topic — see docs/curriculum/ and scripts/curate-videos.ts
  sections: [
    {
      id: 'overview',
      title: 'Mechanics',
      titleAf: 'Meganika',
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
      titleAf: 'Resultant van loodregte vektore',
      blocks: [
        {
          type: 'video',
          title: 'Watch: Grade 11 vector in two dimensions physics LEVEL EASY — Miss Martins Maths and Science',
          videoId: 'LT_0pICM7Ns',
          videoIdAf: 'bk2UgDNDz2s'
        }
      ]
    },
    {
      id: 'resolving-a-vector-into-its-horizontal-and-verti',
      title: 'Resolving a vector into its horizontal and vertical components',
      titleAf: 'Ontbinding van \'n vektor in sy horisontale en vertikale komponente',
      blocks: [
        {
          type: 'video',
          title: 'Watch: Grade 11 Physics Resolving Vectors into Components Finding the x and y components — Miss Martins Maths and Science',
          videoId: '-GRcFVx3iz4',
          videoIdAf: 'NrVD8m6fNTw'
        }
      ]
    },
    {
      id: 'different-kinds-of-forces-weight-normal-force-te',
      title: 'Different kinds of forces: weight, normal force, tension and applied force',
      titleAf: 'Verskillende soorte kragte: gewig, normaalkrag, spanning en toegepaste krag',
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
      titleAf: 'Statiese en kinetiese wrywingskrag',
      blocks: [
        {
          type: 'video',
          title: 'Watch: Grade 11 and 12 Forces Friction: Static and kinetic friction — Miss Martins Maths and Science',
          videoId: 'kAOWkry0BaM',
          videoIdAf: 'rPmvMASfdSQ'
        }
      ]
    },
    {
      id: 'force-diagrams-and-free-body-diagrams',
      title: 'Force diagrams and free body diagrams',
      titleAf: 'Kragdiagramme en vryliggaamdiagramme',
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
      titleAf: 'Newton se eerste en tweede wette',
      blocks: [
        {
          type: 'video',
          title: 'Watch: Grade 11 Newton Laws: Newtons 1st — Kevinmathscience',
          videoId: 'LHn9e_efynM',
          videoIdAf: 'FA5DBBNyS8E'
        }
      ]
    },
    {
      id: 'newton-s-third-law-and-action-reaction-pairs',
      title: 'Newton\'s third law and action-reaction pairs',
      titleAf: 'Newton se derde wet en aksie-reaksie-pare',
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
      titleAf: 'Toepassing van Newton se wette: skuinsvlakke, hysbakke en twee-liggaamstelsels',
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
      titleAf: 'Newton se universele gravitasiewet, massa en gewig',
      blocks: [
        {
          type: 'video',
          title: 'Watch: Newton\'s Law of Universal Gravitation Grade 11 and 12 Physics — Miss Martins Maths and Science',
          videoId: 'TcgBamEa4W8',
          videoIdAf: 'ZCQYuzFTNG8'
        }
      ]
    }
  ]
}

export default mechanicsGr11
