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

export const MARKER =
  '// PROVISIONAL video picks — auto-filled 2026-09-18 from docs/client-updates/video-candidates; client to confirm.'

// The fixed closing sequence of every single-section stub file: end of `blocks`,
// `sections[0]`, `sections`, and the TopicContent object itself.
export const TAIL = '      ]\n    }\n  ]\n}\n'

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

export function buildRegion(enPicks: VideoCandidate[], afPick: AfrikaansPick | null): string {
  const blocks = enPicks.map((video, index) => buildVideoBlock(video, index === 0 ? afPick : null))
  return [`        ${MARKER}`, blocks.join(',\n')].join('\n')
}

const VIDEO_BLOCK_START_RE = /\n {8}\{\n {10}type: 'video',/g
const VIDEO_TYPE_MARKER = "type: 'video'"
const NEXT_BLOCK_RE = /^,\n {8}\{/

/**
 * Returns the index right after the `}` that closes the object literal opened at
 * `openBraceIndex`, counting nested `{`/`}` and skipping over string literals (single,
 * double, or backtick quoted, respecting backslash escapes) so a brace embedded in a
 * video title (e.g. from a YouTube title) can't desync the depth count.
 */
function findMatchingBraceEnd(text: string, openBraceIndex: number, filePath: string): number {
  let depth = 0
  let i = openBraceIndex

  while (i < text.length) {
    const ch = text[i]

    if (ch === "'" || ch === '"' || ch === '`') {
      const quote = ch
      i++
      while (i < text.length && text[i] !== quote) {
        i += text[i] === '\\' ? 2 : 1
      }
      i++
      continue
    }

    if (ch === '{') {
      depth++
    } else if (ch === '}') {
      depth--
      if (depth === 0) {
        return i + 1
      }
    }

    i++
  }

  throw new Error(`Unbalanced braces while scanning a video block in ${filePath}`)
}

/**
 * Determines the end of the video block region structurally: brace-depth-matches the
 * first block object starting at or after `regionStart`, then keeps extending across any
 * further blocks that immediately follow (comma-separated) and are themselves video
 * blocks — stopping as soon as a following block isn't (e.g. an `example` block that
 * happens to sit right after), which must be preserved untouched rather than swallowed.
 * Throws (naming the file) if the first detected block isn't a video block at all.
 */
function findRegionEnd(text: string, regionStart: number, filePath: string): number {
  const firstBraceIdx = text.indexOf('{', regionStart)
  if (firstBraceIdx === -1) {
    throw new Error(`Could not find an opening brace for the video block region in ${filePath}`)
  }

  let blockEnd = findMatchingBraceEnd(text, firstBraceIdx, filePath)
  const firstBlockText = text.slice(firstBraceIdx, blockEnd)
  if (!firstBlockText.includes(VIDEO_TYPE_MARKER)) {
    throw new Error(
      `Expected a video block at the detected region start in ${filePath}, got: ${firstBlockText.slice(0, 120)}`
    )
  }

  for (;;) {
    const nextBlockMatch = NEXT_BLOCK_RE.exec(text.slice(blockEnd))
    if (!nextBlockMatch) break

    const nextBraceIdx = blockEnd + nextBlockMatch[0].length - 1
    const nextBlockEnd = findMatchingBraceEnd(text, nextBraceIdx, filePath)
    const nextBlockText = text.slice(nextBraceIdx, nextBlockEnd)

    if (!nextBlockText.includes(VIDEO_TYPE_MARKER)) {
      // Not part of the generated region (e.g. an unrelated `example` block that
      // happens to immediately follow) — leave it untouched.
      break
    }

    blockEnd = nextBlockEnd
  }

  return blockEnd
}

/**
 * Replaces the video block region of a stub file's content with `region`, handling all
 * three states a file can be in: never filled (single placeholder block), already
 * filled by a previous run (marker present, replace in place), or missing a video block
 * entirely (append as new elements). Any content between the video block region and the
 * closing structure (e.g. a // TODO(curator) comment, or an unrelated block) is
 * preserved untouched.
 */
export function replaceVideoRegion(filePath: string, content: string, region: string): string {
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

  const regionEnd = findRegionEnd(before, regionStart, filePath)
  const oldRegionText = before.slice(regionStart, regionEnd)
  if (!oldRegionText.includes(VIDEO_TYPE_MARKER)) {
    throw new Error(`Refusing to replace non-video content in ${filePath}: ${oldRegionText.slice(0, 120)}`)
  }

  const trailingContent = before.slice(regionEnd)

  return before.slice(0, regionStart) + region + trailingContent + after
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

// Only run when executed directly (`npx tsx scripts/fill-provisional-videos.ts`), not when
// imported by a test — importing must not touch real content files.
const isMainModule = process.argv[1] !== undefined && import.meta.url === `file://${process.argv[1]}`
if (isMainModule) {
  main()
}
