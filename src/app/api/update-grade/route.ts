import { NextRequest, NextResponse } from 'next/server'
import { updateUserGrade } from '@/db/queries/progress'
import { isDemoMode } from '@/db'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { userId, grade } = body

    if (!userId || !grade) {
      return NextResponse.json(
        { error: 'Missing userId or grade' },
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
