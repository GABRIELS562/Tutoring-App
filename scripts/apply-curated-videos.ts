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
import { capsScienceCurriculum } from '../src/content/caps-science-curriculum'

/** `--subject science` applies the Physical Sciences picks instead. */
const IS_SCIENCE =
  process.argv[process.argv.indexOf('--subject') + 1] === 'science'
import { capsSubTopicsAf, capsTopicTitlesAf } from '../src/content/caps-curriculum-af'

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
  const subject = IS_SCIENCE ? 'science' : 'maths'
  return `src/content/${subject}/grade${grade}/${name}.ts`
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

function overviewSection(source: string, topicTitle: string, slug: string): string | null {
  // titleAf is optional because this has to match output this script itself
  // produced: once a titleAf was emitted between title and body, a stricter
  // pattern stopped matching and a second run silently dropped every
  // overview section.
  const match = source.match(
    /\{\s*type: 'theory',\s*title: 'What this topic covers',\s*(?:titleAf: '(?:[^'\\]|\\.)*',\s*)?body: `([\s\S]*?)`\s*\}/
  )
  if (!match) return null
  return `    {
      id: 'overview',
      title: ${quote(topicTitle)},${
    capsTopicTitlesAf[slug] ? `\n      titleAf: ${quote(capsTopicTitlesAf[slug])},` : ''
  }
      blocks: [
        {
          type: 'theory',
          title: 'What this topic covers',
          titleAf: 'Wat hierdie onderwerp dek',
          body: \`${match[1]}\`
        }
      ]
    }`
}

/**
 * The Afrikaans pick for the same sub-topic, if one was found. Afrikaans
 * coverage is thinner than English, so a section often carries videoId with
 * no videoIdAf - NoteBlock then plays the English video for both locales,
 * which is better than an empty player.
 */
function afrikaansPickFor(entry: Curated, afrikaans: Curated[]): Pick | null {
  const match = afrikaans.find((c) => c.slug === entry.slug && c.subTopic === entry.subTopic)
  return match?.pick ?? null
}

/** The Afrikaans heading for a sub-topic, or nothing when we have none. */
function titleAfLine(subTopic: string): string {
  const af = capsSubTopicsAf[subTopic]
  return af ? `\n      titleAf: ${quote(af)},` : ''
}

function sectionFor(entry: Curated, afrikaans: Curated[]): string {
  const id = sectionId(entry.subTopic)
  const afOnly = afrikaansPickFor(entry, afrikaans)

  // A handful of sub-topics have an Afrikaans video but no English one.
  // Emitting the block with only videoIdAf gives Afrikaans students the
  // lesson; NoteBlock shows its "no video available" note for English,
  // rather than an empty player.
  if (!entry.pick && afOnly) {
    return `    {
      id: ${quote(id)},
      title: ${quote(entry.subTopic)},${titleAfLine(entry.subTopic)}
      blocks: [
        {
          type: 'video',
          title: ${quote(`Kyk: ${afOnly.title} — ${afOnly.channel}`)},
          videoIdAf: ${quote(afOnly.id)}
        }
      ]
    }`
  }

  if (!entry.pick) {
    return `    {
      id: ${quote(id)},
      title: ${quote(entry.subTopic)},${titleAfLine(entry.subTopic)}
      blocks: [
        {
          type: 'content_gap',
          body: \`No CAPS video has been sourced for this sub-topic yet. Ask Angelo if you're stuck on it in the meantime.\`,
          bodyAf: \`Daar is nog nie 'n KABV-video vir hierdie onderafdeling nie. Vra solank vir Angelo as jy vashaak.\`
        }
      ]
    }`
  }
  const p = entry.pick
  const af = afrikaansPickFor(entry, afrikaans)
  const note = entry.usedAdjacentGrade
    ? `\n        // Labelled for an adjacent grade; CAPS covers this sub-topic in both.`
    : ''
  return `    {
      id: ${quote(id)},
      title: ${quote(entry.subTopic)},${titleAfLine(entry.subTopic)}
      blocks: [${note}
        {
          type: 'video',
          title: ${quote(`Watch: ${p.title} — ${p.channel}`)},
          videoId: ${quote(p.id)}${af ? `,\n          videoIdAf: ${quote(af.id)}` : ''}
        }
      ]
    }`
}

/**
 * Give the topic itself an Afrikaans name, inserted right after `title` so the
 * content files stay readable. Idempotent: an existing titleAf is replaced.
 */
function withTopicTitleAf(source: string, slug: string): string {
  const af = capsTopicTitlesAf[slug]
  if (!af) return source
  const withoutOld = source.replace(/\n  titleAf: '(?:[^'\\]|\\.)*',/, '')
  return withoutOld.replace(
    /(\n  title: '(?:[^'\\]|\\.)*',)/,
    `$1\n  titleAf: ${quote(af)},`
  )
}

function rewrite(
  source: string,
  topicTitle: string,
  slug: string,
  entries: Curated[],
  afrikaans: Curated[]
): string {
  const sections = [
    overviewSection(source, topicTitle, slug),
    ...entries.map((entry) => sectionFor(entry, afrikaans)),
  ].filter(
    Boolean
  ) as string[]

  // Applying twice must not stack the marker comment; strip any previous one.
  source = source.replace(
    /(?:[ \t]*\/\/ Curated per CAPS sub-topic[^\n]*\n)+/g,
    ''
  )

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
  const path = `docs/curriculum/candidates-${IS_SCIENCE ? 'sci-' : ''}gr${grade}.json`
  if (!existsSync(path)) {
    console.error(`No curation file at ${path} — run scripts/curate-videos.ts first.`)
    process.exit(1)
  }
  const curated: Curated[] = JSON.parse(readFileSync(path, 'utf8'))
  const afPath = `docs/curriculum/candidates-${IS_SCIENCE ? 'sci-' : ''}af-gr${grade}.json`
  const afrikaans: Curated[] = existsSync(afPath)
    ? (JSON.parse(readFileSync(afPath, 'utf8')) as Curated[])
    : []
  if (afrikaans.length === 0) console.log(`  (no Afrikaans candidates at ${afPath})`)
  const curriculum = IS_SCIENCE ? capsScienceCurriculum : capsCurriculum
  const topics = curriculum.filter((t) => t.grade === grade)

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
    const next = withTopicTitleAf(rewrite(source, topic.title, topic.slug, entries, afrikaans), topic.slug)
    const videos = entries.filter((e) => e.pick).length
    const afVideos = entries.filter((e) => e.pick && afrikaansPickFor(e, afrikaans)).length
    console.log(
      `  ${dry ? 'dry ' : 'wrote'} ${topic.slug.padEnd(28)} ${entries.length} sections, ${videos} videos, ${afVideos} af`
    )
    if (!dry) writeFileSync(file, next)
    changed++
  }
  console.log(`\n${dry ? 'Would update' : 'Updated'} ${changed} topic file(s).`)
}

main()
