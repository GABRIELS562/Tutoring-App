import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { createTopic, deleteTopic } from '@/db/queries/admin'
import { requireAdmin, authErrorResponse } from '@/lib/auth/require-user'

/**
 * Every other write boundary in this app validates with Zod
 * (HintRequestSchema, CompleteModuleSchema, the server actions); these
 * admin routes only truthy-checked a few fields and passed the rest of an
 * untyped body straight into a Drizzle insert. TypeScript cannot help -
 * the values are `any`, so the assignment to CreateTopicInput type-checks
 * while nothing is verified at runtime. A string where a number belongs,
 * or a renamed field from a future editor change, reached Postgres as a
 * generic 500 or landed as a NULL in a nullable column, producing a
 * malformed topic with no field-level diagnostic.
 *
 * Bounds mirror the schema: subject is the two real values, grade and
 * paper are the CAPS ranges, and the slug is restricted to the shape the
 * content registry and every URL already assume.
 */
const CreateTopicSchema = z.object({
  name: z.string().trim().min(1).max(120),
  subject: z.enum(['maths', 'science']),
  grade: z.number().int().min(8).max(12),
  slug: z
    .string()
    .trim()
    .min(1)
    .max(80)
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, 'slug must be lowercase words separated by hyphens'),
  paper: z.number().int().min(1).max(2).nullable().optional(),
  term: z.number().int().min(1).max(4).nullable().optional(),
  capsWeightPercent: z.number().int().min(0).max(100).nullable().optional(),
  sortOrder: z.number().int().min(0).max(999).nullable().optional(),
})

export async function POST(request: NextRequest) {
  try {
    await requireAdmin()
  } catch (err) {
    return authErrorResponse(err)
  }

  try {
    const parsed = CreateTopicSchema.safeParse(await request.json())

    if (!parsed.success) {
      // Name the offending fields. The old message listed the four
      // required ones whatever was actually wrong, so a bad `grade` read
      // as a missing `name`.
      return NextResponse.json(
        {
          error: 'Invalid topic',
          issues: parsed.error.issues.map((issue) => ({
            field: issue.path.join('.'),
            message: issue.message,
          })),
        },
        { status: 400 }
      )
    }

    const topicId = await createTopic(parsed.data)

    if (topicId) {
      return NextResponse.json({ success: true, topicId })
    } else {
      return NextResponse.json(
        { error: 'Failed to create topic. Slug may already exist.' },
        { status: 500 }
      )
    }
  } catch (error) {
    console.error('Create topic error:', error)
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
    const { topicId } = body

    if (!topicId) {
      return NextResponse.json(
        { error: 'Missing topicId' },
        { status: 400 }
      )
    }

    const result = await deleteTopic(topicId)

    if (result.ok) {
      return NextResponse.json({ success: true })
    }

    // 409, not 500: the request is understood and the database is healthy,
    // the topic simply still has questions attached.
    if (result.reason === 'has-questions') {
      return NextResponse.json(
        {
          error:
            'This topic still has questions. Move or delete them first, then delete the topic.',
        },
        { status: 409 }
      )
    }

    return NextResponse.json(
      { error: 'Failed to delete topic' },
      { status: 500 }
    )
  } catch (error) {
    console.error('Delete topic error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
