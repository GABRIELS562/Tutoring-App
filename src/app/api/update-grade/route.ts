import { NextRequest, NextResponse } from 'next/server'
import { updateUserGrade } from '@/db/queries/progress'
import { isDemoMode } from '@/db'
import { requireUser, authErrorResponse } from '@/lib/auth/require-user'

export async function POST(request: NextRequest) {
  let user
  try {
    user = await requireUser()
  } catch (err) {
    return authErrorResponse(err)
  }

  try {
    const body = await request.json()
    const { grade } = body
    const userId = user.id

    if (!grade) {
      return NextResponse.json(
        { error: 'Missing grade' },
        { status: 400 }
      )
    }

    if (![10, 11, 12].includes(grade)) {
      return NextResponse.json(
        { error: 'Invalid grade. Must be 10, 11, or 12.' },
        { status: 400 }
      )
    }

    // In demo mode, just return success without touching the database
    if (isDemoMode || userId === 'demo-user') {
      return NextResponse.json({ success: true, demo: true })
    }

    const success = await updateUserGrade(userId, grade)

    if (success) {
      return NextResponse.json({ success: true })
    } else {
      return NextResponse.json(
        { error: 'Failed to update grade' },
        { status: 500 }
      )
    }
  } catch (error) {
    console.error('Update grade error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
