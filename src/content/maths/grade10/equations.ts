import type { TopicContent } from '@/types'

export const equationsGr10: TopicContent = {
  id: 'equations-gr10',
  slug: 'equations-gr10',
  subject: 'maths',
  grade: 10,
  paper: 1,
  title: 'Equations and Inequalities',
  capsWeight: 15,
  sections: [
    {
      id: 'coming-soon',
      title: 'Equations and Inequalities',
      blocks: [
        {
          type: 'theory',
          title: 'Full Notes Coming Soon',
          body: `Full notes for this topic are coming soon. In the meantime, watch the Mindset Learn video below.

This topic covers:
• **Linear Equations** - Solving equations with one variable
• **Quadratic Equations** - Factorisation, completing the square
• **Simultaneous Equations** - Substitution and elimination methods
• **Linear Inequalities** - Solving and representing on a number line
• **Literal Equations** - Changing the subject of a formula
• **Word Problems** - Setting up and solving equations from context`
        },
        // PROVISIONAL video picks — auto-filled 2026-09-18 from docs/client-updates/video-candidates; client to confirm.
        {
          type: 'video',
          title: 'Watch: Grade 10 Inequalities — Kevinmathscience',
          videoId: 'OFX7zmbEmro',
          videoIdAf: '8IUh8jx2vrM',
          titleAf: 'Watch: Gr10 (CAPS) Vergelykings en Ongelykhede — Philpotts Consultancy'
        },
        {
          type: 'video',
          title: 'Watch: Exam Equations Grade 10 — Kevinmathscience',
          videoId: 'zHNvf3hMlSk'
        }
      ]
    }
  ]
}

export default equationsGr10
