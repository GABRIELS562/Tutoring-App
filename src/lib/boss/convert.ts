import type { QuestionWithDetails } from '@/db/queries/questions'
import type { BattleQuestion } from './battle'

/**
 * Converts the shared QuestionWithDetails shape (the same one QuizEngine
 * and QuestionCard already use, from the real DB or the demo mock array)
 * into the minimal BattleQuestion shape the boss battle reducer needs.
 *
 * Defaults a null/zero `marks` to 1 - boss HP is the sum of every
 * question's marks, so a malformed question with no marks would otherwise
 * contribute 0 HP (making it worthless to fight and, if it were the only
 * question, would leave the boss at 0 HP before the battle even starts).
 */
export function toBattleQuestions(questions: QuestionWithDetails[]): BattleQuestion[] {
  return questions.map((question) => ({
    id: question.id,
    questionText: question.questionText,
    marks: question.marks && question.marks > 0 ? question.marks : 1,
    options: question.options,
    steps: question.steps,
  }))
}
