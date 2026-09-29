/**
 * Gives every Afrikaans video its own Afrikaans caption.
 *
 * `NoteBlock.tsx` already picks `titleAf` over `title` for an Afrikaans
 * reader, and 144 video blocks already carry a separate Afrikaans video in
 * `videoIdAf` - but not one of the 218 video blocks had a `titleAf`. So an
 * Afrikaans student watched an Afrikaans video under a caption reading
 * "Watch: Grade 10 Transverse Pulses and the Principle of Superposition
 * — Kevinmathscience".
 *
 * The caption is not invented here: it is the Afrikaans video's own
 * YouTube title, read from the oEmbed endpoint that check-videos.ts
 * already uses, in the same `<prefix>: <title> — <channel>` shape as the
 * English one.
 *
 * Blocks with no `videoIdAf` are left alone: the video an Afrikaans reader
 * gets there IS the English one, so an English caption describes it
 * correctly.
 *
 * Idempotent - a block that already has a `titleAf` is skipped, so this is
 * safe to re-run when new videos are curated.
 *
 *   npx tsx scripts/caption-af-videos.ts          # writes
 *   npx tsx scripts/caption-af-videos.ts --dry    # reports only
 */
import { readFileSync, writeFileSync } from 'node:fs'
import { readdirSync, statSync } from 'node:fs'
import path from 'node:path'

const ROOT = path.resolve(__dirname, '..')
const CONTENT_DIR = path.join(ROOT, 'src', 'content')
const OEMBED_URL = 'https://www.youtube.com/oembed'
const REQUEST_TIMEOUT_MS = 15000
/** "Watch:" in Afrikaans, matching the English captions' shape. */
const AF_PREFIX = 'Kyk'

const dryRun = process.argv.includes('--dry')

function contentFiles(dir: string): string[] {
  const out: string[] = []
  for (const entry of readdirSync(dir)) {
    const full = path.join(dir, entry)
    if (statSync(full).isDirectory()) {
      if (entry === '__tests__') continue
      out.push(...contentFiles(full))
    } else if (entry.endsWith('.ts')) {
      out.push(full)
    }
  }
  return out
}

async function youtubeTitle(id: string): Promise<{ title: string; author: string } | null> {
  const url = `${OEMBED_URL}?format=json&url=${encodeURIComponent(
    `https://www.youtube.com/watch?v=${id}`
  )}`
  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS)
  try {
    const res = await fetch(url, { signal: controller.signal })
    if (!res.ok) return null
    const data = (await res.json()) as { title?: string; author_name?: string }
    if (!data.title) return null
    return { title: data.title, author: data.author_name ?? '' }
  } catch {
    return null
  } finally {
    clearTimeout(timeout)
  }
}

/** The literal, with single quotes escaped the way the content files do. */
function tsLiteral(value: string): string {
  return `'${value.replace(/\\/g, '\\\\').replace(/'/g, "\\'")}'`
}

async function main(): Promise<void> {
  const files = contentFiles(CONTENT_DIR)
  let added = 0
  let skipped = 0
  let failed = 0

  for (const file of files) {
    const original = readFileSync(file, 'utf-8')
    const lines = original.split('\n')
    const out: string[] = []

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i]
      out.push(line)

      const match = line.match(/^(\s*)videoIdAf:\s*'([A-Za-z0-9_-]+)'(,?)\s*$/)
      if (!match) continue

      const [, indent, afId] = match

      // Only THIS block counts. A fixed lookback window caught the
      // titleAf of the enclosing section (TopicSection has one too) and
      // of the previous block, and reported 141 of 144 as already done.
      // Scan back to this block's own `type: 'video'` line instead.
      let start = -1
      for (let j = i; j >= 0 && i - j < 12; j--) {
        if (/type:\s*'video'/.test(lines[j])) { start = j; break }
      }
      if (start === -1) {
        console.warn(`  no video block found above ${afId} (${path.relative(ROOT, file)})`)
        failed++
        continue
      }
      if (lines.slice(start, i + 1).some((l) => /titleAf:/.test(l))) {
        skipped++
        continue
      }

      const meta = await youtubeTitle(afId)
      if (!meta) {
        console.warn(`  could not read title for ${afId} (${path.relative(ROOT, file)})`)
        failed++
        continue
      }

      const caption = meta.author
        ? `${AF_PREFIX}: ${meta.title} — ${meta.author}`
        : `${AF_PREFIX}: ${meta.title}`

      // videoIdAf is the last property in these blocks, so a trailing
      // comma has to be added to it before appending another one.
      if (!match[3]) out[out.length - 1] = `${indent}videoIdAf: '${afId}',`
      out.push(`${indent}titleAf: ${tsLiteral(caption)}`)
      added++
    }

    const updated = out.join('\n')
    if (updated !== original && !dryRun) {
      writeFileSync(file, updated, 'utf-8')
    }
  }

  console.log(
    `${dryRun ? '[dry run] ' : ''}captions added: ${added}, already present: ${skipped}, unreadable: ${failed}`
  )
  if (failed > 0) process.exitCode = 1
}

main()
