import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { getQuestionsForTopic, saveQuestion, deleteQuestion } from '@/db/queries/admin'
import { requireAdmin, authErrorResponse } from '@/lib/auth/require-user'

/**
 * Same reasoning as the topics route: this is a write boundary and every
 * other one in the app validates. The body was destructured from `any`,
 * truthy-checked on four fields, and handed to a Drizzle insert inside a
 * transaction alongside its options and steps - so a wrong type, or an
 * option missing optionLetter, became a generic 500 or a row of NULLs
 * rather than a field-level error the editor could show.
 *
 * The options/steps bounds are the ones that matter most: they are
 * inserted as child rows, and a malformed entry there produces a question
 * that renders with a blank answer rather than failing loudly.
 */
const QuestionOptionSchema = z.object({
  optionLetter: z.string().trim().regex(/^[A-D]$/, 'optionLetter must be A-D'),
  optionText: z.string().trim().min(1).max(2000),
  isCorrect: z.boolean(),
})

const QuestionStepSchema = z.object({
  stepNumber: z.number().int().min(1).max(50),
  instruction: z.string().trim().min(1).max(2000),
  correctAnswer: z.string().trim().min(1).max(2000),
  hint: z.string().max(2000).optional(),
  explanation: z.string().max(2000).optional(),
  createdBy: z.string().max(40).optional(),
})

const SaveQuestionSchema = z
  .object({
    // QuestionEditor sends `id: null` when creating (its prop is
    // `string | null`), so null has to be accepted, not just absent.
    id: z.string().uuid().nullish(),
    topicId: z.string().uuid(),
    questionText: z.string().trim().min(1).max(5000),
    source: z.string().trim().min(1).max(40).default('angelo'),
    year: z.number().int().min(1990).max(2100).nullable().optional(),
    examType: z.string().trim().min(1).max(40).default('custom'),
    marks: z.number().int().min(1).max(100),
    difficulty: z.number().int().min(1).max(3),
    isMultipleChoice: z.boolean().default(true),
    isApproved: z.boolean().default(false),
    options: z.array(QuestionOptionSchema).max(6).default([]),
    steps: z.array(QuestionStepSchema).max(50).default([]),
  })
  .refine(
    (q) => !q.isMultipleChoice || q.options.some((o) => o.isCorrect),
    { message: 'a multiple-choice question needs exactly one correct option', path: ['options'] }
  )
  .refine(
    (q) => !q.isMultipleChoice || q.options.filter((o) => o.isCorrect).length === 1,
    { message: 'only one option may be marked correct', path: ['options'] }
  )

export async function GET(request: NextRequest) {
  try {
    await requireAdmin()
  } catch (err) {
    return authErrorResponse(err)
  }

  try {
    const { searchParams } = new URL(request.url)
    const topicId = searchParams.get('topicId')

    if (!topicId) {
      return NextResponse.json(
        { error: 'Missing topicId' },
        { status: 400 }
      )
    }

    const questions = await getQuestionsForTopic(topicId)
    return NextResponse.json({ questions })
  } catch (error) {
    console.error('Get questions error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    await requireAdmin()
  } catch (err) {
    return authErrorResponse(err)
  }

  try {
    const parsed = SaveQuestionSchema.safeParse(await request.json())

    if (!parsed.success) {
      // Named fields, so the editor can point at what is wrong. The old
      // message said "Missing required fields" regardless.
      return NextResponse.json(
        {
          error: 'Invalid question',
          issues: parsed.error.issues.map((issue) => ({
            field: issue.path.join('.'),
            message: issue.message,
          })),
        },
        { status: 400 }
      )
    }

    // saveQuestion takes `id?: string`; null means "new".
    const questionId = await saveQuestion({
      ...parsed.data,
      id: parsed.data.id ?? undefined,
    })

    if (questionId) {
      return NextResponse.json({ success: true, questionId })
    } else {
      return NextResponse.json(
        { error: 'Failed to save question' },
        { status: 500 }
      )
    }
  } catch (error) {
    console.error('Save question error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function DELETE(request: NextRequest) {
  try {
    await requireAdmin()
  } catch (err) {
    return authErrorResponse(err)
  }

  try {
    const body = await request.json()
    const { questionId } = body

    if (!questionId) {
      return NextResponse.json(
        { error: 'Missing questionId' },
        { status: 400 }
      )
    }

    const success = await deleteQuestion(questionId)

    if (success) {
      return NextResponse.json({ success: true })
    } else {
      return NextResponse.json(
        { error: 'Failed to delete question' },
        { status: 500 }
      )
    }
  } catch (error) {
    console.error('Delete question error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
