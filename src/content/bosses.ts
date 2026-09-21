/**
 * Boss registry — single source of truth mapping a topic slug to the boss
 * a student fights on `/topics/[slug]/boss`. Mirrors the shape of
 * src/content/registry.ts (a plain Record keyed by slug) so it's familiar
 * to anyone who has touched contentRegistry.
 *
 * Bosses are purely cosmetic/motivational framing over the same question
 * bank as Practice - `getBossForTopic` always returns something (a generic
 * fallback for any slug without a named boss), so the boss route never 404s
 * on a valid topic.
 */

export type BossSvgVariant = 'tangent' | 'delta' | 'circle' | 'newton' | 'circuit' | 'dice' | 'generic'

export type Boss = {
  id: string
  name: string
  nameAf: string
  tagline: string
  taglineAf: string
  /** Hex accent colour driving the boss's glow, HP bar, and UI accents on the battle screen. */
  accent: string
  svgVariant: BossSvgVariant
}

const bossRegistry: Record<string, Boss> = {
  'trig-gr11': {
    id: 'tangent-titan',
    name: 'The Tangent Titan',
    nameAf: 'Die Tangens-Titaan',
    tagline: 'Master the unit circle, or be swallowed by it.',
    taglineAf: 'Bemeester die eenheidsirkel, of word daardeur verswelg.',
    accent: '#e63946',
    svgVariant: 'tangent',
  },
  'calculus-gr12': {
    id: 'delta-differentiator',
    name: 'Delta the Differentiator',
    nameAf: 'Delta die Differensieerder',
    tagline: 'Every curve has a secret. Find the gradient before it finds you.',
    taglineAf: 'Elke kurwe het ’n geheim. Vind die gradiënt voor dit jou vind.',
    accent: '#8b5cf6',
    svgVariant: 'delta',
  },
  'euclidean-geometry-gr12': {
    id: 'circle-warden',
    name: 'The Circle Warden',
    nameAf: 'Die Sirkelwag',
    tagline: 'Guardian of every chord, tangent and cyclic quadrilateral.',
    taglineAf: 'Wagter van elke koord, raaklyn en koordevierhoek.',
    accent: '#2dd4bf',
    svgVariant: 'circle',
  },
  'newtons-laws-gr11': {
    id: 'newtons-shadow',
    name: "Newton's Shadow",
    nameAf: "Newton se Skaduwee",
    tagline: 'For every force you throw, an equal and opposite awaits.',
    taglineAf: 'Vir elke krag wat jy gooi, wag ’n gelyke en teenoorgestelde krag.',
    accent: '#f4a261',
    svgVariant: 'newton',
  },
  'electric-circuits-gr10': {
    id: 'short-circuit',
    name: 'The Short Circuit',
    nameAf: 'Die Kortsluiting',
    tagline: 'Resistance is not futile here - it’s the whole point.',
    taglineAf: 'Weerstand is nie hier nutteloos nie - dit is die hele punt.',
    accent: '#f4d35e',
    svgVariant: 'circuit',
  },
  'probability-gr12': {
    id: 'lady-luck',
    name: 'Lady Luck',
    nameAf: 'Vrou Fortuin',
    tagline: 'The odds favour whoever counts them correctly.',
    taglineAf: 'Die kanse begunstig wie dit korrek bereken.',
    accent: '#ff6b9d',
    svgVariant: 'dice',
  },
}

const genericBoss: Boss = {
  id: 'exam-guardian',
  name: 'The Exam Guardian',
  nameAf: 'Die Eksamenwag',
  tagline: 'Every topic has a gatekeeper. This one is yours.',
  taglineAf: 'Elke onderwerp het ’n poortwagter. Hierdie een is joune.',
  accent: '#7d8590',
  svgVariant: 'generic',
}

/** Always returns a boss - falls back to a generic gatekeeper for any topic
 * slug that doesn't have a named boss yet. */
export function getBossForTopic(slug: string): Boss {
  return bossRegistry[slug] ?? genericBoss
}
