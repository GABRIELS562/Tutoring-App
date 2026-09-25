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
  // Found by harvesting real Afrikaans science titles; these carry the
  // Physical Sciences syllabus that the maths-led list above does not.
  // Wolkskool is the most watched Afrikaans science channel by a wide
  // margin (20,556 views on "Fisiese Wetenskap - Sure en basisse 01").
  'Wolkskool',
  'Skeinat met Schabort',
  'Simple Science',
  'Hoërskool Alberton',
  'Pondera Innovation',
  'The Answer Series',
  'Shap Science SA - Juffrou R',
  // Deliberately NOT listed: "Lewenswetenskappe Lesse". It is a popular
  // Afrikaans channel (44,178 views) and it surfaces on science searches,
  // but Lewenswetenskappe is Life Sciences - a different subject with a
  // different syllabus. Admitting it would hand a Physical Sciences
  // sub-topic a biology video purely on view count.
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
  double: ['dubbel', 'dubbele'],
  intersecting: ['sny', 'snypunte', 'snydende'],
  restricting: ['beperk', 'beperking'],
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

/**
 * CAPS Physical Sciences vocabulary, English to Afrikaans.
 *
 * Every entry below was taken from a real Afrikaans science video title in
 * the harvested corpus, not from a dictionary. That matters: the obvious
 * translation is often not what teachers actually write. "Mole concept" is
 * "molbegrip", not "mol konsep"; work/energy/power is always the fixed
 * phrase "arbeid, energie en drywing"; physics and chemistry videos label
 * themselves "Fisika" and "Chemie" far more often than "Fisiese Wetenskappe".
 *
 * Spelling variants are not listed, because the scorer folds diacritics
 * before matching - stoigiometriese and stoïgiometriese, fotoelektriese and
 * fotoëlektriese, intermolekulere and intermolekulêre are the same key.
 */
export const AFRIKAANS_SCIENCE_TERMS: Record<string, string[]> = {
  // --- mechanics
  motion: ['beweging'],
  dimension: ['dimensie'],
  speed: ['spoed'],
  velocity: ['snelheid'],
  acceleration: ['versnelling'],
  distance: ['afstand'],
  displacement: ['verplasing'],
  position: ['posisie'],
  time: ['tyd'],
  graphs: ['grafieke', 'grafiek'],
  equations: ['vergelykings', 'bewegingsvergelykings'],
  equation: ['vergelyking'],
  scalars: ['skalare'],
  vectors: ['vektore'],
  vector: ['vektor'],
  resultant: ['resulterende'],
  components: ['komponente'],
  horizontal: ['horisontale'],
  vertical: ['vertikale'],
  force: ['krag'],
  forces: ['kragte'],
  newton: ['newton'],
  laws: ['wette', 'bewegingswette'],
  law: ['wet'],
  friction: ['wrywing'],
  static: ['statiese'],
  kinetic: ['kinetiese'],
  normal: ['normaal'],
  tension: ['spanning'],
  weight: ['gewig'],
  mass: ['massa'],
  inclined: ['skuinsvlak'],
  planes: ['skuinsvlak'],
  gravitation: ['gravitasie', 'gravitasiewet'],
  gravitational: ['gravitasie'],
  universal: ['universele'],
  momentum: ['momentum'],
  impulse: ['impuls'],
  conservation: ['behoud'],
  collisions: ['botsings'],
  elastic: ['elastiese'],
  inelastic: ['onelastiese'],
  projectile: ['projektielbeweging', 'projektiel'],
  work: ['arbeid'],
  energy: ['energie'],
  power: ['drywing'],
  theorem: ['stelling'],
  potential: ['potensiele'],
  mechanical: ['meganiese'],
  mechanics: ['meganika'],

  // --- waves, sound and light
  waves: ['golwe'],
  wave: ['golf'],
  pulses: ['pulse'],
  transverse: ['transversale'],
  longitudinal: ['longitudinale'],
  sound: ['klank'],
  light: ['lig'],
  wavelength: ['golflengte'],
  frequency: ['frekwensie'],
  period: ['periode'],
  amplitude: ['amplitude'],
  superposition: ['superposisie'],
  interference: ['interferensie'],
  constructive: ['konstruktiewe'],
  destructive: ['destruktiewe'],
  pitch: ['toonhoogte'],
  loudness: ['luidheid'],
  ultrasound: ['ultraklank'],
  compressions: ['saampersings'],
  rarefactions: ['verdunnings'],
  electromagnetic: ['elektromagnetiese'],
  spectrum: ['spektrum'],
  spectra: ['spektrums', 'spektra'],
  emission: ['emissie'],
  absorption: ['absorpsie'],
  radiation: ['straling'],
  photon: ['foton'],
  refraction: ['breking'],
  refractive: ['brekings'],
  index: ['indeks'],
  snell: ['snell'],
  critical: ['kritieke'],
  angle: ['hoek'],
  reflection: ['weerkaatsing', 'terugkaatsing'],
  wavefronts: ['golffronte'],
  huygens: ['huygens'],
  diffraction: ['diffraksie'],
  slit: ['splet'],
  doppler: ['doppler', 'dopplereffek'],
  effect: ['effek'],
  listener: ['luisteraar'],
  medicine: ['medisyne'],
  red: ['rooi'],
  shifts: ['verskuiwing'],
  universe: ['heelal'],

  // --- electricity and magnetism
  electrostatics: ['elektrostatika'],
  electric: ['elektriese'],
  electrical: ['elektriese'],
  electricity: ['elektrisiteit'],
  charge: ['lading'],
  charges: ['ladings'],
  charging: ['laai'],
  coulomb: ['coulomb'],
  field: ['veld'],
  fields: ['velde'],
  lines: ['veldlyne'],
  magnetic: ['magnetiese'],
  magnets: ['magnete'],
  compass: ['kompas'],
  earth: ['aarde'],
  current: ['stroomsterkte', 'stroom'],
  resistance: ['weerstand'],
  resistors: ['weerstande'],
  resistor: ['weerstand'],
  internal: ['interne'],
  terminal: ['klem'],
  voltage: ['spanning'],
  emf: ['emk'],
  circuit: ['stroombaan'],
  circuits: ['stroombane'],
  series: ['serie'],
  parallel: ['parallelle', 'parallel'],
  difference: ['potensiaalverskil', 'verskil'],
  ohm: ['ohm'],
  ohmic: ['ohmiese'],
  conductors: ['geleiers'],
  induction: ['induksie'],
  faraday: ['faraday'],
  generators: ['generators'],
  motors: ['motors'],
  alternating: ['wisselstroom'],
  rms: ['wgk'],
  cost: ['koste'],
  photo: ['foto', 'fotoelektriese'],
  electron: ['elektron'],
  electrons: ['elektrone'],
  ejected: ['vrygestel'],
  intensity: ['intensiteit'],
  transitions: ['oorgange'],

  // --- matter, atoms and bonding
  matter: ['materie'],
  materials: ['materiale'],
  classification: ['klassifikasie'],
  mixtures: ['mengsels'],
  pure: ['suiwer'],
  substances: ['stowwe'],
  metals: ['metale'],
  metallic: ['metaalbinding'],
  names: ['name'],
  formulae: ['formules'],
  formula: ['formule'],
  empirical: ['empiriese'],
  states: ['fasetoestande', 'toestande'],
  phases: ['fases'],
  density: ['digtheid'],
  melting: ['smelt'],
  boiling: ['kook'],
  points: ['punte'],
  atom: ['atoom'],
  atoms: ['atome'],
  atomic: ['atoom'],
  structure: ['struktuur'],
  isotopes: ['isotope'],
  relative: ['relatiewe'],
  configuration: ['elektronkonfigurasie', 'konfigurasie'],
  periodic: ['periodieke'],
  table: ['tabel'],
  groups: ['groepe'],
  periods: ['periodes'],
  trends: ['tendense', 'periodisiteit'],
  bonding: ['binding'],
  bond: ['binding'],
  ionic: ['ioniese'],
  covalent: ['kovalente'],
  compounds: ['verbindings'],
  molecular: ['molekulere'],
  molecules: ['molekules'],
  lewis: ['lewis'],
  shape: ['vorm'],
  vsepr: ['vsepr'],
  electronegativity: ['elektronegatiwiteit'],
  polarity: ['polariteit'],
  intermolecular: ['intermolekulere'],
  particles: ['deeltjies'],
  models: ['modelle'],

  // --- chemical change and stoichiometry
  chemical: ['chemiese'],
  physical: ['fisiese'],
  reaction: ['reaksie'],
  reactions: ['reaksies'],
  balancing: ['balansering', 'balanseer'],
  ions: ['ione'],
  ion: ['ioon'],
  aqueous: ['waterige'],
  solution: ['oplossing'],
  solutions: ['oplossings'],
  dissolving: ['oplos'],
  hydration: ['hidrasie'],
  conductivity: ['geleidingsvermoe'],
  precipitation: ['neerslag'],
  anions: ['anione'],
  exchange: ['uitruil'],
  mole: ['molbegrip', 'mol'],
  concept: ['molbegrip', 'begrip'],
  avogadro: ['avogadro'],
  molar: ['molere'],
  volume: ['volume'],
  concentration: ['konsentrasie'],
  percentage: ['persentasie'],
  composition: ['samestelling'],
  stoichiometric: ['stoigiometriese'],
  limiting: ['beperkende'],
  reagents: ['reagense'],
  yield: ['opbrengs'],
  purity: ['suiwerheid'],
  calculations: ['berekeninge'],
  quantitative: ['kwantitatiewe'],
  gas: ['gas'],
  gases: ['gasse'],
  gaseous: ['gasvormige'],
  ideal: ['ideale'],
  temperature: ['temperatuur'],
  pressure: ['druk'],
  theory: ['teorie'],
  behaviour: ['gedrag'],

  // --- energy, rate and equilibrium
  exothermic: ['eksotermiese'],
  endothermic: ['endotermiese'],
  activation: ['aktiverings'],
  activated: ['geaktiveerde'],
  complex: ['kompleks'],
  rate: ['reaksietempo', 'tempo'],
  collision: ['botsingsteorie', 'botsing'],
  catalysts: ['katalisators'],
  equilibrium: ['ewewig'],
  reversible: ['omkeerbare'],
  constant: ['ewewigskonstante', 'konstante'],
  chatelier: ['chatelier'],
  principle: ['beginsel'],

  // --- acids, bases and redox
  acid: ['suur'],
  acids: ['sure'],
  base: ['basis'],
  bases: ['basisse'],
  arrhenius: ['arrhenius'],
  lowry: ['lowry'],
  conjugate: ['gekonjugeerde'],
  strong: ['sterk'],
  weak: ['swak'],
  concentrated: ['gekonsentreerde'],
  dilute: ['verdunde'],
  salts: ['soute'],
  salt: ['sout'],
  hydrolysis: ['hidrolise'],
  titrations: ['titrasies'],
  titration: ['titrasie'],
  indicators: ['indikators'],
  redox: ['redoksreaksies', 'redoks'],
  oxidation: ['oksidasie'],
  numbers: ['oksidasiegetalle', 'getalle'],
  half: ['halfreaksies', 'half'],
  galvanic: ['galvaniese'],
  cells: ['selle'],
  electrode: ['elektrode'],
  potentials: ['potensiale'],
  electrolytic: ['elektrolitiese'],
  electrolysis: ['elektrolise'],
  standard: ['standaard'],

  // --- organic chemistry
  organic: ['organiese'],
  functional: ['funksionele'],
  saturated: ['versadigde'],
  unsaturated: ['onversadigde'],
  structural: ['struktuur'],
  isomers: ['isomere'],
  chain: ['ketting'],
  positional: ['posisionele'],
  iupac: ['iupac'],
  naming: ['naamgewing', 'nomenklatuur'],
  alkanes: ['alkane'],
  alkenes: ['alkene'],
  alcohols: ['alkohole'],
  haloalkanes: ['haloalkane'],
  esters: ['esters'],
  properties: ['eienskappe'],
  combustion: ['verbranding'],
  addition: ['addisie'],
  elimination: ['eliminasie'],
  substitution: ['substitusie'],
  cracking: ['kraking'],
  condensation: ['kondensasie'],
  polymerisation: ['polimerisasie'],
  polymers: ['polimere'],
  plastics: ['plastiek'],

  // --- chemical systems
  hydrosphere: ['hidrosfeer'],
  lithosphere: ['litosfeer'],
  atmosphere: ['atmosfeer'],
  biosphere: ['biosfeer'],
  water: ['water'],
  mining: ['mynbou'],
  mineral: ['mineraal'],
  ores: ['ertse'],
  ore: ['erts'],
  gold: ['goud'],
  recovery: ['herwinning'],
  fertilizers: ['kunsmis'],
  nitrogen: ['stikstof'],
  phosphorus: ['fosfor'],
  potassium: ['kalium'],
  haber: ['haber'],
  ammonia: ['ammoniak'],
  ostwald: ['ostwald'],
  nitric: ['salpetersuur'],
  sulfuric: ['swaelsuur'],
  nitrate: ['nitraat'],
  sulfate: ['sulfaat'],
  eutrophication: ['eutrofikasie'],
  environmental: ['omgewings'],
  fuels: ['brandstowwe'],
  warming: ['verhitting'],
  global: ['globale'],
  nutrients: ['voedingstowwe'],
  dams: ['damme'],
  people: ['mense'],
  ecology: ['ekologie'],
  impact: ['impak'],
  plants: ['plante'],
  industry: ['nywerhede'],
  process: ['proses'],
}

/**
 * How an Afrikaans channel titles a video for a grade: "Graad 11".
 *
 * The subject word matters as much as the topic word. Afrikaans science
 * channels label videos "Fisika" or "Chemie" far more often than "Fisiese
 * Wetenskappe" - "Gr 11 Chemie : Redoksreaksies", "Gr. 10 Fisika:
 * Elektrostatika" - so a science run searches all three rather than the
 * formal subject name alone. Searching "wiskunde" for a science sub-topic,
 * which is what this did before it knew about subjects, returns maths.
 */
export function afrikaansQueries(
  subTopic: string,
  grade: number,
  subject: 'maths' | 'science' = 'maths'
): string[] {
  const science = subject === 'science'
  const vocabulary = science ? AFRIKAANS_SCIENCE_TERMS : AFRIKAANS_TERMS

  // One form per word: the map lists singular and plural so the scorer can
  // match either, but a query repeating both ("drieterme drieterm") reads as
  // noise to YouTube and narrows the results.
  const terms = subTopic
    .toLowerCase()
    .split(/[^a-z]+/)
    .map((word) => vocabulary[word]?.[0])
    .filter((term): term is string => Boolean(term))
  const phrase = [...new Set(terms)].slice(0, 3).join(' ')
  if (!phrase) return []

  if (science) {
    return [
      `graad ${grade} fisika ${phrase}`,
      `graad ${grade} chemie ${phrase}`,
      `${phrase} graad ${grade}`,
      `fisiese wetenskappe ${phrase} graad ${grade}`,
    ]
  }

  return [
    `graad ${grade} wiskunde ${phrase}`,
    `${phrase} graad ${grade}`,
    `wiskunde ${phrase} afrikaans`,
  ]
}
