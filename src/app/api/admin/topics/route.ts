import { NextRequest, NextResponse } from 'next/server'
import { createTopic, deleteTopic } from '@/db/queries/admin'
import { requireAdmin, authErrorResponse } from '@/lib/auth/require-user'

export async function POST(request: NextRequest) {
  try {
    await requireAdmin()
  } catch (err) {
    return authErrorResponse(err)
  }

  try {
    const body = await request.json()
    const { name, subject, grade, paper, slug, capsWeightPercent, term, sortOrder } = body

    if (!name || !subject || !grade || !slug) {
      return NextResponse.json(
        { error: 'Missing required fields: name, subject, grade, slug' },
        { status: 400 }
      )
    }

    const topicId = await createTopic({
      name,
      subject,
      grade,
      paper,
      slug,
      capsWeightPercent,
      term,
      sortOrder,
    })

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
