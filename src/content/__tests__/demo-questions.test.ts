import { describe, it, expect } from 'vitest'
import katex from 'katex'
import { demoQuestions } from '@/content/demo-questions'

/**
 * Demo questions are what the client sees with no DATABASE_URL, and what the
 * Boss Battle prototype runs on, so they are not throwaway fixtures.
 *
 * MathRenderer only renders LaTeX inside $...$ or $$...$$; anything else
 * falls through as literal text. The step answers once shipped undelimited
 * LaTeX while questionText in the same file was delimited, so a student
 * working through the solution was shown "-\frac{1}{2}" instead of the
 * fraction. Both halves of that need pinning: the delimiters, and that what
 * is inside them is actually valid LaTeX.
 */
function mathSegments(content: string): string[] {
  return [...content.matchAll(/\$\$([\s\S]*?)\$\$|\$([^$\n]+?)\$/g)].map(
    (match) => match[1] ?? match[2]
  )
}

function textOutsideMath(content: string): string {
  return content.replace(/\$\$[\s\S]*?\$\$|\$[^$\n]+?\$/g, '')
}

const everyField = demoQuestions.flatMap((question) => [
  { label: `q${question.id}.questionText`, value: question.questionText },
  ...question.options.map((option) => ({
    label: `q${question.id}.option${option.optionLetter}`,
    value: option.optionText,
  })),
  ...question.steps.flatMap((step) => [
    { label: `q${question.id}.s${step.stepNumber}.instruction`, value: step.instruction },
    { label: `q${question.id}.s${step.stepNumber}.correctAnswer`, value: step.correctAnswer },
    { label: `q${question.id}.s${step.stepNumber}.hint`, value: step.hint },
    { label: `q${question.id}.s${step.stepNumber}.explanation`, value: step.explanation },
  ]),
]).filter((field): field is { label: string; value: string } => typeof field.value === 'string')

describe('demo question maths is renderable', () => {
  it('has no LaTeX outside $ delimiters', () => {
    const undelimited = everyField
      .filter((field) => textOutsideMath(field.value).includes('\\'))
      .map((field) => `${field.label}: ${field.value.slice(0, 60)}`)

    expect(
      undelimited,
      `these render as literal LaTeX instead of maths:\n${undelimited.join('\n')}`
    ).toEqual([])
  })

  it('compiles every delimited expression with KaTeX', () => {
    const broken = everyField.flatMap((field) =>
      mathSegments(field.value)
        .filter((segment) => {
          try {
            katex.renderToString(segment, { throwOnError: true })
            return false
          } catch {
            return true
          }
        })
        .map((segment) => `${field.label}: ${segment.slice(0, 60)}`)
    )

    expect(broken, `KaTeX cannot render:\n${broken.join('\n')}`).toEqual([])
  })

  it('covers every step of every demo question', () => {
    expect(demoQuestions.length).toBeGreaterThan(0)
    for (const question of demoQuestions) {
      expect(question.steps.length, `q${question.id} has no steps`).toBeGreaterThan(0)
    }
  })
})
