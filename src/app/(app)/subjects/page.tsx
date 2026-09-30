import { getTopicsForSubjectGrade } from '@/content/registry'
import type { Grade } from '@/types'
import SubjectsPageClient, { type TopicCounts } from './SubjectsPageClient'

const GRADES: Grade[] = [10, 11, 12]

/**
 * Counted here, on the server, so the curriculum never reaches the browser.
 *
 * The client component needs one number per subject, but importing the
 * registry to get it dragged all 47 topic files - prose, video ids, CAPS
 * weights - into the client bundle.
 */
export default function SubjectsPage() {
  const counts = Object.fromEntries(
    GRADES.map((grade) => [
      grade,
      {
        maths: getTopicsForSubjectGrade('maths', grade).length,
        science: getTopicsForSubjectGrade('science', grade).length,
      },
    ])
  ) as TopicCounts

  return <SubjectsPageClient counts={counts} />
}
