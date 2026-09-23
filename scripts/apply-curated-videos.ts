/**
 * Applies curated per-sub-topic videos to the topic content files.
 *
 *   npx tsx scripts/apply-curated-videos.ts --grade 10 [--dry]
 *
 * Reads docs/curriculum/candidates-gr<N>.json (written by
 * scripts/curate-videos.ts) and rewrites each topic's `sections` so that
 * every CAPS sub-topic becomes its own section containing its video.
 *
 * Why a section per sub-topic rather than a pile of videos in one section:
 * a student stuck on "general solutions" needs to land on that heading and
 * press play, not scroll a wall of clips. The section headings also become
 * the topic page's contents list for free.
 *
 * Sub-topics with no curated video still get a section, with a short note
 * instead of a video, so the curriculum outline stays visible and the gap
 * is honest rather than hidden.
 *
 * The file's existing "What this topic covers" theory block is preserved as
 * an overview section at the top.
 */
import { readFileSync, writeFileSync, existsSync } from 'node:fs'
import { capsCurriculum } from '../src/content/caps-curriculum'

interface Pick {
  id: string
  title: string
  channel: string
  duration: string
  viewsText: string
}
interface Curated {
  slug: string
  topicTitle: string
  grade: number
  subTopic: string
  pick: Pick | null
  usedAdjacentGrade?: boolean
}

/**
 * Most slugs map straight to a file: `algebra-gr11` -> grade11/algebra.ts.
 * Only the ones whose file was named differently need an entry here.
 */
const FILENAME_OVERRIDES: Record<string, string> = {
  'trig-gr10': 'trigonometry',
  'trig-gr11': 'trigonometry',
}

/** `algebra-gr11` -> `src/content/maths/grade11/algebra.ts` */
function fileForSlug(slug: string, grade: number): string {
  const name = FILENAME_OVERRIDES[slug] ?? slug.replace(/-gr1[012]$/, '')
  return `src/content/maths/grade${grade}/${name}.ts`
}

/** Stable, readable section id from a sub-topic name. */
function sectionId(subTopic: string): string {
  return subTopic
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 48)
}

function quote(text: string): string {
  return `'${text.replace(/\\/g, '\\\\').replace(/'/g, "\\'")}'`
}

function overviewSection(source: string, topicTitle: string): string | null {
  const match = source.match(
    /\{\s*type: 'theory',\s*title: 'What this topic covers',\s*body: `([\s\S]*?)`\s*\}/
  )
  if (!match) return null
  return `    {
      id: 'overview',
      title: ${quote(topicTitle)},
      blocks: [
        {
          type: 'theory',
          title: 'What this topic covers',
          body: \`${match[1]}\`
        }
      ]
    }`
}

function sectionFor(entry: Curated): string {
  const id = sectionId(entry.subTopic)
  if (!entry.pick) {
    return `    {
      id: ${quote(id)},
      title: ${quote(entry.subTopic)},
      blocks: [
        {
          type: 'tip',
          body: \`We haven't found a CAPS video for this sub-topic yet. Ask Angelo if you're stuck on it.\`
        }
      ]
    }`
  }
  const p = entry.pick
  const note = entry.usedAdjacentGrade
    ? `\n        // Labelled for an adjacent grade; CAPS covers this sub-topic in both.`
    : ''
  return `    {
      id: ${quote(id)},
      title: ${quote(entry.subTopic)},
      blocks: [${note}
        {
          type: 'video',
          title: ${quote(`Watch: ${p.title} — ${p.channel}`)},
          videoId: ${quote(p.id)}
        }
      ]
    }`
}

function rewrite(source: string, topicTitle: string, entries: Curated[]): string {
  const sections = [overviewSection(source, topicTitle), ...entries.map(sectionFor)].filter(
    Boolean
  ) as string[]

  const start = source.indexOf('  sections: [')
  if (start === -1) throw new Error('no sections array found')
  // The sections array ends at the last "]" before the closing "}" of the object.
  const end = source.lastIndexOf('  ]')
  if (end === -1 || end < start) throw new Error('could not find end of sections array')

  return (
    source.slice(0, start) +
    '  // Curated per CAPS sub-topic — see docs/curriculum/ and scripts/curate-videos.ts\n' +
    '  sections: [\n' +
    sections.join(',\n') +
    '\n  ]' +
    source.slice(end + 3)
  )
}

function main() {
  const args = process.argv.slice(2)
  const grade = parseInt(args[args.indexOf('--grade') + 1], 10)
  const dry = args.includes('--dry')
  const path = `docs/curriculum/candidates-gr${grade}.json`
  if (!existsSync(path)) {
    console.error(`No curation file at ${path} — run scripts/curate-videos.ts first.`)
    process.exit(1)
  }
  const curated: Curated[] = JSON.parse(readFileSync(path, 'utf8'))
  const topics = capsCurriculum.filter((t) => t.grade === grade)

  let changed = 0
  for (const topic of topics) {
    const file = fileForSlug(topic.slug, grade)
    if (!existsSync(file)) {
      console.log(`  skip  ${topic.slug.padEnd(28)} (no content file yet)`)
      continue
    }
    // Keep CAPS order, not the order they happen to appear in the JSON.
    const entries = topic.subTopics
      .map((sub) => curated.find((c) => c.slug === topic.slug && c.subTopic === sub))
      .filter(Boolean) as Curated[]
    if (entries.length === 0) continue

    const source = readFileSync(file, 'utf8')
    const next = rewrite(source, topic.title, entries)
    const videos = entries.filter((e) => e.pick).length
    console.log(
      `  ${dry ? 'dry ' : 'wrote'} ${topic.slug.padEnd(28)} ${entries.length} sections, ${videos} videos`
    )
    if (!dry) writeFileSync(file, next)
    changed++
  }
  console.log(`\n${dry ? 'Would update' : 'Updated'} ${changed} topic file(s).`)
}

main()
