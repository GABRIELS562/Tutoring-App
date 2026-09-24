/**
 * Afrikaans support for the CAPS video curation.
 *
 * Two things differ from the English run and both come from the research in
 * docs/client-updates/2026-09-18-status-report-deep-dive.pdf (Appendix B):
 *
 * 1. The channel list is different, and much longer, because no single
 *    Afrikaans teacher covers the syllabus the way Kevinmathscience does.
 * 2. CAPS sub-topics are written in English but the titles are Afrikaans, so
 *    the scorer needs the vocabulary to match on at all.
 *
 * The Afrikaans ecosystem is roughly a hundredth the size of the English one:
 * the largest channel has 27,700 subscribers and a typical video has hundreds
 * to low thousands of views, not hundreds of thousands.
 */

/**
 * Channels verified as Afrikaans CAPS teachers. HouNetOpSukkel is the most
 * watched by a wide margin but has in-app playback disabled on 14 of its 16
 * videos, so it is listed last and will usually fail the embed check anyway -
 * that is the owner's setting and cannot be overridden from our side.
 */
export const AFRIKAANS_CHANNELS = new Set([
  'Wiskunde_Mathematics_SUM',
  'Online Maths by Miss Pythagoras',
  'WiskundeMetMargie',
  'Wiskunde Broers',
  'Danike Aucamp_Wiskunde en Wetenskap ',
  'Danike Aucamp',
  'WSILAB',
  'Ekstra Wetenskap Klasse',
  'CollieMath Studio',
  'Rochelle Van der Merwe',
  'VAW-Vereniging vir Afrikaanse Wiskunde-onderwysers',
  'SlimDink',
  'Dou Kleefstra',
  'Hoërskool Noordheuwel',
  'Juf. OK se Wetenskap Akademie',
  'Wiskunde',
  'Wiskunde Graad 12 Juffrou Koorsen',
  'Douwliena Fourie',
  'Lekker Wiskunde',
  'Wizzkunde',
  'Dalene Coetzee',
  'Lichelle Barnard',
  'Mari Bartholomae',
  'Stefan Buys',
  'HenBot Wetenskap',
  'TheWhiteboardSA',
  'HouNetOpSukkel',
])

/**
 * CAPS mathematics vocabulary, English to Afrikaans. Keys are the words as
 * they appear in src/content/caps-curriculum.ts; a sub-topic matches an
 * Afrikaans title when any listed form appears.
 *
 * Where Afrikaans has competing standard forms (ewewydig / parallel) both are
 * listed, since channels differ.
 */
export const AFRIKAANS_TERMS: Record<string, string[]> = {
  // Algebra
  exponents: ['eksponente', 'eksponent'],
  exponent: ['eksponent'],
  laws: ['wette', 'reëls'],
  factorisation: ['faktorisering', 'faktoriseer'],
  trinomials: ['drieterme', 'drieterm'],
  cubes: ['derdemagte', 'derdemag'],
  squares: ['kwadrate', 'vierkante'],
  difference: ['verskil'],
  sum: ['som'],
  equations: ['vergelykings', 'vergelyking'],
  linear: ['lineêre', 'lineere'],
  quadratic: ['kwadratiese', 'kwadraties'],
  simultaneous: ['gelyktydige', 'gelyktydig'],
  inequalities: ['ongelykhede', 'ongelykheid'],
  surds: ['wortelvorme', 'wortelvorm'],
  discriminant: ['diskriminant'],
  roots: ['wortels'],
  logarithms: ['logaritmes', 'logaritme'],
  // Patterns and sequences
  sequences: ['rye', 'ry'],
  arithmetic: ['rekenkundige', 'rekenkundig'],
  geometric: ['meetkundige', 'meetkundig'],
  patterns: ['patrone', 'patroon'],
  term: ['term'],
  series: ['reekse', 'reeks'],
  sigma: ['sigma'],
  convergent: ['konvergente', 'konvergent'],
  infinity: ['oneindig'],
  // Functions
  functions: ['funksies', 'funksie'],
  graphs: ['grafieke', 'grafiek'],
  parabola: ['parabool'],
  hyperbola: ['hiperbool'],
  hyperbolic: ['hiperbool'],
  exponential: ['eksponensiële', 'eksponensiele'],
  inverse: ['inverse', 'omgekeerde'],
  domain: ['definisieversameling', 'definisie'],
  range: ['waardeversameling', 'waarde'],
  // Finance
  interest: ['rente'],
  simple: ['enkelvoudige', 'enkelvoudig'],
  compound: ['saamgestelde', 'saamgestel'],
  depreciation: ['waardevermindering'],
  annuities: ['annuïteite', 'annuiteite', 'annuïteit'],
  nominal: ['nominale'],
  effective: ['effektiewe'],
  sinking: ['delging', 'delgingsfonds'],
  // Probability
  probability: ['waarskynlikheid'],
  venn: ['venn'],
  tree: ['boom'],
  diagrams: ['diagramme', 'diagram'],
  independent: ['onafhanklike', 'onafhanklik'],
  dependent: ['afhanklike', 'afhanklik'],
  events: ['gebeurtenisse', 'gebeurtenis'],
  permutations: ['permutasies', 'permutasie'],
  factorial: ['faktoriaal'],
  counting: ['tel', 'telling'],
  // Trigonometry
  trig: ['trigonometrie', 'driehoeksmeting'],
  trigonometric: ['trigonometriese'],
  ratios: ['verhoudings', 'verhouding'],
  cartesian: ['cartesiese', 'kartesiese', 'cartesiaanse'],
  triangles: ['driehoeke', 'driehoek'],
  sine: ['sinus'],
  cosine: ['cosinus', 'kosinus'],
  rule: ['reël', 'reel'],
  area: ['oppervlakte'],
  identities: ['identiteite', 'identiteit'],
  reduction: ['herleiding', 'herleidings'],
  cofunctions: ['kofunksies'],
  angle: ['hoek'],
  angles: ['hoeke'],
  double: ['dubbel'],
  // Euclidean geometry
  euclidean: ['euklidiese', 'euklidies'],
  geometry: ['meetkunde'],
  circle: ['sirkel'],
  circles: ['sirkels'],
  chords: ['koorde', 'koord'],
  tangents: ['raaklyne', 'raaklyn'],
  cyclic: ['koordevierhoek', 'siklies'],
  quadrilaterals: ['vierhoeke', 'vierhoek'],
  parallelograms: ['parallelogramme', 'parallelogram'],
  midpoint: ['middelpunt'],
  theorem: ['stelling'],
  similarity: ['gelykvormigheid'],
  similar: ['gelykvormige'],
  proportionality: ['eweredigheid'],
  pythagoras: ['pythagoras'],
  // Analytical geometry
  analytical: ['analitiese', 'analities'],
  distance: ['afstand'],
  gradient: ['gradiënt', 'gradient', 'helling'],
  inclination: ['hellingshoek'],
  parallel: ['ewewydig', 'parallel'],
  perpendicular: ['loodreg'],
  lines: ['lyne', 'lyn'],
  // Statistics
  statistics: ['statistiek'],
  mean: ['gemiddeld', 'gemiddelde'],
  median: ['mediaan'],
  mode: ['modus'],
  quartiles: ['kwartiele', 'kwartiel'],
  percentiles: ['persentiele', 'persentiel'],
  box: ['kis'],
  whisker: ['snor'],
  ogives: ['ogief', 'ogiewe'],
  variance: ['variansie'],
  deviation: ['afwyking'],
  standard: ['standaard'],
  regression: ['regressie'],
  correlation: ['korrelasie'],
  bivariate: ['tweeveranderlike'],
  data: ['data'],
  // Calculus
  calculus: ['calculus', 'differensiaalrekene'],
  limit: ['limiet'],
  derivative: ['afgeleide'],
  differentiation: ['differensiasie'],
  principles: ['beginsels', 'beginsel'],
  cubic: ['derdegraadse', 'derdegraads'],
  optimisation: ['optimering'],
  rates: ['tempo'],
  change: ['verandering'],
}

/** How an Afrikaans channel titles a grade: "Graad 11". */
export function afrikaansQueries(subTopic: string, grade: number): string[] {
  // One form per word: the map lists singular and plural so the scorer can
  // match either, but a query repeating both ("drieterme drieterm") reads as
  // noise to YouTube and narrows the results.
  const terms = subTopic
    .toLowerCase()
    .split(/[^a-z]+/)
    .map((word) => AFRIKAANS_TERMS[word]?.[0])
    .filter((term): term is string => Boolean(term))
  const phrase = [...new Set(terms)].slice(0, 3).join(' ')
  if (!phrase) return []
  return [
    `graad ${grade} wiskunde ${phrase}`,
    `${phrase} graad ${grade}`,
    `wiskunde ${phrase} afrikaans`,
  ]
}
