import { NextResponse } from 'next/server'
import { requireUser, authErrorResponse } from '@/lib/auth/require-user'
import { getApiSupabase } from '@/lib/supabase/api'
import { moduleOrder } from '@/content/ai-skills'
import { createCertificateWithRetry } from '@/lib/certificates/create-certificate'

const DEFAULT_AVG_SCORE = 4.0

interface IssuedCertificate {
  studentName: string
  certificateId: string
  avgPromptScore: number
  modulesCompleted: number
  issuedAt: string
}

/**
 * Certificate issuance, server-side only. Previously the certificate page
 * inserted the ai_certificates row itself, client-side, using the
 * visitor's own anon-key session - the RLS migration removes the INSERT
 * policy that allowed that entirely, so this route (using the
 * service-role client, which bypasses RLS) is now the only way a
 * certificate row gets created.
 *
 * Eligibility (all 5 AI-literacy modules completed) and the average
 * prompt-challenge score are both computed here from the user's own DB
 * rows - never trusted from the request, which carries no body at all.
 */
export async function POST() {
  let user
  try {
    user = await requireUser()
  } catch (err) {
    return authErrorResponse(err)
  }

  const supabase = getApiSupabase()

  if (!supabase) {
    const demoCertificate: IssuedCertificate = {
      studentName: 'Demo Student',
      certificateId: 'AT-2026-DEMO',
      avgPromptScore: 4.2,
      modulesCompleted: 5,
      issuedAt: new Date().toISOString(),
    }
    return NextResponse.json({ certificate: demoCertificate })
  }

  try {
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('name, ai_modules_completed')
      .eq('id', user.id)
      .single()

    if (userError || !userData) {
      console.error('Error fetching user for certificate issuance:', userError)
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    const completedModules: string[] = userData.ai_modules_completed || []
    const isEligible = moduleOrder.every((id) => completedModules.includes(id))

    if (!isEligible) {
      return NextResponse.json(
        { error: 'Complete all 5 AI Literacy modules to unlock your certificate.' },
        { status: 403 }
      )
    }

    // Idempotent: a certificate already issued for this user is returned
    // as-is rather than erroring or minting a duplicate.
    const { data: existingCert, error: existingCertError } = await supabase
      .from('ai_certificates')
      .select('*')
      .eq('user_id', user.id)
      .maybeSingle()

    if (existingCertError) {
      console.error('Error checking for an existing certificate:', existingCertError)
      return NextResponse.json({ error: 'Failed to check certificate status' }, { status: 500 })
    }

    if (existingCert) {
      const certificate: IssuedCertificate = {
        studentName: existingCert.student_name,
        certificateId: existingCert.certificate_id,
        avgPromptScore: parseFloat(existingCert.avg_prompt_score || String(DEFAULT_AVG_SCORE)),
        modulesCompleted: existingCert.modules_completed,
        issuedAt: existingCert.issued_at,
      }
      return NextResponse.json({ certificate })
    }

    const { data: attempts } = await supabase
      .from('prompt_challenge_attempts')
      .select('ai_score')
      .eq('user_id', user.id)

    const avgPromptScore =
      attempts && attempts.length > 0
        ? attempts.reduce((sum: number, a: { ai_score: number | null }) => sum + (a.ai_score || 0), 0) /
          attempts.length
        : DEFAULT_AVG_SCORE

    const studentName = userData.name || 'Student'

    const { certificateId, error } = await createCertificateWithRetry(supabase, {
      userId: user.id,
      studentName,
      avgPromptScore,
    })

    if (error || !certificateId) {
      return NextResponse.json({ error: error || 'Failed to create certificate' }, { status: 500 })
    }

    const certificate: IssuedCertificate = {
      studentName,
      certificateId,
      avgPromptScore,
      modulesCompleted: 5,
      issuedAt: new Date().toISOString(),
    }

    return NextResponse.json({ certificate })
  } catch (error) {
    console.error('Certificate issuance error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
