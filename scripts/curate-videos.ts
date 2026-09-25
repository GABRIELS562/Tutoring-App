/**
 * Curates one YouTube video per CAPS sub-topic.
 *
 *   npx tsx scripts/curate-videos.ts --grade 10 [--limit N]
 *
 * For each sub-topic in src/content/caps-curriculum.ts it runs several
 * search queries, merges the results, filters them, ranks what survives by
 * view count, and writes the ranked candidates to
 * docs/curriculum/candidates-gr<N>.json plus a readable table on stdout.
 *
 * FILTERS (in order - a video must pass all of them):
 *   1. Has a duration      - excludes live streams, Shorts, playlists
 *   2. Duration <= 2h      - a 5-hour marathon is unusable on mobile data
 *   3. Not obviously the wrong grade - a title naming a DIFFERENT grade is
 *      dropped; a title naming no grade is kept (many good videos don't)
 *   4. Not Maths Literacy  - "maths lit" is a different subject
 *   5. Embeddable          - checked against YouTube's oEmbed endpoint;
 *      a video that won't play inside the app is useless to us
 *
 * RANKING: views, with a bonus for the verified SA CAPS channels and a
 * penalty for videos over 20 minutes (data cost for the student).
 *
 * Nothing is written to src/content by this script - curation is reviewed
 * first, then applied by scripts/apply-curated-videos.ts.
 */
import { writeFileSync, mkdirSync, existsSync, readFileSync } from 'node:fs'
import { capsCurriculum, type CapsTopic } from '../src/content/caps-curriculum'
import { capsScienceCurriculum } from '../src/content/caps-science-curriculum'

/**
 * `--subject science` curates Physical Sciences instead of Maths. It changes
 * which curriculum is read, which subjects count as the WRONG subject, and
 * which words are discriminating - a maths video is the wrong answer for a
 * science sub-topic exactly as a physics one was for a maths sub-topic.
 */
const SUBJECT: 'maths' | 'science' =
  process.argv[process.argv.indexOf('--subject') + 1] === 'science' ? 'science' : 'maths'
const IS_SCIENCE = SUBJECT === 'science'

/**
 * `--explain` prints, for each sub-topic, the best candidates that were
 * rejected and which filter rejected them. A blank result is either "no such
 * video exists" or "a filter is too strict", and those need telling apart.
 */
const EXPLAIN = process.argv.includes('--explain')
import {
  AFRIKAANS_CHANNELS,
  AFRIKAANS_TERMS,
  AFRIKAANS_SCIENCE_TERMS,
  afrikaansQueries,
} from './lib/afrikaans'

/**
 * `--lang af` curates the Afrikaans track into videoIdAf. It changes three
 * things: which channels count, the vocabulary the scorer matches on, and how
 * many views are credible - an Afrikaans CAPS video with 3,000 views is
 * well-watched, where the English equivalent would be ignored.
 */
const IS_AFRIKAANS = process.argv.includes('--lang') &&
  process.argv[process.argv.indexOf('--lang') + 1] === 'af'

// Channels verified as South African CAPS teachers (Sept 2026 research,
// see docs/client-updates/2026-09-17-status-and-video-shortlist.html).
const SA_CHANNELS = new Set([
  'Kevinmathscience',
  'Miss Martins Maths and Science',
  'Mlungisi Nkosi Maths & Science',
  'Mindset',
  'ThunderEDUC',
  'PHAKAMA RESEARCH',
  'Isinamuva Tutoring',
  'Zandile loves Maths',
  'My Class Series',
  'Maths Monkey',
  'Khoza Explains',
  'Mrs Townsend Mathematics - South Africa',
  'Margie Mackechnie',
  'Wiskunde_Mathematics_SUM',
  'Online Maths by Miss Pythagoras',
  'Distance learning with Lee',
  'NTE \\ New Technological Education',
  'Maths And Science Aid',
  'SmartPrep MathsScience',
  'Modern Maths',
  'The daily Dose of Mathematics',
  'MathsG',
  'WeMathify',
  'Science Clinic',
  // Physical Sciences channels, from a survey of ten CAPS science searches.
  // Kevinmathscience and Miss Martins already dominate science as well as
  // maths; these carry the rest. The Organic Chemistry Tutor, Tyler DeWitt
  // and Professor Dave rank high on views but are American, not CAPS, so
  // they are deliberately absent.
  'Class Act Education',
  'JuniorTukkie at the University of Pretoria',
  'SABC Education Shows',
  'Maths Zone African Motives',
  'Mr X Mathematics and Science',
  "Kevin's Classroom",
  'Simple Science',
  'Learnida',
  'Nambane Academy',
  // Found by re-searching the blank sub-topics: small SA channels that carry
  // exactly the topics the big ones skip - Grade 11 optics, chemical systems.
  'Mindset Teach',
  'Impaq Education',
  'Goon School',
  'Africa Teen Geeks',
  'Edu-ca-te',
  'Siyavula Education',
  'FunEasyScience',
  'Physical Sciences Made Easy',
])

const MAX_DURATION_SECONDS = 2 * 60 * 60
const PREFERRED_MAX_SECONDS = 20 * 60
const CANDIDATES_PER_SUBTOPIC = 5

export interface Candidate {
  id: string
  title: string
  channel: string
  views: number
  viewsText: string
  duration: string
  durationSeconds: number
  embeddable: boolean
  score: number
  saChannel: boolean
}

export interface CuratedSubTopic {
  slug: string
  topicTitle: string
  grade: number
  paper: number
  subTopic: string
  queries: string[]
  candidates: Candidate[]
  /** Highest-ranked candidate, or null when nothing survived the filters. */
  pick: Candidate | null
  /** True when only a video labelled for an adjacent grade was available. */
  usedAdjacentGrade?: boolean
  note?: string
}

function parseDuration(text: string): number {
  const parts = text.split(':').map((n) => parseInt(n, 10))
  if (parts.some(Number.isNaN)) return NaN
  return parts.reduce((total, part) => total * 60 + part, 0)
}

function parseViews(text: string): number {
  const digits = text.replace(/[^0-9]/g, '')
  return digits ? parseInt(digits, 10) : 0
}

/** The slice of YouTube's internal search payload this script reads. */
interface VideoRenderer {
  videoId?: string
  title?: { runs?: { text: string }[] }
  ownerText?: { runs?: { text: string }[] }
  viewCountText?: { simpleText?: string }
  lengthText?: { simpleText?: string }
}

/**
 * Searches and embed checks are cached to disk because the scorer is tuned by
 * re-running it: a wrong pick is found by reading the output, the rules are
 * corrected, and every grade is curated again. Without a cache each of those
 * passes re-fetched ~150 YouTube pages, which got the run rate-limited from
 * 14s to 2 minutes per sub-topic. The cache makes a re-score free, so a
 * recheck costs nothing and never depends on the network being friendly.
 *
 * Only parsed results are stored, never page HTML. Delete the file to refetch.
 */
const CACHE_PATH = 'docs/curriculum/.search-cache.json'

interface SearchCache {
  searches: Record<string, Omit<Candidate, 'embeddable' | 'score' | 'saChannel'>[]>
  embeddable: Record<string, boolean>
}

function loadCache(): SearchCache {
  if (process.argv.includes('--no-cache')) return { searches: {}, embeddable: {} }
  try {
    const parsed = JSON.parse(readFileSync(CACHE_PATH, 'utf8')) as Partial<SearchCache>
    return { searches: parsed.searches ?? {}, embeddable: parsed.embeddable ?? {} }
  } catch {
    return { searches: {}, embeddable: {} }
  }
}

const cache: SearchCache = loadCache()
let cacheDirty = false

function saveCache(): void {
  if (!cacheDirty) return
  try {
    writeFileSync(CACHE_PATH, JSON.stringify(cache))
    cacheDirty = false
  } catch (error) {
    console.warn(`  could not write ${CACHE_PATH}: ${(error as Error).message}`)
  }
}

async function searchYouTube(query: string): Promise<Omit<Candidate, 'embeddable' | 'score' | 'saChannel'>[]> {
  const cached = cache.searches[query]
  if (cached) return cached
  const fetched = await searchYouTubeUncached(query)
  // An empty result usually means we were throttled, not that YouTube has
  // nothing - caching it would make the miss permanent.
  if (fetched.length > 0) {
    cache.searches[query] = fetched
    cacheDirty = true
    saveCache()
  }
  return fetched
}

async function searchYouTubeUncached(query: string): Promise<Omit<Candidate, 'embeddable' | 'score' | 'saChannel'>[]> {
  const url = `https://www.youtube.com/results?search_query=${encodeURIComponent(query)}`
  for (let attempt = 0; attempt < 4; attempt++) {
    try {
      const res = await fetch(url, {
        headers: { 'User-Agent': 'Mozilla/5.0 (Macintosh)', 'Accept-Language': 'en-ZA,en' },
      })
      const html = await res.text()
      const match = html.match(/var ytInitialData = (\{.*?\});<\/script>/)
      if (!match) {
        await new Promise((r) => setTimeout(r, 1500))
        continue
      }
      const results: Omit<Candidate, 'embeddable' | 'score' | 'saChannel'>[] = []
      const walk = (node: unknown): void => {
        if (Array.isArray(node)) return node.forEach(walk)
        if (!node || typeof node !== 'object') return
        const obj = node as Record<string, unknown>
        if (obj.videoRenderer) {
          const v = obj.videoRenderer as VideoRenderer
          const title = (v.title?.runs ?? []).map((r) => r.text).join('')
          const channel = (v.ownerText?.runs ?? []).map((r) => r.text).join('')
          const viewsText: string = v.viewCountText?.simpleText ?? ''
          const duration: string = v.lengthText?.simpleText ?? ''
          if (v.videoId && duration) {
            results.push({
              id: v.videoId,
              title,
              channel,
              views: parseViews(viewsText),
              viewsText,
              duration,
              durationSeconds: parseDuration(duration),
            })
          }
        }
        Object.values(obj).forEach(walk)
      }
      walk(JSON.parse(match[1]))
      return results
    } catch {
      await new Promise((r) => setTimeout(r, 2000))
    }
  }
  return []
}

async function isEmbeddable(videoId: string): Promise<boolean> {
  const cached = cache.embeddable[videoId]
  if (cached !== undefined) return cached
  const url = `https://www.youtube.com/oembed?format=json&url=${encodeURIComponent(
    `https://www.youtube.com/watch?v=${videoId}`
  )}`
  try {
    const res = await fetch(url, { headers: { 'User-Agent': 'Mozilla/5.0' } })
    cache.embeddable[videoId] = res.ok
    cacheDirty = true
    saveCache()
    return res.ok
  } catch {
    // A network failure is not evidence the video is unembeddable, so this
    // one stays out of the cache.
    return false
  }
}

/**
 * Titles that announce which CAPS topic they belong to. A video may name a
 * topic other than the one we are curating - "Trig Triangles Grade 10: Find
 * angle" was picked for the Euclidean Geometry sub-topic "Lines, angles and
 * triangles", because both talk about triangles and angles.
 *
 * Only used to reject: a title naming a different topic and not this one is
 * the wrong lesson. Titles naming no topic at all are left alone, since most
 * are simply terse.
 */
/**
 * Science topic markers, the counterpart of the maths ones below. Keyed by
 * the slug minus its grade suffix, so mechanics-gr10 and mechanics-gr12
 * share an entry.
 */
/**
 * Matched against the FOLDED title, so patterns carry no diacritics.
 *
 * The Afrikaans alternatives matter for the same reason as the maths ones:
 * while these were English-only they matched nothing on an Afrikaans title,
 * so the Afrikaans science picks were made with no cross-topic protection
 * at all. Short words are anchored (\blig\b, \bmol\b) because "lig" is a
 * substring of veiligheid and "mol" of molekule.
 */
const SCIENCE_TOPIC_MARKERS: Record<string, RegExp> = {
  mechanics: /mechanic|momentum|impulse|projectile|newton|velocit|accelerat|displacement|friction|work.{0,12}energy|\bwep\b|gravitation|meganika|impuls|projektiel|snelheid|versnelling|verplasing|wrywing|arbeid|drywing|gravitasie|bewegingswet/i,
  'waves-sound-light': /wave|sound|light|doppler|refract|snell|diffract|optic|ultrasound|spectrum|photon|electromagnetic|golwe|golf|klank|\blig\b|breking|diffraksie|optika|ultraklank|spektrum|foton|golffront/i,
  'electricity-magnetism': /electric|magnet|circuit|resistor|resistance|voltage|\bemf\b|ohm|coulomb|faraday|solenoid|generator|motor|alternating|elektries|elektrisiteit|magneet|magnetiese|stroombaan|stroombane|weerstand|\bemk\b|solenoide|wisselstroom|elektrostatika|lading/i,
  'optical-phenomena': /photo-?electric|work function|emission spectr|absorption spectr|photon|fotoelektriese|foto-elektriese|arbeidsfunksie|emissiespektr|absorpsiespektr/i,
  'matter-materials': /atom|periodic|bonding|isotope|electron configuration|intermolecular|molecular shape|lewis|vsepr|gas law|kinetic (molecular )?theory|atoom|periodieke|binding|isotoop|elektronkonfigurasie|intermolekulere|molekulere vorm|gaswet|kinetiese molekulere/i,
  'organic-chemistry': /organic|alkane|alkene|alcohol|ester|isomer|polymer|iupac|functional group|cracking|organiese|alkaan|alkohol|isomeer|polimeer|polimere|funksionele groep|kraking|naamgewing|nomenklatuur/i,
  'chemical-change': /stoichiometr|\bmole\b|molar|titration|redox|galvanic|electrolytic|equilibrium|catalyst|acid|\bbase|oxidation|precipitat|balancing|endothermic|exothermic|stoigiometr|\bmol\b|molbegrip|molere|titrasie|redoks|galvaniese|elektrolitiese|chemiese ewewig|ewewigskonstante|ewewigsposisie|ewewigsberekening|katalisator|\bsuur|\bsure\b|basisse|oksidasie|neerslag|balansering|endotermiese|eksotermiese|reaksietempo/i,
  'chemical-systems': /hydrosphere|lithosphere|mining|fertilizer|haber|ostwald|eutrophication|water quality|fossil fuel|hidrosfeer|litosfeer|mynbou|kunsmis|eutrofikasie|watergehalte|fossielbrandstof/i,
}

const SEQUENCE_RE = /number pattern|getalpatro|sequence|series|\brye\b|reekse/i

/**
 * Markers are matched against the FOLDED title, so each pattern is written
 * without diacritics: reel matches reël, gradient matches gradiënt.
 *
 * Afrikaans alternatives are not decoration. These patterns are the only
 * thing stopping a video from one topic being served for another, and while
 * they were English-only they did nothing at all on an Afrikaans title -
 * every Afrikaans pick was made with no cross-topic protection. That is how
 * "Wiskunde - Analitiese Meetkunde: Sirkels en raaklyne" came to be served
 * for Grade 11 Euclidean Geometry's "Tangents to circles": analytical
 * geometry is a different topic, and the English `analytical geometry`
 * pattern does not match "Analitiese Meetkunde".
 */
const TOPIC_MARKERS: Record<string, RegExp> = {
  'number-patterns': SEQUENCE_RE,
  'sequences-series': SEQUENCE_RE,
  // The ratio names matter as much as the word "trig": "Sin Triangle Grade
  // 10" is a trigonometry lesson and was picked for Euclidean geometry.
  // "tangent" is deliberately absent - it belongs to circle geometry too,
  // and so is bare "raaklyn" for the same reason.
  // "Special triangles"/"special angles" is the trig 30-60-90 lesson, not a
  // Euclidean one, despite naming triangles and angles.
  trig: /\btrig|\b(sin|cos|tan|sine|cosine)\b|rule|reduction formula|identities|special (triangle|angle)|sinus|kosinus|reduksieformule|identiteite|dubbelhoek|saamgestelde hoek/i,
  'euclidean-geometry': /euclidean|circle geometry|midpoint theorem|parallelogram|cyclic|proportionality|similarity|euklidies|sirkelmeetkunde|middelpuntstelling|koordevierhoek|eweredigheid|gelykvormig/i,
  'analytical-geometry': /analytical geometry|distance formula|gradient|inclination|analitiese meetkunde|afstandsformule|inklinasie/i,
  statistics: /statistic|ogive|box and whisker|standard deviation|regression|scatter|statistiek|ogief|mond-en-snor|standaardafwyking|regressie|spreidiagram|kwartiel/i,
  finance: /financial math|interest|annuit|depreciation|hire purchase|exchange rate|finansiele wiskunde|rente|annuiteit|waardevermindering|huurkoop|wisselkoers/i,
  calculus: /calculus|derivative|differentiat|first principles|differensiaalrekene|differensiasie|afgeleide|eerste beginsel/i,
  probability: /probability|venn|tree diagram|contingency|waarskynlikheid|boomdiagram|kontingensie/i,
}

/** Which CAPS topic a slug belongs to, ignoring the grade suffix. */
function topicKey(slug: string): string {
  return slug.replace(/-gr1[012]$/, '')
}

/**
 * Signals strong enough to name the topic outright, even when the title also
 * mentions another one. "Power of an electric motor: Power part 3: WEP gr12"
 * is a Work, Energy & Power lesson that happens to use a motor as its
 * example - it matched the Electricity & Magnetism sub-topic on the word
 * motor and served it instead of an electrodynamics lesson.
 */
const DEFINITIVE_MARKERS: Record<string, RegExp> = {
  mechanics: /\bwep\b|work.{0,4}energy.{0,4}(theorem|and power)/i,
}

export function isOtherMathsTopic(slug: string, rawTitle: string): boolean {
  const markers = IS_SCIENCE ? SCIENCE_TOPIC_MARKERS : TOPIC_MARKERS
  const key = topicKey(slug)
  const title = fold(rawTitle)

  const claimedBy = Object.entries(DEFINITIVE_MARKERS).find(([, re]) => re.test(title))
  if (claimedBy && claimedBy[0] !== key) return true

  const own = markers[key]
  if (own?.test(title)) return false
  return Object.entries(markers).some(
    ([other, pattern]) => other !== key && pattern.test(title)
  )
}

/**
 * Physical Sciences is one subject examined as two papers, and its halves
 * share vocabulary: "power" is in Work Energy & Power and in electric
 * circuits, "energy" is in mechanics and in bond energy, "conservation"
 * covers momentum and mass. Maths never needed this because its papers do
 * not compete for the same words.
 *
 * Only decides when a title clearly names one half and not the other; a
 * title naming neither is left to the other filters.
 */
const PHYSICS_RE =
  /\bphysics\b|mechanic|momentum|impulse|velocit|accelerat|projectile|newton|free body|friction|circuit|resistor|\bemf\b|voltage|\bcurrent\b|ohm|magnet|solenoid|faraday|doppler|photo-?electric|refract|snell|diffract|wavefront|generator|alternating current/i
const CHEMISTRY_RE =
  /\bchemistry\b|chemical|\bmole\b|molar|stoichiometr|titration|\bacid|\bbase[s]?\b|\bph\b|redox|galvanic|electrolytic|electrochem|organic|alkane|alkene|alcohol|ester|polymer|equilibrium|periodic table|bonding|intermolecular|gas law|fertilizer|haber|ostwald|isomer|oxidation number/i

export function isWrongPaper(paper: 1 | 2, title: string): boolean {
  const physics = PHYSICS_RE.test(title)
  const chemistry = CHEMISTRY_RE.test(title)
  if (paper === 1) return chemistry && !physics
  return physics && !chemistry
}

function gradesNamedIn(title: string): number[] {
  // "graad" as well as "grade"/"gr": an Afrikaans title says "Graad 11", and
  // without this the grade filter passes every Afrikaans video through.
  return [...title.matchAll(/\b(?:gr(?:ade)?|graad)\s*\.?\s*(\d{1,2})\b/gi)].map((m) =>
    parseInt(m[1], 10)
  )
}

/** A title naming a grade OTHER than the one we want is the wrong video. */
function wrongGrade(title: string, grade: number): boolean {
  const mentioned = gradesNamedIn(title)
  return mentioned.length > 0 && !mentioned.includes(grade)
}

/**
 * Some sub-topics appear in the CAPS documents for two consecutive grades
 * (depreciation is Grade 10 here but Kevinmathscience titles his as Grade
 * 11). Used only as a fallback when nothing for the exact grade survives,
 * and the result is flagged for review.
 */
function adjacentGrade(title: string, grade: number): boolean {
  const mentioned = gradesNamedIn(title)
  return mentioned.length > 0 && mentioned.some((g) => Math.abs(g - grade) === 1)
}

function isMathsLit(title: string, channel: string): boolean {
  return /maths?\s*lit|mathematical literacy|geletterdheid|wisk\s*gelet|vloerplan|skaalverdeling|werklike afstand/i.test(
    `${title} ${channel}`
  )
}

/**
 * Many CAPS channels teach Maths AND Physical Sciences, so a physics video
 * can match a maths sub-topic on a shared word - "The general term Tn"
 * matched "Grade 11 Physical Sciences Term 2 topics", and "parallel and
 * perpendicular lines" matched a vectors video about perpendicular
 * components. This is a maths curriculum; those are a different subject.
 */
const NOT_MATHS =
  /physical science|physics|chemistry|chemical|life science|biology|geography|accounting|economics|business studies|vectors? in 2d|newton|doppler|velocity|momentum|electric|circuit|fisiese wetenskap|wetenskap|chemie|biologie|lewenswetenskappe|rekeningkunde|\brek\b|besigheidstudies/i

/**
 * For science the same guard runs the other way: a maths lesson is the wrong
 * answer for a science sub-topic. Natural Sciences is the Grade 8-9 subject
 * that precedes Physical Sciences and covers the same words far more
 * shallowly, so it is excluded too, as are Life Sciences and Maths Lit.
 */
const NOT_SCIENCE =
  /\bmaths?\b|mathematic|wiskunde|algebra|\btrig\b|trigonometr|calculus|geometry|meetkunde|parabola|hyperbola|quadratic|logarithm|life science|lewenswetenskappe|biology|natural science|natuurwetenskap|accounting|economics|geography/i

/** Pure form, so both directions are testable without re-reading argv. */
export function isOtherSubjectFor(subject: 'maths' | 'science', title: string): boolean {
  return (subject === 'science' ? NOT_SCIENCE : NOT_MATHS).test(title)
}

export function isOtherSubject(title: string): boolean {
  return isOtherSubjectFor(SUBJECT, title)
}

/**
 * "Term 2" is a school term, not the n-th term of a sequence. Without this,
 * the Grade 11 general-term sub-topic matched a Physical Sciences
 * "Term 2 topics" video.
 */
export function isSchoolTerm(subTopic: string, title: string): boolean {
  return /\bterm\b/i.test(subTopic) && /\bterm\s*\d/i.test(title)
}

/**
 * Words that carry no topical signal - they appear in almost every maths
 * video title, so matching on them tells us nothing about relevance.
 */
const STOPWORDS = new Set([
  'the', 'and', 'of', 'a', 'an', 'in', 'to', 'for', 'on', 'with', 'at', 'from', 'by',
  'grade', 'gr', 'maths', 'math', 'mathematics', 'caps', 'nsc', 'exam', 'lesson',
  'introduction', 'intro', 'basic', 'basics', 'part', 'video', 'using', 'its', 'their',
  // Afrikaans equivalents, for --lang af
  'graad', 'wiskunde', 'deel', 'inleiding', 'voorbeeld', 'voorbeelde', 'les', 'die', 'van',
  'en', 'met', 'vir', 'op', 'se',
])

/** Maths synonyms, so a title using different wording still matches. */
const ENGLISH_SYNONYMS: Record<string, string[]> = {
  wavefront: ['wave front', 'huygens', "huygen's"],
  // "Does Line Intersect Circle" is the lesson for "Intersecting circles";
  // the stemmer does not reach -ing forms on its own.
  intersecting: ['intersect', 'intersects', 'intersection'],
  exponent: ['exponents', 'indices', 'index', 'powers'],
  exponents: ['exponent', 'indices', 'powers'],
  trinomial: ['trinomials'],
  trinomials: ['trinomial'],
  cubes: ['cubic', 'cube'],
  factorisation: ['factorising', 'factorization', 'factorizing', 'factorise', 'factor'],
  hyperbolic: ['hyperbola'],
  quadratic: ['parabola', 'parabolas'],
  gradient: ['slope'],
  dispersion: ['range', 'quartiles', 'percentiles'],
  midpoint: ['mid-point'],
  depreciation: ['depreciate'],
  simultaneous: ['simultaneously'],
  inequalities: ['inequality'],
  ogives: ['ogive', 'cumulative'],
  annuities: ['annuity'],
  permutations: ['permutation', 'arrangements'],
  differentiation: ['derivative', 'derivatives', 'differentiate'],
  optimisation: ['optimization', 'optimisation', 'maxima', 'minima'],
  identities: ['identity'],
  reduction: ['reducing'],
  quadrilaterals: ['quadrilateral', 'parallelogram', 'rhombus', 'kite'],
  tendency: ['mean', 'median', 'mode', 'average'],
  bivariate: ['scatter', 'regression', 'correlation'],
  sigma: ['summation'],
  logarithms: ['logarithm', 'log', 'logs'],
  inverse: ['inverses'],
  discriminant: ['nature', 'roots'],
}

/**
 * In Afrikaans mode the CAPS vocabulary is folded in as extra synonyms, which
 * is what lets an English sub-topic ("Factorisation: trinomials") match an
 * Afrikaans title ("Faktorisering van drieterme"). Everything downstream -
 * the relevance gate, the required terms, the guards - then works unchanged.
 */
// An Afrikaans run must match on both languages: sub-topics are written in
// English, titles are Afrikaans, and plenty of titles mix the two
// ("GR11 Intermolekulere Kragte"). The vocabulary follows the subject -
// pairing science sub-topics with the maths map is how the science run
// produced no queries at all.
/**
 * The synonym table for a subject and language, as a pure function so the
 * Afrikaans rules can be tested. The module-level SYNONYMS below is this
 * applied to argv; passing the table in explicitly is what lets a test
 * exercise an Afrikaans title without re-launching the process.
 */
export function synonymsFor(
  subject: 'maths' | 'science',
  language: 'en' | 'af'
): Record<string, string[]> {
  if (language === 'en') return ENGLISH_SYNONYMS
  const vocabulary = subject === 'science' ? AFRIKAANS_SCIENCE_TERMS : AFRIKAANS_TERMS
  return Object.fromEntries(
    [...new Set([...Object.keys(ENGLISH_SYNONYMS), ...Object.keys(vocabulary)])].map((word) => [
      word,
      [...(ENGLISH_SYNONYMS[word] ?? []), ...(vocabulary[word] ?? [])],
    ])
  )
}

const SYNONYMS: Record<string, string[]> = synonymsFor(SUBJECT, IS_AFRIKAANS ? 'af' : 'en')


/** Crude singular/plural fold - "parallelograms" should match "Parallelogram". */
/**
 * Is this sub-topic listing alternatives rather than naming one concept?
 *
 * Only a comma list AFTER a colon counts - "Chemical bonding: covalent, ionic
 * and metallic" names three bond types, any one of which is the lesson. A bare
 * comma usually joins two different concepts instead: "Molar mass, percentage
 * composition and empirical formula" is one topic covering all three, and
 * relaxing it let a molar VOLUME video stand in for molar mass.
 */
function isEnumeratedList(subTopic: string): boolean {
  return /:[^:]*,/.test(subTopic)
}

/**
 * Folds Afrikaans diacritics to plain ASCII: lineêre -> lineere,
 * stoïgiometriese -> stoigiometriese, intermolekulêre -> intermolekulere.
 *
 * Two things depended on this and neither worked before. The word matcher
 * tokenises on [a-z0-9], so "Intermolekulêre Kragte" split into
 * "intermolekul" and "re" and matched no listed term at all - proper
 * Afrikaans orthography was being skipped wholesale, which is most titles.
 * Listing both spellings in the vocabulary did not help, because the title
 * side was being mangled too.
 *
 * Folding also collapses the spellings channels genuinely disagree on -
 * Stoigiometriese / Stoïgiometriese, Foto-elektriese / Fotoëlektriese -
 * into one form, so the vocabulary needs one entry instead of three.
 */
export function fold(text: string): string {
  return text.normalize('NFD').replace(/[\u0300-\u036f]/g, '')
}

function stem(word: string): string {
  return word.endsWith('ies') ? word.slice(0, -3) + 'y' : word.replace(/s$/, '')
}

/**
 * Does `haystack` contain `word` as a whole word, singular or plural?
 *
 * Compares stemmed words rather than substrings. A plain `includes` let
 * "term" match inside "Determine", so "Finding the general formula (n-th
 * term)" was satisfied by "Hyperbola Grade 10: Determine Equation" - the
 * required word was present as letters but not as the concept.
 *
 * Multi-word and hyphenated forms keep the substring test: they are specific
 * enough not to collide, and tokenising would split them apart.
 */
function containsTerm(rawHaystack: string, rawWord: string): boolean {
  const haystack = fold(rawHaystack)
  const word = fold(rawWord)
  if (/[\s-]/.test(word)) return haystack.includes(word)
  const target = stem(word)
  const words = haystack.match(/[a-z0-9²³]+/g) ?? []
  return words.some((candidate) => stem(candidate) === target || candidate === word)
}

function tokenise(text: string): string[] {
  const lower = fold(text.toLowerCase()).replace(/[^a-z0-9²√\s-]/g, ' ')
  const words = lower
    .split(/[\s-]+/)
    .filter((word) => word.length > 2 && !STOPWORDS.has(word))
  // "co-functions" must not be satisfied by a title saying only "functions",
  // so the joined compound is a token in its own right.
  const compounds = (lower.match(/\b[a-z]+-[a-z]+\b/g) ?? []).map((c) => c.replace('-', ''))
  return [...new Set([...words, ...compounds])]
}

/**
 * Terms where a near-miss is a DIFFERENT concept, not a loose match. If a
 * sub-topic names one of these, the video title must name it too.
 *
 * Without this rule, "sum and difference of cubes" matched a "difference of
 * two squares" video (squares are not cubes), and "the exponent laws"
 * matched "exponential equation" - both plausible-looking, both wrong.
 */
export const SCIENCE_DISCRIMINATING = [
  // Physics concepts that name the lesson
  'momentum', 'impulse', 'projectile', 'doppler', 'photoelectric', 'refraction',
  'diffraction', 'snell', 'wavefront', 'coulomb', 'faraday', 'ohm', 'generator',
  'motor', 'solenoid', 'emf', 'resistor', 'resistance', 'magnetic', 'electrostatic',
  'acceleration', 'velocity', 'displacement', 'friction', 'gravitation', 'inertia',
  'scalar', 'vector', 'photon', 'spectra', 'spectrum', 'ultrasound', 'longitudinal',
  'transverse', 'amplitude', 'wavelength', 'frequency', 'work', 'power',
  'instantaneous', 'superposition', 'pitch', 'loudness', 'compass', 'polarisation',
  // Chemistry concepts that name the lesson
  'stoichiometry', 'mole', 'molar', 'titration', 'redox', 'galvanic', 'electrolytic',
  'equilibrium', 'catalyst', 'isomer', 'ester', 'alkane', 'alkene', 'polymer',
  'polymerisation', 'cracking', 'substitution', 'elimination', 'oxidation',
  'electronegativity', 'intermolecular', 'lewis', 'vsepr', 'isotope', 'periodic',
  'precipitation', 'hydrolysis', 'haber', 'ostwald', 'eutrophication', 'fertilizer',
  'lithosphere', 'hydrosphere', 'ionic', 'covalent', 'metallic', 'exothermic',
  'endothermic', 'activation', 'empirical', 'concentration', 'electrolysis',
  'functional', 'iupac', 'valence', 'kinetic', 'hydration',
  // Grade 12 review: each of these names the lesson, and without it a video
  // about the neighbouring concept stood in. "Equilibrium Graphs" was
  // serving Le Chatelier, "General Formula | Alkanes" was serving addition
  // reactions of alkenes, and "Exam question functions gr 12" - a maths
  // title - was serving the function of N, P and K in plants.
  'chatelier', 'addition', 'reversible', 'combustion', 'polymerisation',
  'collision', 'nitrogen', 'phosphorus', 'potassium', 'eutrophication',
  'threshold', 'conjugate', 'indicator', 'hydrolysis', 'phase', 'refractive',
  // Grade 10 review: 'permanent' keeps a Grade 11 electromagnetic-flux lesson
  // out of permanent magnets, 'conservation' keeps stoichiometry out of the
  // conservation sub-topics, and 'speed' keeps a generic waves introduction
  // out of the speed of sound.
  'permanent', 'conservation', 'speed',
]

export const MATHS_DISCRIMINATING = [
  'cubes', 'squares', 'trinomials', 'laws', 'hyperbolic', 'exponential',
  'logarithms', 'sigma', 'ogives', 'annuities', 'permutations', 'inverse',
  'limit', 'principles', 'compound', 'simple', 'depreciation', 'hire',
  'exchange', 'venn', 'midpoint', 'gradient', 'distance', 'median', 'variance',
  'standard', 'bivariate', 'regression', 'correlation', 'discriminant',
  'surds', 'reduction', 'identities', 'sine', 'cosine', 'area', 'tangents',
  'cyclic', 'chords', 'similarity', 'proportionality', 'optimisation',
  'quadratic', 'geometric', 'arithmetic', 'factorial', 'inequalities',
  'equations', 'patterns', 'functions', 'interest',
  // Head nouns of short phrases where a single shared word is not enough:
  // "the area rule" is not a video about the area of a circle, and
  // "inclination of a line" is not any video mentioning a line.
  'rule', 'term', 'inclination', 'cofunctions', 'perpendicular', 'parallel', 'sinking',
  // Grade 12: each of these is the concept, so a video without the word is a
  // different lesson - "Equation of Tangent Calculus" is not "tangents to circles".
  'simultaneous', 'pythagoras', 'infinity', 'circle', 'cubic', 'cartesian',
  'nominal', 'effective', 'intersecting', 'double',
  'annuities', 'skewed', 'deviation', 'diagrams', 'tangents', 'chords',
]

/**
 * Pairs that distinguish two sub-topics from each other - EXCEPT when one
 * sub-topic names both, in which case it covers both and neither word
 * discriminates any more.
 *
 * "Simple interest" and "Compound interest" are separate sub-topics, so
 * those words must be required. But "Simple and compound depreciation" is
 * one sub-topic covering both, and requiring both words rejected a
 * 370,000-view video titled simply "Depreciation".
 */
const EXCLUSIVE_PAIRS: [string, string][] = [
  ['dependent', 'independent'],
  ['simple', 'compound'],
  ['linear', 'quadratic'],
  ['arithmetic', 'geometric'],
  ['sum', 'difference'],
  ['present', 'future'],
]

/** Discriminating terms this sub-topic names, which a title must also name. */
function requiredTerms(subTopic: string, subject: 'maths' | 'science' = SUBJECT): string[] {
  const tokens = tokenise(subTopic)
  const neutralised = new Set(
    EXCLUSIVE_PAIRS.filter(([a, b]) => tokens.includes(a) && tokens.includes(b)).flat()
  )
  // Compare on stems: CAPS writes "Tangents to circles" while the term list
  // holds "circle", and an exact match would silently drop the requirement.
  const stems = new Set(tokens.map(stem))
  const terms = subject === 'science' ? SCIENCE_DISCRIMINATING : MATHS_DISCRIMINATING
  return terms.filter((term) => stems.has(stem(term)) && !neutralised.has(term))
}

/** Pure form, so science rules are testable without re-reading argv. */
export function hasRequiredTermsFor(
  subject: 'maths' | 'science',
  subTopic: string,
  title: string,
  synonyms: Record<string, string[]> = SYNONYMS
): boolean {
  const haystack = ` ${fold(title.toLowerCase())} `
  const required = requiredTerms(subTopic, subject)
  if (required.length === 0) return true

  const matches = (term: string) =>
    [term, ...(synonyms[term] ?? [])].some((form) => containsTerm(haystack, form))

  // A comma means CAPS is listing alternatives - "Chemical bonding: covalent,
  // ionic and metallic" is three bond types, and no single video names all
  // three. Demanding every one of them left the whole sub-topic blank while
  // Kevinmathscience had a perfectly good ionic bonding lesson. One of the
  // listed concepts is enough; a sub-topic naming a single concept still has
  // to match it.
  return subTopic.includes(',') ? required.some(matches) : required.every(matches)
}

export function hasRequiredTerms(subTopic: string, title: string): boolean {
  return hasRequiredTermsFor(SUBJECT, subTopic, title)
}

/**
 * How well a video title matches the sub-topic it is meant to teach, 0-1.
 *
 * This exists because ranking by views alone picks the channel's most
 * popular video regardless of subject - a first run returned an
 * "adding fractions" video for "sum and difference of cubes".
 */
export function relevance(subTopic: string, title: string): number {
  const wanted = tokenise(subTopic)
  if (wanted.length === 0) return 0
  const haystack = ` ${fold(title.toLowerCase())} `

  const matched = wanted.filter((word) => {
    const forms = [word, ...(SYNONYMS[word] ?? [])]
    return forms.some((form) => containsTerm(haystack, form))
  })

  const raw = matched.length / wanted.length

  const required = requiredTerms(subTopic)

  // Backstop for short phrases that name no discriminating head noun: with
  // so few words, every one must land or the match is coincidental. Generic
  // form-nouns are exempt - CAPS writes "Box and whisker plots" where the
  // channel titles it "Box and whisker", and that is the same lesson.
  // A comma means CAPS is enumerating ("Lines, angles and triangles"), not
  // naming one precise concept, and no single video covers every item.
  // Looser than isEnumeratedList on purpose. Here any comma means CAPS is
  // enumerating and no one video covers every item ("Lines, angles and
  // triangles"), so partial matching is fine. Deciding whether a REQUIRED
  // concept may be dropped is a stricter question - see isEnumeratedList.
  const isEnumeration = subTopic.includes(',')
  // Either half of an exclusive pair standing alone still teaches the
  // sub-topic: "Independent events" is the lesson for "Dependent and
  // independent events".
  const paired = new Set(
    EXCLUSIVE_PAIRS.filter(([a, b]) => wanted.includes(a) && wanted.includes(b)).flat()
  )
  const mustMatch = wanted.filter(
    (word) => !GENERIC_NOUNS.has(stem(word)) && !paired.has(word)
  )
  if (
    required.length === 0 &&
    !isEnumeration &&
    wanted.length <= SHORT_PHRASE_WORDS &&
    mustMatch.some((word) => !matched.includes(word))
  ) {
    return 0
  }

  // CAPS phrases sub-topics verbosely ("Gradient of a line segment") while
  // channels title tersely ("Gradient formula"), which scored 0.33 and was
  // rejected by a hundredth. When every DISCRIMINATING term is present the
  // video is on-topic by definition, so floor the score rather than lose it.
  if (required.length > 0 && hasRequiredTerms(subTopic, title)) {
    return Math.max(raw, 0.5)
  }
  return raw
}

/**
 * At or below this many content words, a sub-topic is a precise phrase and
 * every word must appear in the title. Above it, partial matching is fine
 * because CAPS enumerates ("range, quartiles, percentiles") and no single
 * video names them all.
 */
const SHORT_PHRASE_WORDS = 3

/**
 * Words that name the form a topic is presented in rather than the concept.
 * They carry no discriminating power, so the short-phrase rule above does
 * not insist on them.
 */
const GENERIC_NOUNS = new Set(['plot', 'graph', 'problem', 'example', 'method', 'question'])

/** Below this, the video is about something else. */
const MIN_RELEVANCE = 0.3

/**
 * A video almost nobody has watched has not been validated by anyone, and
 * "most watched" is the brief. Below this we would rather report no pick
 * and search by hand.
 */
const MIN_VIEWS = IS_AFRIKAANS ? 150 : IS_SCIENCE ? 150 : 2000

/**
 * Relevance is a GATE, not the ranking. Once a video is on-topic, the brief
 * is "most watched" - so views lead, with a nudge for CAPS channels, a
 * penalty for length (mobile data), and only a small relevance tiebreak.
 *
 * Getting this wrong is subtle: weighting relevance heavily made a 27-view,
 * 52-minute video beat a 445,000-view, 5-minute one from Kevinmathscience,
 * purely because its title happened to contain the word "solving".
 */
/**
 * A walkthrough of past-paper questions, not a lesson. These rank well - they
 * are popular and their titles carry the topic words - but a student opening
 * a sub-topic for the first time wants to be taught it, not shown a memo.
 * Grade 11 Mechanics picked four of them in a row before this.
 *
 * A penalty rather than a filter: where no lesson exists, an exam
 * walkthrough still beats a blank.
 */
export function isExamWalkthrough(title: string): boolean {
  return EXAM_WALKTHROUGH.test(title)
}

const EXAM_WALKTHROUGH = /exam question|exam practice|past paper|\bmemo\b|question paper|revision question|exam paper|walkthrough/i

function scoreCandidate(c: Omit<Candidate, 'score'>, subTopic: string): number {
  const score =
    Math.log10(Math.max(c.views, 1)) * 10 +
    relevance(subTopic, c.title) * 15 +
    (c.saChannel ? 8 : 0) -
    (EXAM_WALKTHROUGH.test(c.title) ? 12 : 0) -
    (c.durationSeconds > PREFERRED_MAX_SECONDS ? 5 : 0) -
    (c.durationSeconds > 45 * 60 ? 5 : 0)
  return Math.round(score * 10) / 10
}

/**
 * Ranking within the CAPS channel set. Non-CAPS channels are excluded
 * entirely before this runs - see the CAPS_ONLY filter.
 */
function byTier(subTopic: string) {
  return (a: Omit<Candidate, 'score'>, b: Omit<Candidate, 'score'>): number => {
    if (a.saChannel !== b.saChannel) return a.saChannel ? -1 : 1
    return scoreCandidate(b, subTopic) - scoreCandidate(a, subTopic)
  }
}

function queriesFor(topic: CapsTopic, subTopic: string): string[] {
  if (IS_AFRIKAANS) return afrikaansQueries(subTopic, topic.grade, SUBJECT)
  const g = `grade ${topic.grade}`
  if (IS_SCIENCE) {
    // SA science channels title by subject name far more than maths ones do
    // ("Physical Sciences Grade 11: Snell's Law"), so the subject goes in.
    const terms = tokenise(subTopic).slice(0, 3).join(' ')
    return [
      `${subTopic} ${g} physical sciences caps`,
      `physical sciences ${g} ${terms}`,
      `${terms} ${g} south africa`,
      `kevinmathscience ${terms} ${g}`,
      `${topic.title} ${g} ${terms}`,
      `${subTopic} ${g}`,
    ]
  }
  // The distinctive words of the sub-topic, without the connectives -
  // CAPS channels title tersely ("Gradient formula"), so a long natural
  // phrase matches nothing. The first run missed a 286k-view
  // Kevinmathscience gradient video purely on query phrasing.
  const terms = tokenise(subTopic).slice(0, 3).join(' ')
  return [
    `${subTopic} ${g} maths south africa caps`,
    `${topic.title} ${g} ${terms}`,
    `${terms} ${g} maths`,
    `kevinmathscience ${terms} ${g}`,
    `miss martins ${terms} ${g}`,
    `${topic.title} ${g} ${subTopic}`,
  ]
}

async function curateSubTopic(
  topic: CapsTopic,
  subTopic: string,
  usedVideoIds: Set<string>
): Promise<CuratedSubTopic> {
  const queries = queriesFor(topic, subTopic)
  const seen = new Map<string, Omit<Candidate, 'embeddable' | 'score' | 'saChannel'>>()

  for (const query of queries) {
    for (const result of await searchYouTube(query)) {
      if (!seen.has(result.id)) seen.set(result.id, result)
    }
    await new Promise((r) => setTimeout(r, 700))
  }

  const gradeFilter = (allowAdjacent: boolean) => (v: { title: string }) =>
    allowAdjacent
      ? !wrongGrade(v.title, topic.grade) || adjacentGrade(v.title, topic.grade)
      : !wrongGrade(v.title, topic.grade)

  if (EXPLAIN) {
    const ranked = [...seen.values()].sort((a, b) => b.views - a.views).slice(0, 12)
    console.log(`\n  --- ${subTopic}: ${seen.size} candidates found`)
    for (const v of ranked) {
      const why: string[] = []
      if (!SA_CHANNELS.has(v.channel) && !(IS_AFRIKAANS && AFRIKAANS_CHANNELS.has(v.channel)))
        why.push('not-a-CAPS-channel')
      if (isMathsLit(v.title, v.channel)) why.push('maths-lit')
      if (isOtherSubject(v.title)) why.push('other-subject')
      if (isOtherMathsTopic(topic.slug, v.title)) why.push('other-topic')
      if (IS_SCIENCE && isWrongPaper(topic.paper, v.title)) why.push('wrong-paper')
      if (wrongGrade(v.title, topic.grade) && !adjacentGrade(v.title, topic.grade))
        why.push('wrong-grade')
      const rel = relevance(subTopic, v.title)
      if (rel < MIN_RELEVANCE) why.push(`relevance ${rel.toFixed(2)}`)
      else if (!hasRequiredTerms(subTopic, v.title)) why.push('missing-required-term')
      if (v.views < MIN_VIEWS) why.push(`views ${v.views}`)
      console.log(
        `      ${String(v.views).padStart(8)}  ${why.length ? 'reject: ' + why.join(', ') : '** would accept **'}`
      )
      console.log(`                ${v.title.slice(0, 74)}  [${v.channel}]`)
    }
  }

  const shortlist = (allowAdjacent: boolean) =>
    [...seen.values()]
      .filter((v) => Number.isFinite(v.durationSeconds) && v.durationSeconds > 0)
      .filter((v) => v.durationSeconds <= MAX_DURATION_SECONDS)
      .filter(gradeFilter(allowAdjacent))
      .filter((v) => !isMathsLit(v.title, v.channel))
      .filter((v) => !isOtherSubject(v.title))
      .filter((v) => !isSchoolTerm(subTopic, v.title))
      .filter((v) => !isOtherMathsTopic(topic.slug, v.title))
      .filter((v) => !(IS_SCIENCE && isWrongPaper(topic.paper, v.title)))
      .map((v) => {
        const saChannel = (IS_AFRIKAANS ? AFRIKAANS_CHANNELS : SA_CHANNELS).has(v.channel)
        return { ...v, saChannel, embeddable: false, score: 0 }
    })
    // A video whose title is about a different sub-topic is not a candidate,
    // however popular it is.
      .filter((v) => relevance(subTopic, v.title) >= MIN_RELEVANCE)
      .filter((v) => hasRequiredTerms(subTopic, v.title))
      .filter((v) => v.views >= MIN_VIEWS)
    // CAPS only. An excellent US or UK video teaches a different
    // curriculum with different notation and exam conventions; the client
    // would rather see a gap than a non-CAPS video (decision, 23 Sep 2026).
      .filter((v) => v.saChannel)
      .sort(byTier(subTopic))
      .slice(0, CANDIDATES_PER_SUBTOPIC * 3)

  const filtered = shortlist(false).length > 0 ? shortlist(false) : shortlist(true)
  const usedAdjacentGrade = shortlist(false).length === 0 && filtered.length > 0

  const candidates: Candidate[] = []
  for (const v of filtered) {
    if (candidates.length >= CANDIDATES_PER_SUBTOPIC) break
    // One video cannot teach two different sub-topics. If it was already
    // picked elsewhere, this sub-topic takes the runner-up instead.
    if (usedVideoIds.has(v.id)) continue
    if (!(await isEmbeddable(v.id))) continue
    candidates.push({ ...v, embeddable: true, score: scoreCandidate(v, subTopic) })
  }
  candidates.sort(byTier(subTopic))

  return {
    slug: topic.slug,
    topicTitle: topic.title,
    grade: topic.grade,
    paper: topic.paper,
    subTopic,
    queries,
    candidates,
    pick: candidates[0] ?? null,
    usedAdjacentGrade,
    note:
      candidates.length === 0
        ? 'No embeddable, on-topic CAPS candidate found - left blank for manual search'
        : undefined,
  }
}

/** Where a grade's picks live; science and Afrikaans each get their own file. */
function candidatesPath(grade: number): string {
  const subject = IS_SCIENCE ? 'sci-' : ''
  const lang = IS_AFRIKAANS ? 'af-' : ''
  return `docs/curriculum/candidates-${subject}${lang}gr${grade}.json`
}

async function main() {
  const args = process.argv.slice(2)
  const gradeArg = args[args.indexOf('--grade') + 1]
  const grade = parseInt(gradeArg, 10)
  if (![10, 11, 12].includes(grade)) {
    console.error(
      'Usage: npx tsx scripts/curate-videos.ts --grade <10|11|12> [--subject science] [--lang af] [--limit N]'
    )
    process.exit(1)
  }
  const limitIdx = args.indexOf('--limit')
  const limit = limitIdx >= 0 ? parseInt(args[limitIdx + 1], 10) : Infinity

  const curriculum: CapsTopic[] = IS_SCIENCE
    ? capsScienceCurriculum.map(({ slug, title, grade: g, paper, subTopics }) => ({
        slug,
        title,
        grade: g,
        paper,
        subTopics,
      }))
    : capsCurriculum
  const topics = curriculum.filter((t) => t.grade === grade)
  const units = topics.flatMap((topic) => topic.subTopics.map((subTopic) => ({ topic, subTopic })))
  const todo = units.slice(0, limit)

  console.log(
    `Curating ${IS_SCIENCE ? 'Physical Sciences' : 'Maths'} Grade ${grade}` +
      `${IS_AFRIKAANS ? ' (Afrikaans)' : ''}: ${todo.length} sub-topics across ${topics.length} topics\n`
  )

  const out: CuratedSubTopic[] = []
  // Seed with videos already curated for OTHER grades: one video cannot be
  // the lesson for a Grade 10 sub-topic and a Grade 11 one as well.
  const usedVideoIds = new Set<string>()
  for (const other of [10, 11, 12].filter((g) => g !== grade)) {
    const path = candidatesPath(other)
    if (!existsSync(path)) continue
    for (const entry of JSON.parse(readFileSync(path, 'utf8')) as CuratedSubTopic[]) {
      if (entry.pick) usedVideoIds.add(entry.pick.id)
    }
  }
  for (const [i, { topic, subTopic }] of todo.entries()) {
    const result = await curateSubTopic(topic, subTopic, usedVideoIds)
    if (result.pick) usedVideoIds.add(result.pick.id)
    out.push(result)
    const pick = result.pick
    console.log(
      `[${String(i + 1).padStart(2)}/${todo.length}] ${topic.title} — ${subTopic}\n` +
        (pick
          ? `      ${pick.id}  ${pick.duration.padStart(7)}  ${pick.viewsText.padStart(14)}  ${pick.channel}\n` +
            `      ${pick.title.slice(0, 90)}`
          : '      !! no candidate')
    )
  }

  mkdirSync('docs/curriculum', { recursive: true })
  const path = candidatesPath(grade)
  writeFileSync(path, JSON.stringify(out, null, 2))

  const withPick = out.filter((o) => o.pick).length
  const fromSa = out.filter((o) => o.pick?.saChannel).length

  const long = out.filter((o) => o.pick && o.pick.durationSeconds > PREFERRED_MAX_SECONDS)
  if (long.length > 0) {
    console.log('\nPicks over 20 minutes (data cost) - consider a shorter alternative:')
    long.forEach((o) => console.log(`  ${o.pick!.duration.padStart(7)}  ${o.subTopic}`))
  }
  const none = out.filter((o) => !o.pick)
  if (none.length > 0) {
    console.log('\nNo candidate found - needs a manual search:')
    none.forEach((o) => console.log(`  ${o.topicTitle} - ${o.subTopic}`))
  }
  console.log(
    `\nDone. ${withPick}/${out.length} sub-topics have a pick (${fromSa} from verified SA channels).`
  )
  console.log(`Written to ${path}`)
}

// Only run when invoked directly, so the scoring functions can be imported
// by tests and by scripts/apply-curated-videos.ts.
if (process.argv[1]?.endsWith('curate-videos.ts')) {
  main().catch((error) => {
    console.error(error)
    process.exit(1)
  })
}
