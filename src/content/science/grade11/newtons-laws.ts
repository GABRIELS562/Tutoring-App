import type { TopicContent } from '@/types'

export const newtonsLawsGr11: TopicContent = {
  id: 'newtons-laws-gr11',
  slug: 'newtons-laws-gr11',
  subject: 'science',
  grade: 11,
  paper: 1,
  title: "Newton's Laws",
  capsWeight: 20,
  sections: [
    {
      id: 'coming-soon',
      title: "Newton's Laws of Motion",
      blocks: [
        {
          type: 'theory',
          title: 'Full Notes Coming Soon',
          body: `Full notes for this topic are coming soon. In the meantime, watch the Mindset Learn video below.

This topic covers:
• **Forces and Types of Forces** - Contact and non-contact forces, normal force, friction, tension
• **Newton's First Law (Inertia)** - Objects remain at rest or in uniform motion
• **Newton's Second Law** - $F_{net} = ma$ and applications
• **Newton's Third Law** - Action-reaction pairs
• **Free Body Diagrams** - Drawing and interpreting force diagrams
• **Applications** - Objects on inclined planes, connected systems, friction problems
• **Universal Gravitation** - Weight and gravitational force`
        },
        // PROVISIONAL video picks — auto-filled 2026-09-18 from docs/client-updates/video-candidates; client to confirm.
        {
          type: 'video',
          title: 'Watch: Grade 11 Newton Laws: Objects on a slope — Kevinmathscience',
          videoId: 'HmoNMxId4-Y',
          videoIdAf: 'FA5DBBNyS8E',
          titleAf: 'Watch: Newton se wette: Trek krag teen \'n hoek — HenBot Wetenskap'
        },
        {
          type: 'video',
          title: 'Watch: Newton Law Gravity Grade 11 — Kevinmathscience',
          videoId: 'AFwr05QW3aY'
        }
      ]
    }
  ]
}

export default newtonsLawsGr11
