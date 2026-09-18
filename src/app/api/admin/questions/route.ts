import { NextRequest, NextResponse } from 'next/server'
import { getQuestionsForTopic, saveQuestion, deleteQuestion } from '@/db/queries/admin'
import { requireAdmin, authErrorResponse } from '@/lib/auth/require-user'

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
    const body = await request.json()
    const {
      id,
      topicId,
      questionText,
      source,
      year,
      examType,
      marks,
      difficulty,
      isMultipleChoice,
      isApproved,
      options,
      steps,
    } = body

    if (!topicId || !questionText || !marks || !difficulty) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    const questionId = await saveQuestion({
      id,
      topicId,
      questionText,
      source: source || 'angelo',
      year,
      examType: examType || 'custom',
      marks,
      difficulty,
      isMultipleChoice: isMultipleChoice ?? true,
      isApproved: isApproved ?? false,
      options: options || [],
      steps: steps || [],
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
