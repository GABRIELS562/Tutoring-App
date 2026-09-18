import type { SupabaseClient } from '@supabase/supabase-js'
import { generateCertificateId } from '@/lib/certificate-id'

const MAX_ATTEMPTS = 3
const POSTGRES_UNIQUE_VIOLATION = '23505'

export interface CreateCertificateInput {
  userId: string
  studentName: string
  avgPromptScore: number
}

export interface CreateCertificateResult {
  certificateId?: string
  error?: string
}

/**
 * Inserts a new ai_certificates row with a fresh crypto-random
 * certificate_id, retrying with a new id up to MAX_ATTEMPTS times if the
 * unique constraint on certificate_id is hit (Postgres 23505). Any other
 * insert error is surfaced immediately without retrying.
 *
 * Never returns a certificateId that was not actually persisted - callers
 * must treat a returned `error` as "no certificate was created" rather
 * than rendering one anyway.
 */
export async function createCertificateWithRetry(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  supabase: SupabaseClient<any, any, any>,
  input: CreateCertificateInput
): Promise<CreateCertificateResult> {
  const year = new Date().getFullYear()

  for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt++) {
    const certificateId = generateCertificateId(year)

    const { error } = await supabase.from('ai_certificates').insert({
      user_id: input.userId,
      certificate_id: certificateId,
      student_name: input.studentName,
      avg_prompt_score: input.avgPromptScore,
      modules_completed: 5,
    })

    if (!error) {
      return { certificateId }
    }

    if (error.code !== POSTGRES_UNIQUE_VIOLATION) {
      console.error('Error creating certificate:', error)
      return { error: 'Failed to create certificate.' }
    }

    console.warn(
      `Certificate id collision on attempt ${attempt}/${MAX_ATTEMPTS}, retrying with a new id`
    )
  }

  return { error: 'Failed to create a unique certificate id after multiple attempts.' }
}
