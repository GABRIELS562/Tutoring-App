import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { checkRateLimit, getClientIp } from '@/lib/rate-limit'

interface RouteParams {
  params: Promise<{ certificateId: string }>
}

export async function GET(request: NextRequest, { params }: RouteParams) {
  // Public endpoint (certificate verification must not require a session),
  // so a best-effort per-IP rate limit is the only guard against scraping.
  const rateLimit = checkRateLimit(`verify:${getClientIp(request)}`)
  if (!rateLimit.allowed) {
    return NextResponse.json(
      { valid: false, error: 'Too many requests. Please try again later.' },
      { status: 429 }
    )
  }

  const { certificateId } = await params

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  // Demo mode response
  if (!supabaseUrl || !supabaseKey) {
    if (certificateId === 'AT-2026-DEMO') {
      return NextResponse.json({
        valid: true,
        certificate: {
          studentName: 'Demo Student',
          certificateId: 'AT-2026-DEMO',
          issuedAt: new Date().toISOString(),
          modulesCompleted: 5,
          avgPromptScore: 4.2,
          issuer: 'Angelo Tutoring',
          course: 'AI Literacy Curriculum',
        },
      })
    }

    return NextResponse.json(
      { valid: false, error: 'Certificate not found' },
      { status: 404 }
    )
  }

  try {
    const supabase = createClient(supabaseUrl, supabaseKey)

    // Reads the public_certificates view, never the ai_certificates base
    // table: the RLS migration (0001_rls.sql) revokes anon SELECT on the
    // base table and only grants it on this column-restricted view, so an
    // anon-key fallback here (SUPABASE_SERVICE_ROLE_KEY unset) would
    // otherwise return zero rows. The view exposes exactly the columns
    // used below - never `id`/`user_id`.
    const { data: certificate, error } = await supabase
      .from('public_certificates')
      .select('*')
      .eq('certificate_id', certificateId)
      .single()

    if (error || !certificate) {
      return NextResponse.json(
        { valid: false, error: 'Certificate not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      valid: true,
      certificate: {
        studentName: certificate.student_name,
        certificateId: certificate.certificate_id,
        issuedAt: certificate.issued_at,
        modulesCompleted: certificate.modules_completed,
        avgPromptScore: parseFloat(certificate.avg_prompt_score || '0'),
        issuer: 'Angelo Tutoring',
        course: 'AI Literacy Curriculum',
      },
    })
  } catch (error) {
    console.error('Verification error:', error)
    return NextResponse.json(
      { valid: false, error: 'Verification failed' },
      { status: 500 }
    )
  }
}
