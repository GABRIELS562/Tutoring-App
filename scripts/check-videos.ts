/**
 * Checks every `videoId`/`videoIdAf` referenced under src/content/** against the YouTube
 * oEmbed endpoint. A 401/404 means the video is blocked from embedding or has been
 * removed. Exits non-zero if any check fails, so it can gate CI / a scheduled workflow.
 *
 * Usage: npx tsx scripts/check-videos.ts
 */

import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const SCRIPT_DIR = path.dirname(fileURLToPath(import.meta.url))
const ROOT = path.resolve(SCRIPT_DIR, '..')
const CONTENT_DIR = path.join(ROOT, 'src/content')

const OEMBED_URL = 'https://www.youtube.com/oembed'
const REQUEST_TIMEOUT_MS = 10_000

type Reference = {
  id: string
  field: 'videoId' | 'videoIdAf'
  file: string
}

type CheckResult = {
  id: string
  ok: boolean
  detail: string
  referencedIn: string[]
}

function findContentFiles(dir: string): string[] {
  const files: string[] = []
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const fullPath = path.join(dir, entry.name)
    if (entry.isDirectory()) {
      files.push(...findContentFiles(fullPath))
    } else if (entry.isFile() && entry.name.endsWith('.ts')) {
      files.push(fullPath)
    }
  }
  return files
}

function extractReferences(files: string[]): Reference[] {
  const refs: Reference[] = []
  const re = /(videoId|videoIdAf):\s*'([^']+)'/g

  for (const file of files) {
    const content = fs.readFileSync(file, 'utf8')
    let match: RegExpExecArray | null
    re.lastIndex = 0
    while ((match = re.exec(content)) !== null) {
      const [, field, id] = match
      refs.push({ id, field: field as Reference['field'], file: path.relative(ROOT, file) })
    }
  }
  return refs
}

async function checkVideo(id: string): Promise<{ ok: boolean; detail: string }> {
  const url = `${OEMBED_URL}?format=json&url=${encodeURIComponent(`https://www.youtube.com/watch?v=${id}`)}`
  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS)

  try {
    const res = await fetch(url, { signal: controller.signal })
    if (res.status === 401 || res.status === 404) {
      return { ok: false, detail: `blocked or removed (HTTP ${res.status})` }
    }
    if (!res.ok) {
      return { ok: false, detail: `unexpected HTTP ${res.status}` }
    }
    return { ok: true, detail: 'ok' }
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'unknown error'
    return { ok: false, detail: `request failed: ${message}` }
  } finally {
    clearTimeout(timeout)
  }
}

function printTable(results: CheckResult[]): void {
  const header = ['Video ID', 'Status', 'Detail', 'Referenced in']
  const rows = results.map((r) => [
    r.id,
    r.ok ? 'PASS' : 'FAIL',
    r.detail,
    r.referencedIn.join(', '),
  ])

  const widths = header.map((h, i) => Math.max(h.length, ...rows.map((row) => row[i].length)))
  const printRow = (cells: string[]) =>
    console.log(cells.map((c, i) => c.padEnd(widths[i])).join('  |  '))

  printRow(header)
  printRow(widths.map((w) => '-'.repeat(w)))
  for (const row of rows) {
    printRow(row)
  }
}

async function main(): Promise<void> {
  if (!fs.existsSync(CONTENT_DIR)) {
    throw new Error(`Content directory not found: ${CONTENT_DIR}`)
  }

  const files = findContentFiles(CONTENT_DIR)
  const refs = extractReferences(files)

  const byId = new Map<string, string[]>()
  for (const ref of refs) {
    const existing = byId.get(ref.id) ?? []
    existing.push(ref.file)
    byId.set(ref.id, existing)
  }

  if (byId.size === 0) {
    console.log('No videoId/videoIdAf references found under src/content.')
    return
  }

  console.log(`Checking ${byId.size} unique video id(s) across ${refs.length} reference(s)...\n`)

  const results: CheckResult[] = []
  for (const [id, referencedIn] of byId) {
    const { ok, detail } = await checkVideo(id)
    results.push({ id, ok, detail, referencedIn: [...new Set(referencedIn)] })
  }

  results.sort((a, b) => Number(a.ok) - Number(b.ok) || a.id.localeCompare(b.id))
  printTable(results)

  const failures = results.filter((r) => !r.ok)
  console.log(`\n${results.length - failures.length}/${results.length} passed.`)

  if (failures.length > 0) {
    console.log(`\n${failures.length} video(s) failed the oEmbed check:`)
    for (const f of failures) {
      console.log(`  - ${f.id}: ${f.detail} (${f.referencedIn.join(', ')})`)
    }
    process.exitCode = 1
  }
}

main().catch((error: unknown) => {
  console.error('check-videos failed:', error instanceof Error ? error.message : error)
  process.exitCode = 1
})
