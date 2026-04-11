import { NextRequest, NextResponse } from 'next/server'
import { createTopic, deleteTopic } from '@/db/queries/admin'

export async function POST(request: NextRequest) {
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
    const body = await request.json()
    const { topicId } = body

    if (!topicId) {
      return NextResponse.json(
        { error: 'Missing topicId' },
        { status: 400 }
      )
    }

    const success = await deleteTopic(topicId)

    if (success) {
      return NextResponse.json({ success: true })
    } else {
      return NextResponse.json(
        { error: 'Failed to delete topic' },
        { status: 500 }
      )
    }
  } catch (error) {
    console.error('Delete topic error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
