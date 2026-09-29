import type { TopicContent } from '@/types'

// Scaffolded from the CAPS handbook (src/content/caps-curriculum.ts).
// One section per sub-topic; videos are filled by
// scripts/apply-curated-videos.ts.
export const algebraGr11: TopicContent = {
  id: 'algebra-gr11',
  slug: 'algebra-gr11',
  subject: 'maths',
  grade: 11,
  paper: 1,
  title: 'Algebra & Equations',
  titleAf: 'Algebra en Vergelykings',
  capsWeight: 0,
  // Curated per CAPS sub-topic — see docs/curriculum/ and scripts/curate-videos.ts
  sections: [
    {
      id: 'overview',
      title: 'Algebra & Equations',
      titleAf: 'Algebra en Vergelykings',
      blocks: [
        {
          type: 'theory',
          title: 'What this topic covers',
          titleAf: 'Wat hierdie onderwerp dek',
          body: `• Surds and fractional exponents
• Completing the square
• The quadratic formula
• Nature of roots (the discriminant)
• Quadratic inequalities
• Simultaneous equations: linear and quadratic`
        }
      ]
    },
    {
      id: 'surds-and-fractional-exponents',
      title: 'Surds and fractional exponents',
      titleAf: 'Wortelvorme en breukeksponente',
      blocks: [
        {
          type: 'video',
          title: 'Watch: Surds Grade 11: Exam — Kevinmathscience',
          videoId: 'p9TWK13yUqE',
          videoIdAf: 'YXYA-f-sLgI',
          titleAf: 'Kyk: Graad 11 Eksponente #4: Vereenvoudiging van Wortelvorme — WiskundeMetMargie'
        }
      ]
    },
    {
      id: 'completing-the-square',
      title: 'Completing the square',
      titleAf: 'Voltooiing van die vierkant',
      blocks: [
        {
          type: 'video',
          title: 'Watch: 5a) Completing square gr 11 | Try — Kevinmathscience',
          videoId: 'yYJjoo8OI-0'
        }
      ]
    },
    {
      id: 'the-quadratic-formula',
      title: 'The quadratic formula',
      titleAf: 'Die kwadratiese formule',
      blocks: [
        {
          type: 'video',
          title: 'Watch: 1) Quadratic formula grade 11 | Intro — Kevinmathscience',
          videoId: 'XofwHRrFKNE',
          videoIdAf: 'leO4m8TsGWs',
          titleAf: 'Kyk: 04 Kwadratiese formule — Wiskunde_Mathematics_SUM'
        }
      ]
    },
    {
      id: 'nature-of-roots-the-discriminant',
      title: 'Nature of roots (the discriminant)',
      titleAf: 'Aard van wortels (die diskriminant)',
      blocks: [
        {
          type: 'video',
          title: 'Watch: Grade 11 - Nature of Roots | Part 1 | Mlungisi Nkosi — Mlungisi Nkosi Maths & Science',
          videoId: 'Auc6fj338nA',
          videoIdAf: 'HPB52ouJ7M8',
          titleAf: 'Kyk: Graad 11 Vergelykings #6: Aard van Wortels (Discriminant) — WiskundeMetMargie'
        }
      ]
    },
    {
      id: 'quadratic-inequalities',
      title: 'Quadratic inequalities',
      titleAf: 'Kwadratiese ongelykhede',
      blocks: [
        {
          type: 'video',
          title: 'Watch: 2) Quadratic inequalities grade 11 | Intro — Kevinmathscience',
          videoId: 'wFLTz5SCE8g',
          videoIdAf: 'a-HkT-f0C08',
          titleAf: 'Kyk: Kwadratiese Vergelykings Graad11: L12 Kwadratiese Ongelykhede — Online Maths by Miss Pythagoras'
        }
      ]
    },
    {
      id: 'simultaneous-equations-linear-and-quadratic',
      title: 'Simultaneous equations: linear and quadratic',
      titleAf: 'Gelyktydige vergelykings: lineêr en kwadraties',
      blocks: [
        {
          type: 'video',
          title: 'Watch: 3) Simultaneous equations gr 11 | Intro — Kevinmathscience',
          videoId: 'WJbeyscO6Is',
          videoIdAf: 'OtM4u_uQMSA',
          titleAf: 'Kyk: Gelyktydige Kwadratiese Vergelykings || Wiskunde Graad 11 en 12 — CollieMath Studio'
        }
      ]
    }
  ]
}

export default algebraGr11
