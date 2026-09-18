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
