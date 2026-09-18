import { NextRequest, NextResponse } from 'next/server'
import { getQuestionById } from '@/db/queries/admin'
import { requireAdmin, authErrorResponse } from '@/lib/auth/require-user'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ questionId: string }> }
) {
  try {
    await requireAdmin()
  } catch (err) {
    return authErrorResponse(err)
  }

  try {
    const { questionId } = await params

    if (!questionId) {
      return NextResponse.json(
        { error: 'Missing questionId' },
        { status: 400 }
      )
    }

    const question = await getQuestionById(questionId)

    if (!question) {
      return NextResponse.json(
        { error: 'Question not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({ question })
  } catch (error) {
    console.error('Get question error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
