import { db } from '@/db'
import { studentProgress, questions, topics } from '@/db/schema'
import { eq, and } from 'drizzle-orm'

export type Weakness = {
  topicSlug: string
  topicName: string
  accuracy: number
  totalAttempts: number
  specificIssue: string
  recommendation: string
}

// Issue patterns based on common mistakes
const issuePatterns: Record<string, { issue: string; recommendation: string }> = {
  'trig-gr11': {
    issue: 'Sign errors in reduction formulae',
    recommendation: 'Practice the CAST diagram questions in Section 2'
  },
  'trigonometry': {
    issue: 'Sign errors in reduction formulae',
    recommendation: 'Practice the CAST diagram questions in Section 2'
  },
  'analytical-geometry': {
    issue: 'Distance and midpoint formula confusion',
    recommendation: 'Focus on the formula derivation examples'
  },
  'euclidean-geometry': {
    issue: 'Circle theorem applications',
    recommendation: 'Work through the theorem proofs step by step'
  },
  'statistics': {
    issue: 'Standard deviation calculations',
    recommendation: 'Practice with the calculator method first'
  },
  'default': {
    issue: 'General concept understanding',
    recommendation: 'Review the theory section before attempting questions'
  }
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
            specificIssue: pattern.issue,
            recommendation: pattern.recommendation,
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
      specificIssue: 'Sign errors in reduction formulae',
      recommendation: 'Practice the CAST diagram questions in Section 2',
    },
    {
      topicSlug: 'euclidean-geometry',
      topicName: 'Euclidean Geometry',
      accuracy: 0.42,
      totalAttempts: 12,
      specificIssue: 'Circle theorem applications',
      recommendation: 'Work through the theorem proofs step by step',
    },
    {
      topicSlug: 'analytical-geometry',
      topicName: 'Analytical Geometry',
      accuracy: 0.55,
      totalAttempts: 9,
      specificIssue: 'Distance and midpoint formula confusion',
      recommendation: 'Focus on the formula derivation examples',
    },
  ]
}
