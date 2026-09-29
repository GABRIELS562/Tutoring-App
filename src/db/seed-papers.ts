import { db } from './index'
import { pastPapers } from './schema'
import { pastPaperExists } from './queries/topics'
import { demoPapers } from '../content/demo-papers'

/**
 * Past papers come from src/content/demo-papers.ts - the one place a
 * paper's URL is written down.
 *
 * This file used to carry its own hand-maintained copy. The two drifted:
 * every one of the 96 stanmorephysics.com URLs here became a 404, so a
 * seeded database served 50 of its 114 rows with two dead buttons (Grade
 * 12: 30 out of 30) while demo mode, reading the other list, looked
 * perfect. The same drift wrote 'english' in one file and 'English' in
 * the other, and the papers page compares the language filter strictly -
 * so a real deployment showed zero papers until the student cleared the
 * filters.
 *
 * Deriving one from the other means a dead link can only ever be dead in
 * one place, and can be fixed in one place.
 */
const papers = demoPapers.map((paper) => ({
  grade: paper.grade,
  subject: paper.subject,
  year: paper.year,
  examType: paper.examType,
  paperNumber: paper.paperNumber,
  language: paper.language,
  pdfUrl: paper.pdfUrl,
  memoUrl: paper.memoUrl,
  topicsCovered: paper.topicsCovered,
}))

async function seedPapers() {
  console.log('Seeding past papers...')

  let inserted = 0
  let skipped = 0

  try {
    for (const paper of papers) {
      if (await pastPaperExists(paper)) {
        console.log(`Skipped (already exists): Grade ${paper.grade} ${paper.subject} ${paper.year} Paper ${paper.paperNumber}`)
        skipped += 1
        continue
      }

      await db.insert(pastPapers).values(paper)
      console.log(`Inserted: Grade ${paper.grade} ${paper.subject} ${paper.year} Paper ${paper.paperNumber}`)
      inserted += 1
    }

    console.log(`\nDone - inserted ${inserted}, skipped ${skipped} already-seeded papers (${papers.length} total).`)
  } catch (error) {
    console.error('Error seeding papers:', error)
    process.exit(1)
  }

  process.exit(0)
}

seedPapers()
