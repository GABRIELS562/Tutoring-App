/**
 * Real NSC exam questions with the examiner's own mark scheme.
 *
 * The point of this shape is the mark scheme. South African memoranda award
 * marks step by step and name each one - question 6.1 is not "2 marks", it is
 * a mark for the value of p and a mark for the value of q - so the app can
 * mark the way the examiner does: partial credit, and method marks where the
 * working is right and the final answer is wrong. That is the single biggest
 * lever on a real matric mark, and no worksheet tells a student about it.
 *
 * Maths is stored as LaTeX because the app already renders it with KaTeX
 * (src/components/math/MathRenderer.tsx). It cannot be stored as plain text:
 * extracting the PDF text turns 8cos²x - 2cos x - 1 = 0 into
 * "01cos2cos8 2 =−− xx".
 */

/** One tick on the examiner's memorandum. */
export interface MarkPoint {
  /** The memo's own wording, e.g. 'value of p' or 'making BD the subject'. */
  descriptor: string
  /**
   * method - awarded for correct working even if the answer is wrong
   * answer  - awarded for the final value
   * reason  - awarded for a justification or statement of a theorem
   */
  kind: 'method' | 'answer' | 'reason'
  value: number
}

export interface ExamItem {
  id: string
  paper: 'P1' | 'P2'
  grade: 10 | 11 | 12
  year: number
  source: string
  language: 'en' | 'af'
  /** Question label as printed, e.g. '6.4.1'. */
  question: string
  /** Stem shared by the sub-parts of one question, LaTeX allowed. */
  context?: string
  prompt: string
  marks: number
  /** CAPS sub-topic slug - links a lost mark to the video that teaches it. */
  topicSlug: string
  /** Rendered from the paper; the question cannot be answered without it. */
  diagram?: string
  /** The answer is a sketch, so it cannot be marked from text alone. */
  requiresDrawing?: boolean
  /** Worked solution, in the memo's order. */
  solution: string[]
  markScheme: MarkPoint[]
  /** What a student who is confident and wrong typically does here. */
  commonError?: string
}

export function totalMarks(items: ExamItem[]): number {
  return items.reduce((sum, item) => sum + item.marks, 0)
}

/** Marks available for method alone - what gets left on the table. */
export function methodMarks(item: ExamItem): number {
  return item.markScheme
    .filter((point) => point.kind === 'method')
    .reduce((sum, point) => sum + point.value, 0)
}
