import { createClient } from '@supabase/supabase-js'
import { DEMO_CERTIFICATE_ID } from '@/lib/certificate-id'

export interface VerifiedCertificate {
  studentName: string
  certificateId: string
  issuedAt: string
  modulesCompleted: number
  avgPromptScore: number
  issuer: string
  course: string
}



function demoCertificate(): VerifiedCertificate {
  return {
    studentName: 'Demo Student',
    certificateId: DEMO_CERTIFICATE_ID,
    issuedAt: new Date().toISOString(),
    modulesCompleted: 5,
    avgPromptScore: 4.2,
    issuer: 'Angelo Tutoring',
    course: 'AI Literacy Curriculum',
  }
}

/**
 * Looks up a certificate by its public id. Shared between the JSON API
 * (src/app/api/verify/[certificateId]/route.ts) and the human-readable
 * page (src/app/verify/[certificateId]/page.tsx) so both use exactly the
 * same lookup instead of two copies drifting apart.
 *
 * Reads the public_certificates view, never the ai_certificates base
 * table: the RLS migration (supabase/migrations/0001_rls.sql) revokes
 * anon SELECT on the base table and only grants it on this
 * column-restricted view (never exposes `id`/`user_id`) - an anon-key
 * fallback here (SUPABASE_SERVICE_ROLE_KEY unset) would otherwise return
 * zero rows against the base table.
 *
 * Returns null when: Supabase isn't configured and the id isn't the demo
 * certificate; no certificate with that id exists; or the lookup itself
 * errors (fails closed - a DB hiccup must never render as "yes, this
 * certificate is valid").
 */
export async function lookupCertificate(certificateId: string): Promise<VerifiedCertificate | null> {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!supabaseUrl || !supabaseKey) {
    return certificateId === DEMO_CERTIFICATE_ID ? demoCertificate() : null
  }

  try {
    const supabase = createClient(supabaseUrl, supabaseKey)

    const { data: certificate, error } = await supabase
      .from('public_certificates')
      .select('*')
      .eq('certificate_id', certificateId)
      .single()

    if (error) {
      // Still fail closed - a hiccup must never render as "valid" - but say
      // so. Without this, a broken service key or an RLS misconfiguration
      // returns "Certificate not found" for every REAL certificate, which
      // is indistinguishable from a forgery to the person checking and
      // invisible to us.
      console.error('Certificate lookup failed:', error)
      return null
    }

    if (!certificate) {
      return null
    }

    return {
      studentName: certificate.student_name,
      certificateId: certificate.certificate_id,
      issuedAt: certificate.issued_at,
      modulesCompleted: certificate.modules_completed,
      avgPromptScore: parseFloat(certificate.avg_prompt_score || '0'),
      issuer: 'Angelo Tutoring',
      course: 'AI Literacy Curriculum',
    }
  } catch (error) {
    console.error('Certificate lookup error:', error)
    return null
  }
}
