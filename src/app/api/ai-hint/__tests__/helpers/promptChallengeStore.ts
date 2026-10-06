import { vi } from 'vitest'

/**
 * A stateful stand-in for recordPromptChallengeAttempt.
 *
 * The route used to do this work itself through three separate Supabase
 * calls, so these tests simulated the tables. The logic now lives in one
 * Drizzle transaction (src/db/queries/ai-skills.ts), tested directly in
 * src/db/queries/__tests__/ai-skills.test.ts.
 *
 * What stays worth testing at the route level is everything around it:
 * that the server-computed score is what gets persisted rather than a
 * client-supplied one, that a failure produces persisted:false instead of
 * a celebration, and that nothing is written at all when the request is
 * rejected. This keeps that readable by holding the same state the old
 * mock did.
 */
export type StoredAttempt = {
  id: string
  challengeId: string
  score: number
  prompt: string
  xpEarned: number
}

export function makePromptChallengeStore() {
  const attempts: StoredAttempt[] = []
  const userRow = { badges: [] as string[], xp: 0, completed: 0 }
  let nextId = 1

  const recordPromptChallengeAttempt = vi.fn(
    async (input: {
      challengeId: string
      studentPrompt: string
      score: number
      xpPerStar: number
      masterBadgeId: string
      masterBadgeXp: number
    }) => {
      const existing = attempts.find((a) => a.challengeId === input.challengeId)

      if (existing) {
        // Best attempt wins; XP and badges are awarded once, on the first.
        if (input.score > existing.score) {
          existing.score = input.score
          existing.prompt = input.studentPrompt
        }
        return {
          attemptId: existing.id,
          xpEarned: 0,
          newBadges: [],
          totalChallengesCompleted: userRow.completed,
        }
      }

      const newBadges: string[] = []
      let xpEarned = input.score * input.xpPerStar
      if (input.score === 5 && !userRow.badges.includes(input.masterBadgeId)) {
        newBadges.push(input.masterBadgeId)
        xpEarned += input.masterBadgeXp
      }

      const row: StoredAttempt = {
        id: `attempt-${nextId++}`,
        challengeId: input.challengeId,
        score: input.score,
        prompt: input.studentPrompt,
        xpEarned,
      }
      attempts.push(row)
      userRow.xp += xpEarned
      userRow.badges = [...userRow.badges, ...newBadges]
      userRow.completed += 1

      return {
        attemptId: row.id,
        xpEarned,
        newBadges,
        totalChallengesCompleted: userRow.completed,
      }
    }
  )

  return { recordPromptChallengeAttempt, attempts, userRow }
}
