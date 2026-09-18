import type { TopicContent } from '@/types'

export const numberPatternsGr10: TopicContent = {
  id: 'number-patterns-gr10',
  slug: 'number-patterns-gr10',
  subject: 'maths',
  grade: 10,
  paper: 1,
  title: 'Number Patterns',
  capsWeight: 10,
  sections: [
    {
      id: 'coming-soon',
      title: 'Number Patterns',
      blocks: [
        {
          type: 'theory',
          title: 'What this topic covers',
          body: `• **Linear Patterns** - Constant first difference
• **Quadratic Patterns** - Constant second difference
• **General Term** - Finding the $n$th term ($T_n$)
• **Linear Sequences** - $T_n = an + b$
• **Quadratic Sequences** - $T_n = an^2 + bn + c$
• **Pattern Recognition** - Identifying types of sequences`
        },
        // PROVISIONAL video picks — auto-filled 2026-09-18 from docs/client-updates/video-candidates; client to confirm.
        {
          type: 'video',
          title: 'Watch: Quadratic number patterns grade 11: introduction and examples — Kevinmathscience',
          videoId: 'Ws_tyxB-Xyo',
          videoIdAf: 'C7igJjQ_rsM',
          titleAf: 'Watch: Graad 10 Wiskunde Hersiening: Getalpatrone | Vrae uit Vorige Vraestelle (KABV) — Smart Culture Education'
        },
        {
          type: 'video',
          title: 'Watch: Quadratic Pattern Grade 11: Exam — Kevinmathscience',
          videoId: 'GzFLsWU5jlY'
        }
        // TODO(curator): add { type: 'formula', formulas: [...] } block
      ]
    }
  ]
}

export default numberPatternsGr10
