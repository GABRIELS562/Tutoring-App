import type { TopicContent } from '@/types'

export const mechanicsGr10: TopicContent = {
  id: 'mechanics-gr10',
  slug: 'mechanics-gr10',
  subject: 'science',
  grade: 10,
  paper: 1,
  title: 'Mechanics',
  titleAf: 'Meganika',
  capsWeight: 20,
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
          body: `• **Vectors and Scalars** - Distance vs displacement, speed vs velocity
• **Motion in 1D** - Position, displacement, velocity, acceleration
• **Equations of Motion** - $v = u + at$, $s = ut + \\frac{1}{2}at^2$, $v^2 = u^2 + 2as$
• **Motion Graphs** - Position-time, velocity-time, acceleration-time
• **Free Fall** - Motion under gravity ($g = 9.8$ m/s²)
• **Forces** - Normal, friction, tension, weight
• **Newton's Laws** - First, second, and third law basics`
        }
      ]
    },
    {
      id: 'vectors-and-scalars',
      title: 'Vectors and scalars',
      titleAf: 'Vektore en skalare',
      blocks: [
        {
          type: 'video',
          title: 'Watch: Vectors and Scalars Physics — Miss Martins Maths and Science',
          videoId: 'CT8sMcfCBVw',
          videoIdAf: 'lvvxak5Ag6o'
        }
      ]
    },
    {
      id: 'frame-of-reference-position-distance-and-displac',
      title: 'Frame of reference, position, distance and displacement',
      titleAf: 'Verwysingsraamwerk, posisie, afstand en verplasing',
      blocks: [
        {
          type: 'video',
          title: 'Watch: Displacement and Distance: Motion in One Dimension — Miss Martins Maths and Science',
          videoId: 'qbDa0_dmGgs'
        }
      ]
    },
    {
      id: 'average-speed-and-average-velocity',
      title: 'Average speed and average velocity',
      titleAf: 'Gemiddelde spoed en gemiddelde snelheid',
      blocks: [
        {
          type: 'video',
          title: 'Watch: Velocity and speed: Motion in One Dimension — Miss Martins Maths and Science',
          videoId: 'JCehwmZ9BWM',
          videoIdAf: 'h5bDavRKhN4'
        }
      ]
    },
    {
      id: 'acceleration',
      title: 'Acceleration',
      titleAf: 'Versnelling',
      blocks: [
        {
          type: 'video',
          title: 'Watch: Acceleration Grade 10 Science — Kevinmathscience',
          videoId: 'TgHFTg_zeTE'
        }
      ]
    },
    {
      id: 'instantaneous-velocity-and-instantaneous-speed',
      title: 'Instantaneous velocity and instantaneous speed',
      titleAf: 'Oombliklike snelheid en oombliklike spoed',
      blocks: [
        {
          type: 'content_gap',
          body: `No CAPS video has been sourced for this sub-topic yet. Ask Angelo if you're stuck on it in the meantime.`,
          bodyAf: `Daar is nog nie 'n KABV-video vir hierdie onderafdeling nie. Vra solank vir Angelo as jy vashaak.`
        }
      ]
    },
    {
      id: 'position-velocity-and-acceleration-graphs',
      title: 'Position, velocity and acceleration graphs',
      titleAf: 'Posisie-, snelheid- en versnellingsgrafieke',
      blocks: [
        {
          type: 'video',
          title: 'Watch: Velocity Time Graph Grade 10 Science — Kevinmathscience',
          videoId: 'e86SXh5G7Hs',
          videoIdAf: 'FVUrrg9lUm0'
        }
      ]
    },
    {
      id: 'the-equations-of-motion-for-uniformly-accelerate',
      title: 'The equations of motion for uniformly accelerated motion',
      titleAf: 'Bewegingsvergelykings vir eenparig versnelde beweging',
      blocks: [
        {
          type: 'video',
          title: 'Watch: Equations of Motion Grade 10 — Kevinmathscience',
          videoId: '7-vQ6k4bTqM'
        }
      ]
    },
    {
      id: 'gravitational-potential-energy-and-kinetic-energ',
      title: 'Gravitational potential energy and kinetic energy',
      titleAf: 'Gravitasionele potensiële energie en kinetiese energie',
      blocks: [
        {
          type: 'video',
          title: 'Watch: Mechanical Energy: Kinetic energy and Gravitational Potential energy Introduction — Miss Martins Maths and Science',
          videoId: 'W-fVjZHgObc',
          videoIdAf: 'ygP2m4OamwQ'
        }
      ]
    },
    {
      id: 'conservation-of-mechanical-energy',
      title: 'Conservation of mechanical energy',
      titleAf: 'Behoud van meganiese energie',
      blocks: [
        {
          type: 'video',
          title: 'Watch: Conservation Of Mass Grade 10 — Kevinmathscience',
          videoId: 'urUIlpg_xQ0',
          videoIdAf: 'sorIF9b4k_A'
        }
      ]
    }
  ]
}

export default mechanicsGr10
