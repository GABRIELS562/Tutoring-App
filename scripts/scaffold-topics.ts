/**
 * Creates content files for CAPS topics that have no page yet.
 *
 *   npx tsx scripts/scaffold-topics.ts [--dry]
 *
 * Compares src/content/caps-curriculum.ts against src/content/registry.ts
 * and writes a TopicContent file for every missing topic, with one section
 * per CAPS sub-topic ready for scripts/apply-curated-videos.ts to fill.
 * It also prints the registry import/entry lines to paste in.
 *
 * Ten Grade 11 and 12 topics were missing entirely - all of Grade 11
 * Paper 1, plus Grade 12 Algebra, Functions, Finance, Trig and Statistics -
 * so a Grade 11 student found nothing on the quadratic formula.
 */
import { writeFileSync, existsSync, mkdirSync } from 'node:fs'
import { capsCurriculum, type CapsTopic } from '../src/content/caps-curriculum'
import { contentRegistry } from '../src/content/registry'

/** `algebra-gr11` -> `src/content/maths/grade11/algebra.ts` */
function filePathFor(topic: CapsTopic): string {
  const name = topic.slug.replace(/-gr1[012]$/, '')
  return `src/content/maths/grade${topic.grade}/${name}.ts`
}

/** `algebra-gr11` -> `algebraGr11` */
function exportNameFor(topic: CapsTopic): string {
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

function fileContents(topic: CapsTopic): string {
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

// Scaffolded from the CAPS handbook (src/content/caps-curriculum.ts).
// One section per sub-topic; videos are filled by
// scripts/apply-curated-videos.ts.
export const ${exportNameFor(topic)}: TopicContent = {
  id: ${quote(topic.slug)},
  slug: ${quote(topic.slug)},
  subject: 'maths',
  grade: ${topic.grade},
  paper: ${topic.paper},
  title: ${quote(topic.title)},
  capsWeight: 0,
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
  const missing = capsCurriculum.filter((t) => !registered.has(t.slug))

  if (missing.length === 0) {
    console.log('Every CAPS topic already has a page.')
    return
  }

  const imports: string[] = []
  const entries: string[] = []

  for (const topic of missing) {
    const path = filePathFor(topic)
    if (existsSync(path)) {
      console.log(`  exists  ${path} (not in the registry - add the lines below)`)
    } else {
      console.log(`  ${dry ? 'dry  ' : 'write'}   ${path}  (${topic.subTopics.length} sub-topics)`)
      if (!dry) {
        mkdirSync(path.split('/').slice(0, -1).join('/'), { recursive: true })
        writeFileSync(path, fileContents(topic))
      }
    }
    const name = exportNameFor(topic)
    imports.push(`import { ${name} } from '@/content/maths/grade${topic.grade}/${path.split('/').pop()!.replace('.ts', '')}'`)
    entries.push(`  '${topic.slug}': ${name},`)
  }

  console.log('\nAdd to src/content/registry.ts:\n')
  console.log(imports.join('\n'))
  console.log('\n' + entries.join('\n'))
}

main()
