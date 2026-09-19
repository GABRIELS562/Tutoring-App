/**
 * Shared gameplay constants. Kept dependency-free (no '@/db' import) so
 * this can be imported from both server query modules and client
 * components (e.g. QuizEngine) without pulling in server-only code.
 */

/** XP awarded the first time a question is answered correctly. */
export const XP_PER_CORRECT_ANSWER = 10

/** Hearts a student starts with / is refilled to on a new day. */
export const MAX_HEARTS = 5
