/**
 * Writes docs/curriculum/CONTENT-GAPS.md - every CAPS sub-topic with no
 * curated video, for Angelo to work through.
 *
 *   npx tsx scripts/content-gaps.ts
 *
 * The app marks these in place with a `content_gap` block; this is the same
 * information as a list he can act on, grouped the way he would record: by
 * subject, grade and topic.
 */
import { writeFileSync } from 'node:fs'
import { capsCurriculum } from '../src/content/caps-curriculum'
import { capsScienceCurriculum } from '../src/content/caps-science-curriculum'
import { contentRegistry } from '../src/content/registry'

interface Gap {
  subject: string
  grade: number
  paper: number
  topic: string
  subTopic: string
  hasAfrikaans: boolean
}

/** Sub-topics with an English video but no Afrikaans one. */
const afrikaansGaps: Gap[] = []

function collect(): Gap[] {
  const gaps: Gap[] = []
  const all = [
    ...capsCurriculum.map((t) => ({ ...t, subject: 'Mathematics' })),
    ...capsScienceCurriculum.map((t) => ({ ...t, subject: 'Physical Sciences' })),
  ]
  for (const topic of all) {
    const content = contentRegistry[topic.slug]
    if (!content) continue
    for (const section of content.sections) {
      if (section.id === 'overview') continue
      const video = section.blocks.find((b) => b.type === 'video')
      if (video?.videoId) {
        // Has an English video. If it has no Afrikaans one, an Afrikaans
        // student still sees this sub-topic - they just get the English
        // video. That is a softer gap than a blank page, but it is still a
        // gap, and it is invisible unless it is counted.
        if (!video.videoIdAf) {
          afrikaansGaps.push({
            subject: topic.subject,
            grade: topic.grade,
            paper: topic.paper,
            topic: topic.title,
            subTopic: section.title,
            hasAfrikaans: false,
          })
        }
        continue
      }
      gaps.push({
        subject: topic.subject,
        grade: topic.grade,
        paper: topic.paper,
        topic: topic.title,
        subTopic: section.title,
        hasAfrikaans: Boolean(video?.videoIdAf),
      })
    }
  }
  return gaps
}

function main() {
  const gaps = collect()
  const today = new Date().toISOString().slice(0, 10)
  const lines: string[] = [
    '# Content gaps',
    '',
    `Generated ${today} by \`npx tsx scripts/content-gaps.ts\`. Regenerate it after`,
    'any curation run rather than editing it by hand.',
    '',
    'These are the CAPS sub-topics that have a page in the app but no curated',
    'video behind it. Each one is marked in place with a "Video outstanding"',
    'block, so they are visible while browsing the app as well as listed here.',
    '',
    'A sub-topic is blank because no video from a verified South African CAPS',
    'channel covers it. That is deliberate: an international video teaching the',
    'same maths to a different syllabus is worse than an honest gap.',
    '',
    '## How to close one',
    '',
    '1. **Record it.** These are the sub-topics worth Kevin\'s time first - they',
    '   are examinable content with nothing behind them.',
    '2. **Send a link.** If you know a South African video that covers it, send',
    '   the URL and it can be added and verified in minutes.',
    '3. **Leave it.** A gap is not a broken page - the sub-topic still appears',
    '   with its heading and the rest of the topic works.',
    '',
    '## Summary',
    '',
    '| Subject | Grade | Sub-topics | Covered | Gaps |',
    '|---|---:|---:|---:|---:|',
  ]

  const totals = [
    ...capsCurriculum.map((t) => ({ ...t, subject: 'Mathematics' })),
    ...capsScienceCurriculum.map((t) => ({ ...t, subject: 'Physical Sciences' })),
  ]
  for (const subject of ['Mathematics', 'Physical Sciences']) {
    for (const grade of [10, 11, 12]) {
      const total = totals
        .filter((t) => t.subject === subject && t.grade === grade)
        .reduce((n, t) => n + t.subTopics.length, 0)
      const gapCount = gaps.filter((g) => g.subject === subject && g.grade === grade).length
      lines.push(
        `| ${subject} | ${grade} | ${total} | ${total - gapCount} | **${gapCount}** |`
      )
    }
  }
  const grandTotal = totals.reduce((n, t) => n + t.subTopics.length, 0)
  lines.push(
    `| **Total** | | **${grandTotal}** | **${grandTotal - gaps.length}** | **${gaps.length}** |`,
    ''
  )

  for (const subject of ['Mathematics', 'Physical Sciences']) {
    const forSubject = gaps.filter((g) => g.subject === subject)
    if (forSubject.length === 0) continue
    lines.push(`## ${subject}`, '')
    for (const grade of [10, 11, 12]) {
      const forGrade = forSubject.filter((g) => g.grade === grade)
      if (forGrade.length === 0) continue
      lines.push(`### Grade ${grade} — ${forGrade.length} outstanding`, '')
      let currentTopic = ''
      for (const gap of forGrade) {
        if (gap.topic !== currentTopic) {
          currentTopic = gap.topic
          lines.push(`**${gap.topic}** (Paper ${gap.paper})`, '')
        }
        const note = gap.hasAfrikaans ? ' _(Afrikaans video exists)_' : ''
        lines.push(`- [ ] ${gap.subTopic}${note}`)
      }
      lines.push('')
    }
  }

  // --- the Afrikaans track
  lines.push(
    '## Afrikaans track',
    '',
    'These sub-topics have an English video but no Afrikaans one, so an',
    'Afrikaans student sees the English video. The page still works and the',
    'heading is in Afrikaans - only the video is not.',
    '',
    'The Afrikaans ecosystem is roughly a hundredth the size of the English',
    'one, so these will not all close. Where a gap remains it is because no',
    'video from a verified Afrikaans CAPS channel covers the sub-topic, or',
    'because the one that does has in-app playback disabled by its owner,',
    'which cannot be overridden from our side.',
    '',
    '| Subject | Grade | With English video | Also Afrikaans | Afrikaans outstanding |',
    '|---|---:|---:|---:|---:|',
  )
  for (const subject of ['Mathematics', 'Physical Sciences']) {
    for (const grade of [10, 11, 12]) {
      const total = totals
        .filter((t) => t.subject === subject && t.grade === grade)
        .reduce((n, t) => n + t.subTopics.length, 0)
      const englishGaps = gaps.filter((g) => g.subject === subject && g.grade === grade).length
      const withEnglish = total - englishGaps
      const missing = afrikaansGaps.filter((g) => g.subject === subject && g.grade === grade).length
      lines.push(
        `| ${subject} | ${grade} | ${withEnglish} | ${withEnglish - missing} | **${missing}** |`
      )
    }
  }
  lines.push('')

  for (const subject of ['Mathematics', 'Physical Sciences']) {
    const forSubject = afrikaansGaps.filter((g) => g.subject === subject)
    if (forSubject.length === 0) continue
    lines.push(`### ${subject} — Afrikaans outstanding`, '')
    for (const grade of [10, 11, 12]) {
      const forGrade = forSubject.filter((g) => g.grade === grade)
      if (forGrade.length === 0) continue
      lines.push(`**Grade ${grade}** — ${forGrade.length} sub-topics`, '')
      let currentTopic = ''
      for (const gap of forGrade) {
        if (gap.topic !== currentTopic) {
          currentTopic = gap.topic
          lines.push(`_${gap.topic}_`, '')
        }
        lines.push(`- [ ] ${gap.subTopic}`)
      }
      lines.push('')
    }
  }

  writeFileSync('docs/curriculum/CONTENT-GAPS.md', lines.join('\n'))
  console.log(
    `Wrote docs/curriculum/CONTENT-GAPS.md — ${gaps.length} English gaps and ` +
      `${afrikaansGaps.length} Afrikaans gaps, of ${grandTotal} sub-topics`
  )
}

main()
