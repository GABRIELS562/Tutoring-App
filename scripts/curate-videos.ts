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

function gradesNamedIn(title: string): number[] {
  return [...title.matchAll(/\bgr(?:ade)?\s*\.?\s*(\d{1,2})\b/gi)].map((m) => parseInt(m[1], 10))
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
  return /maths?\s*lit|mathematical literacy|geletterdheid/i.test(`${title} ${channel}`)
}

/**
 * Many CAPS channels teach Maths AND Physical Sciences, so a physics video
 * can match a maths sub-topic on a shared word - "The general term Tn"
 * matched "Grade 11 Physical Sciences Term 2 topics", and "parallel and
 * perpendicular lines" matched a vectors video about perpendicular
 * components. This is a maths curriculum; those are a different subject.
 */
export function isOtherSubject(title: string): boolean {
  return /physical science|physics|chemistry|chemical|life science|biology|geography|accounting|economics|business studies|vectors? in 2d|newton/i.test(
    title
  )
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
])

/** Maths synonyms, so a title using different wording still matches. */
const SYNONYMS: Record<string, string[]> = {
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

/** Crude singular/plural fold - "parallelograms" should match "Parallelogram". */
function stem(word: string): string {
  return word.endsWith('ies') ? word.slice(0, -3) + 'y' : word.replace(/s$/, '')
}

/** Does `haystack` contain `word` in either singular or plural form? */
function containsTerm(haystack: string, word: string): boolean {
  const root = stem(word)
  return haystack.includes(root) || haystack.includes(word)
}

function tokenise(text: string): string[] {
  const lower = text.toLowerCase().replace(/[^a-z0-9²√\s-]/g, ' ')
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
const DISCRIMINATING = [
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
  'simultaneous', 'pythagoras', 'infinity', 'circle', 'cubic',
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
  ['simple', 'compound'],
  ['linear', 'quadratic'],
  ['arithmetic', 'geometric'],
  ['sum', 'difference'],
  ['present', 'future'],
]

/** Discriminating terms this sub-topic names, which a title must also name. */
function requiredTerms(subTopic: string): string[] {
  const tokens = tokenise(subTopic)
  const neutralised = new Set(
    EXCLUSIVE_PAIRS.filter(([a, b]) => tokens.includes(a) && tokens.includes(b)).flat()
  )
  // Compare on stems: CAPS writes "Tangents to circles" while the term list
  // holds "circle", and an exact match would silently drop the requirement.
  const stems = new Set(tokens.map(stem))
  return DISCRIMINATING.filter((term) => stems.has(stem(term)) && !neutralised.has(term))
}

export function hasRequiredTerms(subTopic: string, title: string): boolean {
  const haystack = ` ${title.toLowerCase()} `
  return requiredTerms(subTopic).every((term) =>
    [term, ...(SYNONYMS[term] ?? [])].some((form) => containsTerm(haystack, form))
  )
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
  const haystack = ` ${title.toLowerCase()} `

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
  const mustMatch = wanted.filter((word) => !GENERIC_NOUNS.has(stem(word)))
  if (
    required.length === 0 &&
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
const MIN_VIEWS = 2000

/**
 * Relevance is a GATE, not the ranking. Once a video is on-topic, the brief
 * is "most watched" - so views lead, with a nudge for CAPS channels, a
 * penalty for length (mobile data), and only a small relevance tiebreak.
 *
 * Getting this wrong is subtle: weighting relevance heavily made a 27-view,
 * 52-minute video beat a 445,000-view, 5-minute one from Kevinmathscience,
 * purely because its title happened to contain the word "solving".
 */
function scoreCandidate(c: Omit<Candidate, 'score'>, subTopic: string): number {
  const score =
    Math.log10(Math.max(c.views, 1)) * 10 +
    relevance(subTopic, c.title) * 15 +
    (c.saChannel ? 8 : 0) -
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
  const g = `grade ${topic.grade}`
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

  const shortlist = (allowAdjacent: boolean) =>
    [...seen.values()]
      .filter((v) => Number.isFinite(v.durationSeconds) && v.durationSeconds > 0)
      .filter((v) => v.durationSeconds <= MAX_DURATION_SECONDS)
      .filter(gradeFilter(allowAdjacent))
      .filter((v) => !isMathsLit(v.title, v.channel))
      .filter((v) => !isOtherSubject(v.title))
      .filter((v) => !isSchoolTerm(subTopic, v.title))
      .map((v) => {
        const saChannel = SA_CHANNELS.has(v.channel)
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

async function main() {
  const args = process.argv.slice(2)
  const gradeArg = args[args.indexOf('--grade') + 1]
  const grade = parseInt(gradeArg, 10)
  if (![10, 11, 12].includes(grade)) {
    console.error('Usage: npx tsx scripts/curate-videos.ts --grade <10|11|12> [--limit N]')
    process.exit(1)
  }
  const limitIdx = args.indexOf('--limit')
  const limit = limitIdx >= 0 ? parseInt(args[limitIdx + 1], 10) : Infinity

  const topics = capsCurriculum.filter((t) => t.grade === grade)
  const units = topics.flatMap((topic) => topic.subTopics.map((subTopic) => ({ topic, subTopic })))
  const todo = units.slice(0, limit)

  console.log(`Curating Grade ${grade}: ${todo.length} sub-topics across ${topics.length} topics\n`)

  const out: CuratedSubTopic[] = []
  // Seed with videos already curated for OTHER grades: one video cannot be
  // the lesson for a Grade 10 sub-topic and a Grade 11 one as well.
  const usedVideoIds = new Set<string>()
  for (const other of [10, 11, 12].filter((g) => g !== grade)) {
    const path = `docs/curriculum/candidates-gr${other}.json`
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
  const path = `docs/curriculum/candidates-gr${grade}.json`
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
