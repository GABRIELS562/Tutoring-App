/**
 * Provisional video fill (Phase 3, task 3.2).
 *
 * Reads the curated, embed-checked candidates in
 * docs/client-updates/video-candidates/{english,afrikaans}.json and rewrites every stub
 * topic's single placeholder `video` block into 2 real video blocks (top English picks),
 * with the Afrikaans id/title set on the first block where an embeddable Afrikaans
 * candidate exists.
 *
 * Idempotent: re-running replaces the previously-generated PROVISIONAL block region
 * (detected by the marker comment below) instead of duplicating it. Only the video
 * block region of each file is touched — everything else is preserved byte-for-byte.
 *
 * Usage: npx tsx scripts/fill-provisional-videos.ts
 */

import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { selectVideosForTopic, resolveAfrikaansPick, type VideoCandidate, type AfrikaansPick } from './lib/select-videos'

const SCRIPT_DIR = path.dirname(fileURLToPath(import.meta.url))
const ROOT = path.resolve(SCRIPT_DIR, '..')

const CONTENT_DIRS = [path.join(ROOT, 'src/content/maths'), path.join(ROOT, 'src/content/science')]

const EN_CANDIDATES_PATH = path.join(ROOT, 'docs/client-updates/video-candidates/english.json')
const AF_CANDIDATES_PATH = path.join(ROOT, 'docs/client-updates/video-candidates/afrikaans.json')

const MARKER =
  '// PROVISIONAL video picks — auto-filled 2026-09-18 from docs/client-updates/video-candidates; client to confirm.'

// The fixed closing sequence of every single-section stub file: end of `blocks`,
// `sections[0]`, `sections`, and the TopicContent object itself.
const TAIL = '      ]\n    }\n  ]\n}\n'

const STUB_SECTION_ID = 'coming-soon'

type TopicVideoSet = {
  subject: string
  grade: number
  topic: string
  videos: VideoCandidate[]
}

type MatchedRow = {
  file: string
  subject: string
  grade: number
  title: string
  enPicks: VideoCandidate[]
  afPick: AfrikaansPick | null
  status: 'updated' | 'unchanged' | 'skipped'
  reason?: string
}

function loadCandidates(filePath: string): TopicVideoSet[] {
  const raw = fs.readFileSync(filePath, 'utf8')
  const parsed: unknown = JSON.parse(raw)
  if (!Array.isArray(parsed)) {
    throw new Error(`Expected an array in ${filePath}`)
  }
  return parsed as TopicVideoSet[]
}

function findStubFiles(): string[] {
  const files: string[] = []
  for (const dir of CONTENT_DIRS) {
    for (const gradeDirName of fs.readdirSync(dir)) {
      const gradeDir = path.join(dir, gradeDirName)
      if (!fs.statSync(gradeDir).isDirectory()) continue
      for (const fileName of fs.readdirSync(gradeDir)) {
        if (fileName.endsWith('.ts')) {
          files.push(path.join(gradeDir, fileName))
        }
      }
    }
  }
  return files.sort()
}

function extractTopLevelString(content: string, field: string): string | null {
  // Matches `  field: '...'` or `  field: "...'"` (a straight apostrophe forces double quotes,
  // e.g. title: "Newton's Laws").
  const re = new RegExp(`\\n {2}${field}: (['"])((?:\\\\.|(?!\\1).)*)\\1,`)
  const match = content.match(re)
  return match ? match[2] : null
}

function extractGrade(content: string): number | null {
  const match = content.match(/\n {2}grade: (\d+),/)
  return match ? Number(match[1]) : null
}

function extractFirstSectionId(content: string): string | null {
  const match = content.match(/sections:\s*\[\s*\{\s*id:\s*'([^']*)'/)
  return match ? match[1] : null
}

/** Escapes a value for embedding in a single-quoted TS string literal. */
function toSingleQuotedLiteral(value: string): string {
  const escaped = value.replace(/\\/g, '\\\\').replace(/'/g, "\\'")
  return `'${escaped}'`
}

function buildVideoTitle(video: Pick<VideoCandidate, 'title' | 'channel'>): string {
  return `Watch: ${video.title} — ${video.channel}`
}

function buildVideoBlock(video: VideoCandidate, afPick: AfrikaansPick | null): string {
  const lines = [
    '        {',
    `          type: 'video',`,
    `          title: ${toSingleQuotedLiteral(buildVideoTitle(video))},`,
  ]

  if (afPick) {
    lines.push(`          videoId: ${toSingleQuotedLiteral(video.id)},`)
    lines.push(`          videoIdAf: ${toSingleQuotedLiteral(afPick.id)},`)
    lines.push(`          titleAf: ${toSingleQuotedLiteral(buildVideoTitle(afPick))}`)
  } else {
    lines.push(`          videoId: ${toSingleQuotedLiteral(video.id)}`)
  }

  lines.push('        }')
  return lines.join('\n')
}

function buildRegion(enPicks: VideoCandidate[], afPick: AfrikaansPick | null): string {
  const blocks = enPicks.map((video, index) => buildVideoBlock(video, index === 0 ? afPick : null))
  return [`        ${MARKER}`, blocks.join(',\n')].join('\n')
}

const VIDEO_BLOCK_START_RE = /\n {8}\{\n {10}type: 'video',/g
const CLOSING_BRACE_RE = /\n {8}\}/g

/** Position right after the last `        }` (an 8-space-indented closing brace) at or
 * after `fromIndex`, or null if none exists. Used to find where the video block region
 * actually ends, so trailing content after it (e.g. a // TODO(curator) comment added by
 * a later pass) is preserved rather than swallowed by the replacement. */
function findRegionEnd(text: string, fromIndex: number): number | null {
  CLOSING_BRACE_RE.lastIndex = fromIndex
  let lastEnd: number | null = null
  let match: RegExpExecArray | null
  while ((match = CLOSING_BRACE_RE.exec(text)) !== null) {
    lastEnd = match.index + match[0].length
  }
  return lastEnd
}

/**
 * Replaces the video block region of a stub file's content with `region`, handling all
 * three states a file can be in: never filled (single placeholder block), already
 * filled by a previous run (marker present, replace in place), or missing a video block
 * entirely (append as new elements). Any content between the video block region and the
 * closing structure (e.g. a // TODO(curator) comment) is preserved untouched.
 */
function replaceVideoRegion(filePath: string, content: string, region: string): string {
  const tailIdx = content.lastIndexOf(`\n${TAIL}`)
  if (tailIdx === -1) {
    throw new Error(`Could not locate the expected closing structure in ${filePath}`)
  }

  const before = content.slice(0, tailIdx)
  const after = content.slice(tailIdx)

  const markerIdx = before.indexOf(MARKER)
  let regionStart = -1

  if (markerIdx !== -1) {
    regionStart = before.lastIndexOf('\n', markerIdx) + 1
  } else {
    let lastVideoBlockIdx = -1
    let match: RegExpExecArray | null
    VIDEO_BLOCK_START_RE.lastIndex = 0
    while ((match = VIDEO_BLOCK_START_RE.exec(before)) !== null) {
      lastVideoBlockIdx = match.index
    }
    if (lastVideoBlockIdx !== -1) {
      regionStart = lastVideoBlockIdx + 1 // skip the leading \n
    }
  }

  if (regionStart === -1) {
    // No video block exists at all (e.g. maths/grade12/probability.ts) — append as new
    // elements after the current last block, adding the trailing comma it's missing.
    return `${before},\n${region}${after}`
  }

  const regionEnd = findRegionEnd(before, regionStart) ?? before.length
  const trailingComment = before.slice(regionEnd)

  return before.slice(0, regionStart) + region + trailingComment + after
}

function summarizeEn(picks: VideoCandidate[]): string {
  if (picks.length === 0) return 'none'
  return picks.map((v) => `${v.id} (${v.channel}, ${v.dur})`).join('; ')
}

function summarizeAf(pick: AfrikaansPick | null): string {
  return pick ? `${pick.id} (${pick.channel})` : 'none'
}

function printSummaryTable(rows: MatchedRow[]): void {
  const header = ['Topic', 'File', 'EN picks', 'AF pick', 'Status']
  const lines = rows.map((row) => [
    `${row.title} (${row.subject} gr${row.grade})`,
    path.relative(ROOT, row.file),
    row.status === 'skipped' ? '-' : summarizeEn(row.enPicks),
    row.status === 'skipped' ? '-' : summarizeAf(row.afPick),
    row.status === 'skipped' ? `skipped: ${row.reason}` : row.status,
  ])

  const widths = header.map((h, i) => Math.max(h.length, ...lines.map((l) => l[i].length)))
  const printRow = (cells: string[]) =>
    console.log(cells.map((c, i) => c.padEnd(widths[i])).join('  |  '))

  printRow(header)
  printRow(widths.map((w) => '-'.repeat(w)))
  for (const line of lines) {
    printRow(line)
  }
}

function main(): void {
  const enCandidates = loadCandidates(EN_CANDIDATES_PATH)
  const afCandidates = loadCandidates(AF_CANDIDATES_PATH)

  const findCandidateSet = (
    sets: TopicVideoSet[],
    subject: string,
    grade: number,
    title: string
  ): TopicVideoSet | undefined =>
    sets.find((s) => s.subject === subject && s.grade === grade && s.topic === title)

  const stubFiles = findStubFiles()
  const rows: MatchedRow[] = []

  for (const file of stubFiles) {
    const content = fs.readFileSync(file, 'utf8')

    const sectionId = extractFirstSectionId(content)
    if (sectionId !== STUB_SECTION_ID) {
      // Finished topic (e.g. the trigonometry gr11 reference) — leave untouched.
      continue
    }

    const subject = extractTopLevelString(content, 'subject')
    const title = extractTopLevelString(content, 'title')
    const grade = extractGrade(content)

    if (!subject || !title || grade === null) {
      rows.push({
        file,
        subject: subject ?? '?',
        grade: grade ?? 0,
        title: title ?? '?',
        enPicks: [],
        afPick: null,
        status: 'skipped',
        reason: 'could not parse subject/grade/title',
      })
      continue
    }

    const enSet = findCandidateSet(enCandidates, subject, grade, title)
    if (!enSet) {
      rows.push({
        file,
        subject,
        grade,
        title,
        enPicks: [],
        afPick: null,
        status: 'skipped',
        reason: 'no matching entry in english.json',
      })
      continue
    }

    const afSet = findCandidateSet(afCandidates, subject, grade, title)

    const enPicks = selectVideosForTopic(enSet.videos)
    const afPick = resolveAfrikaansPick(subject, grade, title, afSet?.videos ?? [])

    if (enPicks.length === 0) {
      rows.push({
        file,
        subject,
        grade,
        title,
        enPicks: [],
        afPick: null,
        status: 'skipped',
        reason: 'no embeddable English candidate under 2h',
      })
      continue
    }

    const region = buildRegion(enPicks, afPick)
    const nextContent = replaceVideoRegion(file, content, region)

    if (nextContent === content) {
      rows.push({ file, subject, grade, title, enPicks, afPick, status: 'unchanged' })
      continue
    }

    fs.writeFileSync(file, nextContent, 'utf8')
    rows.push({ file, subject, grade, title, enPicks, afPick, status: 'updated' })
  }

  printSummaryTable(rows)

  const skipped = rows.filter((r) => r.status === 'skipped')
  if (skipped.length > 0) {
    console.log(`\n${skipped.length} topic(s) skipped — see "skipped" rows above.`)
  }
  console.log(`\n${rows.filter((r) => r.status === 'updated').length} file(s) updated.`)
}

main()
