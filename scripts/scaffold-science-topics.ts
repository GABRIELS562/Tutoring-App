/**
 * Creates content files for CAPS Physical Sciences topics that have no page.
 *
 *   npx tsx scripts/scaffold-science-topics.ts [--dry]
 *
 * Science needs a migration rather than an extension. The app grew nine
 * science topics before the CAPS document was digitised, and they do not map
 * one-to-one onto the curriculum's nineteen: Grade 10 had Transverse Waves,
 * Sound and Electromagnetic Radiation as three separate topics where CAPS has
 * one Waves, Sound & Light, and Grade 11's Newton's Laws is CAPS Mechanics.
 *
 * Old slugs stay reachable as registry aliases so no existing link breaks -
 * the same treatment equations-gr10 got on the maths side.
 */
import { writeFileSync, existsSync, mkdirSync } from 'node:fs'
import { capsScienceCurriculum, type CapsScienceTopic } from '../src/content/caps-science-curriculum'
import { contentRegistry } from '../src/content/registry'

/** Old slug -> the CAPS topic that now covers it. */
export const FOLDED_IN: Record<string, string> = {
  'waves-gr10': 'waves-sound-light-gr10',
  'sound-gr10': 'waves-sound-light-gr10',
  'em-radiation-gr10': 'waves-sound-light-gr10',
  'electric-circuits-gr10': 'electricity-magnetism-gr10',
  'newtons-laws-gr11': 'mechanics-gr11',
  'waves-sound-gr11': 'waves-sound-light-gr11',
  'momentum-gr12': 'mechanics-gr12',
}

/** `waves-sound-light-gr10` -> `src/content/science/grade10/waves-sound-light.ts` */
function filePathFor(topic: CapsScienceTopic): string {
  const name = topic.slug.replace(/-gr1[012]$/, '')
  return `src/content/science/grade${topic.grade}/${name}.ts`
}

/** `waves-sound-light-gr10` -> `wavesSoundLightGr10` */
function exportNameFor(topic: CapsScienceTopic): string {
  const base = topic.slug
    .replace(/-gr1[012]$/, '')
    .split('-')
    .map((part, i) => (i === 0 ? part : part[0].toUpperCase() + part.slice(1)))
    .join('')
  return `${base}Gr${topic.grade}`
}

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

function fileContents(topic: CapsScienceTopic): string {
  const overview = topic.subTopics.map((s) => `• ${s}`).join('\n')
  const sections = [
    `    {
      id: 'overview',
      title: ${quote(topic.title)},
      blocks: [
        {
          type: 'theory',
          title: 'What this topic covers',
          body: \`${overview}\`
        }
      ]
    }`,
    ...topic.subTopics.map(
      (subTopic) => `    {
      id: ${quote(sectionId(subTopic))},
      title: ${quote(subTopic)},
      blocks: [
        {
          type: 'tip',
          body: \`A curated video for this sub-topic is on the way. Ask Angelo if you're stuck on it.\`
        }
      ]
    }`
    ),
  ]

  return `import type { TopicContent } from '@/types'

// Scaffolded from the CAPS Physical Sciences curriculum
// (src/content/caps-science-curriculum.ts). One section per sub-topic;
// videos are filled by scripts/apply-curated-videos.ts.
export const ${exportNameFor(topic)}: TopicContent = {
  id: ${quote(topic.slug)},
  slug: ${quote(topic.slug)},
  subject: 'science',
  grade: ${topic.grade},
  paper: ${topic.paper},
  title: ${quote(topic.title)},
  capsWeight: ${topic.weight},
  sections: [
${sections.join(',\n')}
  ]
}

export default ${exportNameFor(topic)}
`
}

function main() {
  const dry = process.argv.includes('--dry')
  const registered = new Set(Object.keys(contentRegistry))

  const imports: string[] = []
  const entries: string[] = []

  for (const topic of capsScienceCurriculum) {
    const path = filePathFor(topic)
    const exists = existsSync(path)

    if (exists) {
      console.log(`  keep    ${path}  (already built)`)
    } else {
      console.log(`  ${dry ? 'dry  ' : 'write'}   ${path}  (${topic.subTopics.length} sub-topics)`)
      if (!dry) {
        mkdirSync(path.split('/').slice(0, -1).join('/'), { recursive: true })
        writeFileSync(path, fileContents(topic))
      }
    }

    if (!registered.has(topic.slug)) {
      const name = exportNameFor(topic)
      const file = path.split('/').pop()!.replace('.ts', '')
      imports.push(`import { ${name} } from '@/content/science/grade${topic.grade}/${file}'`)
      entries.push(`  '${topic.slug}': ${name},`)
    }
  }

  console.log('\nAdd to src/content/registry.ts:\n')
  console.log(imports.join('\n'))
  console.log('\n' + entries.join('\n'))
  console.log('\nAnd point the folded-in slugs at their CAPS topic:')
  for (const [old, into] of Object.entries(FOLDED_IN)) {
    console.log(`  '${old}': ${exportNameFor(capsScienceCurriculum.find((t) => t.slug === into)!)}, // folded into ${into}`)
  }
}

main()
