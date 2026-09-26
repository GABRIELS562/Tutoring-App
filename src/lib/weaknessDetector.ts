import { db } from '@/db'
import { studentProgress, questions, topics } from '@/db/schema'
import { eq, and } from 'drizzle-orm'

export type Weakness = {
  topicSlug: string
  topicName: string
  accuracy: number
  totalAttempts: number
  /** Key into the `weakness` message namespace, prefixed `issue_`. */
  specificIssueKey: string
  /** Key into the `weakness` message namespace, prefixed `rec_`. */
  recommendationKey: string
}

/**
 * Which issue a topic's mistakes usually come down to.
 *
 * These are message KEYS, not prose. They used to be English sentences that
 * were interpolated into a translated template, so an Afrikaans student was
 * shown "Jy kry Sign errors in reduction formulae in Trigonometry steeds
 * verkeerd." - the sentence translated, the substance not. The words live in
 * src/messages/{en,af}.json under `weakness`.
 */
const issuePatterns: Record<string, { issueKey: string; recommendationKey: string }> = {
  'trig-gr11': { issueKey: 'signErrors', recommendationKey: 'signErrors' },
  trigonometry: { issueKey: 'signErrors', recommendationKey: 'signErrors' },
  'analytical-geometry': { issueKey: 'distanceMidpoint', recommendationKey: 'distanceMidpoint' },
  'euclidean-geometry': { issueKey: 'circleTheorems', recommendationKey: 'circleTheorems' },
  statistics: { issueKey: 'standardDeviation', recommendationKey: 'standardDeviation' },
  default: { issueKey: 'general', recommendationKey: 'general' },
}

export async function analyzeWeaknesses(userId: string, grade: number): Promise<Weakness[]> {
  try {
    // Query student progress joined with questions and topics
    const results = await db
      .select({
        topicId: topics.id,
        topicSlug: topics.slug,
        topicName: topics.name,
        status: studentProgress.status,
      })
      .from(studentProgress)
      .innerJoin(questions, eq(studentProgress.questionId, questions.id))
      .innerJoin(topics, eq(questions.topicId, topics.id))
      .where(
        and(
          eq(studentProgress.userId, userId),
          eq(topics.grade, grade)
        )
      )

    // Group by topic and calculate accuracy
    const topicStats: Record<string, {
      topicSlug: string
      topicName: string
      correct: number
      total: number
    }> = {}

    for (const row of results) {
      const key = row.topicId
      if (!topicStats[key]) {
        topicStats[key] = {
          topicSlug: row.topicSlug,
          topicName: row.topicName,
          correct: 0,
          total: 0,
        }
      }
      topicStats[key].total++
      if (row.status === 'correct') {
        topicStats[key].correct++
      }
    }

    // Calculate weaknesses (topics with accuracy below 60%)
    const weaknesses: Weakness[] = []

    for (const stats of Object.values(topicStats)) {
      if (stats.total >= 3) { // Only consider topics with at least 3 attempts
        const accuracy = stats.correct / stats.total
        if (accuracy < 0.6) {
          const pattern = issuePatterns[stats.topicSlug] || issuePatterns['default']
          weaknesses.push({
            topicSlug: stats.topicSlug,
            topicName: stats.topicName,
            accuracy,
            totalAttempts: stats.total,
            specificIssueKey: pattern.issueKey,
            recommendationKey: pattern.recommendationKey,
          })
        }
      }
    }

    // Sort by accuracy (lowest first) and return top 3
    return weaknesses
      .sort((a, b) => a.accuracy - b.accuracy)
      .slice(0, 3)

  } catch (error) {
    console.error('Error analyzing weaknesses:', error)
    return []
  }
}

// Mock data for demo/development
export function getMockWeaknesses(): Weakness[] {
  return [
    {
      topicSlug: 'trig-gr11',
      topicName: 'Trigonometry',
      accuracy: 0.35,
      totalAttempts: 14,
      specificIssueKey: 'signErrors',
      recommendationKey: 'signErrors',
    },
    {
      topicSlug: 'euclidean-geometry',
      topicName: 'Euclidean Geometry',
      accuracy: 0.42,
      totalAttempts: 12,
      specificIssueKey: 'circleTheorems',
      recommendationKey: 'circleTheorems',
    },
    {
      topicSlug: 'analytical-geometry',
      topicName: 'Analytical Geometry',
      accuracy: 0.55,
      totalAttempts: 9,
      specificIssueKey: 'distanceMidpoint',
      recommendationKey: 'distanceMidpoint',
    },
  ]
}
