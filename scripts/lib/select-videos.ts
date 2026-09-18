/**
 * Pure selection logic for the provisional video fill (scripts/fill-provisional-videos.ts).
 * Kept dependency-free (no fs/path) so it can be unit tested directly.
 */

export interface VideoCandidate {
  id: string
  title: string
  channel: string
  views: string
  dur: string
  embeddable: boolean
}

// Skip anything longer than this — almost certainly a full lesson/stream, not a topic clip.
const MAX_DURATION_SECONDS = 2 * 60 * 60

// A video at or under this length is preferred as the "quick explainer" pick.
const SHORT_DURATION_SECONDS = 15 * 60

const DEFAULT_MAX_PICKS = 2

const EXAM_STYLE_TITLE_RE = /exam|question|past paper|practice/i

/**
 * Parses a "mm:ss" or "h:mm:ss" duration string (as used in the video-candidates JSON)
 * into total seconds. Returns +Infinity for anything unparseable so it is filtered out
 * rather than accidentally selected.
 */
export function parseDuration(dur: string): number {
  const parts = dur.split(':').map((part) => Number.parseInt(part, 10))

  if (parts.length === 0 || parts.some((part) => Number.isNaN(part))) {
    return Number.POSITIVE_INFINITY
  }

  return parts.reduce((totalSeconds, part) => totalSeconds * 60 + part, 0)
}

function isEligible(video: VideoCandidate): boolean {
  return video.embeddable && parseDuration(video.dur) <= MAX_DURATION_SECONDS
}

function isExamStyle(video: VideoCandidate): boolean {
  return EXAM_STYLE_TITLE_RE.test(video.title)
}

/**
 * Chooses up to `maxPicks` candidates for a topic: embeddable only, skipping anything
 * over 2 hours, preferring one short (<=15 min) explainer and one exam-question-style
 * video when both are available, then filling any remaining slots in candidate order.
 */
export function selectVideosForTopic(
  candidates: VideoCandidate[],
  maxPicks: number = DEFAULT_MAX_PICKS
): VideoCandidate[] {
  const eligible = candidates.filter(isEligible)
  if (eligible.length === 0) {
    return []
  }

  const picks: VideoCandidate[] = []

  const shortPick = eligible.find((video) => parseDuration(video.dur) <= SHORT_DURATION_SECONDS)
  if (shortPick) {
    picks.push(shortPick)
  }

  if (picks.length < maxPicks) {
    const examPick = eligible.find((video) => isExamStyle(video) && !picks.includes(video))
    if (examPick) {
      picks.push(examPick)
    }
  }

  for (const video of eligible) {
    if (picks.length >= maxPicks) break
    if (!picks.includes(video)) {
      picks.push(video)
    }
  }

  return picks.slice(0, maxPicks)
}

/**
 * Chooses a single Afrikaans candidate for a topic (top eligible pick), or null when
 * no embeddable Afrikaans video exists — callers should leave videoIdAf unset in that case.
 */
export function selectAfrikaansVideo(candidates: VideoCandidate[]): VideoCandidate | null {
  const eligible = candidates.filter(isEligible)
  return eligible[0] ?? null
}

export type AfrikaansPick = Pick<VideoCandidate, 'id' | 'title' | 'channel'>

/**
 * A manual correction for one topic's Afrikaans pick: either a replacement video, or
 * `null` to force "no Afrikaans video" even when the automatic selection would have
 * picked one. Distinct from "not in this map", which falls through to selectAfrikaansVideo.
 */
export type AfOverride = AfrikaansPick | null

/**
 * The video-candidates JSON is built from unfiltered YouTube search results, so a
 * handful of Afrikaans "matches" are off-topic (channel study-tips clips, wrong
 * subject) rather than genuinely embeddable-and-relevant. Curated corrections live
 * here — see docs/client-updates/2026-09-17-status-and-video-shortlist.html#afrikaans
 * for the source list and reasoning.
 */
export const AF_OVERRIDES: Record<string, AfOverride> = {
  // 0pf1ilcCd2c is a general "how to study" clip, not Mechanics content.
  'science-10-Mechanics': null,
  // 4r76JWyXLnw is the same general "how to study" clip, not Waves and Sound content.
  'science-11-Waves and Sound': null,
  // 0pf1ilcCd2c (the "how to study" clip again) was the top pick; this is the real topic video.
  'science-10-Matter and Materials': {
    id: '_Ad0WdFmEsY',
    title: 'Gr 10 Chemie fisiese en chemiese verandering',
    channel: 'Danike Aucamp',
  },
  // OEZNES1qBuE is Wiskunde Geletterdheid (Maths Literacy), not Mathematics Finance and Growth.
  'maths-10-Finance and Growth': {
    id: 'T7zTTrn1ulE',
    title: 'Graad 10 enkelvoudige en saamgestelde rente',
    channel: 'Rochelle Van der Merwe',
  },
  // _Rc6KZtQtVM is a Euclidean Geometry video, not Analytical Geometry.
  'maths-11-Analytical Geometry': {
    id: 'kwLfg5jJ2eI',
    title: 'Graad 11 Analitiese Meetkunde #6: Ewewydige (Parallele) Lyne',
    channel: 'WiskundeMetMargie',
  },
}

export function afOverrideKey(subject: string, grade: number, topic: string): string {
  return `${subject}-${grade}-${topic}`
}

/**
 * Resolves the Afrikaans pick for one topic: an `overrides` entry takes precedence
 * (including a `null` override, which forces "no Afrikaans video"); otherwise falls
 * back to the automatic selectAfrikaansVideo logic over the raw candidates.
 *
 * `overrides` defaults to the real curated AF_OVERRIDES map; tests pass their own map
 * instead of mutating the shared one.
 */
export function resolveAfrikaansPick(
  subject: string,
  grade: number,
  topic: string,
  candidates: VideoCandidate[],
  overrides: Readonly<Record<string, AfOverride>> = AF_OVERRIDES
): AfrikaansPick | null {
  const key = afOverrideKey(subject, grade, topic)
  if (Object.prototype.hasOwnProperty.call(overrides, key)) {
    return overrides[key]
  }

  const picked = selectAfrikaansVideo(candidates)
  return picked ? { id: picked.id, title: picked.title, channel: picked.channel } : null
}
