import type { TopicContent } from '@/types'

export const trigonometryGr11: TopicContent = {
  id: 'trig-gr11',
  slug: 'trig-gr11',
  subject: 'maths',
  grade: 11,
  paper: 2,
  title: 'Trigonometry',
  titleAf: 'Trigonometrie',
  capsWeight: 40,
  // Curated per CAPS sub-topic — see docs/curriculum/ and scripts/curate-videos.ts
  sections: [
    {
      id: 'reduction-formulae-in-the-four-quadrants',
      title: 'Reduction formulae in the four quadrants',
      titleAf: 'Herleidingsformules in die vier kwadrante',
      blocks: [
        {
          type: 'video',
          title: 'Watch: Reduction grade 11: Using Numbers and special angles. — Kevinmathscience',
          videoId: '8QolMTcm8qE',
          videoIdAf: '_WEUtNaBVyg'
        }
      ]
    },
    {
      id: 'co-functions',
      title: 'Co-functions',
      titleAf: 'Kofunksies',
      blocks: [
        {
          type: 'tip',
          body: `We haven't found a CAPS video for this sub-topic yet. Ask Angelo if you're stuck on it.`,
          bodyAf: `Ons het nog nie 'n KABV-video vir hierdie onderafdeling gekry nie. Vra vir Angelo as jy vashaak.`
        }
      ]
    },
    {
      id: 'trigonometric-identities-tan-sin-cos-and-sin-cos',
      title: 'Trigonometric identities: tan = sin/cos and sin² + cos² = 1',
      titleAf: 'Trigonometriese identiteite: tan = sin/cos en sin² + cos² = 1',
      blocks: [
        {
          type: 'video',
          title: 'Watch: Identities Grade 11: Practice — Kevinmathscience',
          videoId: 'Cc03mGw1s_4',
          videoIdAf: 'dOwILHeOK_4'
        }
      ]
    },
    {
      id: 'general-solutions-of-trig-equations',
      title: 'General solutions of trig equations',
      titleAf: 'Algemene oplossings van trig vergelykings',
      blocks: [
        {
          type: 'video',
          title: 'Watch: General Solution | Solving Trig Equations | Mlungisi Nkosi — Mlungisi Nkosi Maths & Science',
          videoId: 'addxuEnZ_K8',
          videoIdAf: 'KZXGPLKa8qI'
        }
      ]
    },
    {
      id: 'the-sine-rule',
      title: 'The sine rule',
      titleAf: 'Die sinusreël',
      blocks: [
        {
          type: 'video',
          title: 'Watch: Sine Rule grade 11: Introduction — Kevinmathscience',
          videoId: 's9vYb0b0TIw'
        }
      ]
    },
    {
      id: 'the-cosine-rule',
      title: 'The cosine rule',
      titleAf: 'Die kosinusreël',
      blocks: [
        {
          type: 'video',
          title: 'Watch: Grade 11 - 2D Trigonometry | Sine rule, Cosine rule, Area rule | Mlungisi Nkosi — Mlungisi Nkosi Maths & Science',
          videoId: 'UP5Pit-zJyY',
          videoIdAf: 'ZgUt5Cmxx28'
        }
      ]
    },
    {
      id: 'the-area-rule',
      title: 'The area rule',
      titleAf: 'Die oppervlaktereël',
      blocks: [
        {
          type: 'video',
          title: 'Watch: Area Rule grade 11: Introduction — Kevinmathscience',
          videoId: 'jPM-ZD9JRpg'
        }
      ]
    }
  ]
}

export default trigonometryGr11
