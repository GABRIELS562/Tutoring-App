/**
 * Compares the CAPS curriculum (src/content/caps-curriculum.ts, transcribed
 * from the client's handbook) against what the app actually has in
 * src/content/registry.ts, and reports the gap.
 *
 * Run: npm run curriculum:gaps
 */
import { capsCurriculum, allSubTopics } from '../src/content/caps-curriculum'
import { contentRegistry } from '../src/content/registry'

const registrySlugs = new Set(Object.keys(contentRegistry))

const built: string[] = []
const missing: string[] = []

for (const topic of capsCurriculum) {
  ;(registrySlugs.has(topic.slug) ? built : missing).push(
    `Gr ${topic.grade} P${topic.paper}  ${topic.title.padEnd(22)} ${topic.slug}`
  )
}

const capsSlugs = new Set(capsCurriculum.map((t) => t.slug))
const extraMaths = [...registrySlugs].filter(
  (slug) => !capsSlugs.has(slug) && /-gr1[012]$/.test(slug)
)

console.log(`CAPS Mathematics topics:      ${capsCurriculum.length}`)
console.log(`Sub-topics (videos needed):   ${allSubTopics().length}`)
console.log(`\nBUILT (${built.length}):`)
built.forEach((l) => console.log('  ' + l))
console.log(`\nMISSING (${missing.length}):`)
missing.forEach((l) => console.log('  ' + l))
console.log(`\nIn the app but not in this handbook (${extraMaths.length}) — science + split topics:`)
extraMaths.sort().forEach((s) => console.log('  ' + s))

console.log('\nSub-topic count per grade:')
for (const grade of [10, 11, 12] as const) {
  const topics = capsCurriculum.filter((t) => t.grade === grade)
  const subs = topics.reduce((n, t) => n + t.subTopics.length, 0)
  console.log(`  Grade ${grade}: ${topics.length} topics, ${subs} sub-topics`)
}
