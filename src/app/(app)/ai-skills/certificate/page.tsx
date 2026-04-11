import { redirect } from 'next/navigation'
import { cookies } from 'next/headers'
import { createServerClient } from '@supabase/ssr'
import Link from 'next/link'
import { ArrowLeft, Lock } from 'lucide-react'
import { moduleOrder } from '@/content/ai-skills'
import CertificateGenerator from '@/components/ai/CertificateGenerator'

export const metadata = {
  title: 'AI Literacy Certificate | Angelo Tutoring',
  description: 'Download your AI Literacy Certificate from Angelo Tutoring. Prove your AI skills to employers with a verifiable digital credential.',
}

function generateCertificateId(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'
  let id = 'AT-2026-'
  for (let i = 0; i < 4; i++) {
    id += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return id
}

async function getCertificateData() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!supabaseUrl || !supabaseKey) {
    // Demo mode
    return {
      isEligible: true,
      certificate: {
        studentName: 'Demo Student',
        certificateId: 'AT-2026-DEMO',
        avgPromptScore: 4.2,
        modulesCompleted: 5,
        issuedAt: new Date().toISOString(),
      },
    }
  }

  const cookieStore = await cookies()
  const supabase = createServerClient(supabaseUrl, supabaseKey, {
    cookies: {
      getAll() {
        return cookieStore.getAll()
      },
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) =>
            cookieStore.set(name, value, options)
          )
        } catch {
          // Ignore
        }
      },
    },
  })

  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  // Get user data
  const { data: userData } = await supabase
    .from('users')
    .select('name, ai_modules_completed')
    .eq('id', user.id)
    .single()

  const completedModules = userData?.ai_modules_completed || []
  const isEligible = moduleOrder.every((id) => completedModules.includes(id))

  if (!isEligible) {
    return { isEligible: false, certificate: null }
  }

  // Check for existing certificate
  const { data: existingCert } = await supabase
    .from('ai_certificates')
    .select('*')
    .eq('user_id', user.id)
    .single()

  if (existingCert) {
    return {
      isEligible: true,
      certificate: {
        studentName: existingCert.student_name,
        certificateId: existingCert.certificate_id,
        avgPromptScore: parseFloat(existingCert.avg_prompt_score || '4.0'),
        modulesCompleted: existingCert.modules_completed,
        issuedAt: existingCert.issued_at,
      },
    }
  }

  // Get average prompt score
  const { data: attempts } = await supabase
    .from('prompt_challenge_attempts')
    .select('ai_score')
    .eq('user_id', user.id)

  const avgScore = attempts && attempts.length > 0
    ? attempts.reduce((sum, a) => sum + (a.ai_score || 0), 0) / attempts.length
    : 4.0

  // Create new certificate
  const newCertId = generateCertificateId()
  const studentName = userData?.name || 'Student'

  const { error } = await supabase.from('ai_certificates').insert({
    user_id: user.id,
    certificate_id: newCertId,
    student_name: studentName,
    avg_prompt_score: avgScore,
    modules_completed: 5,
  })

  if (error) {
    console.error('Error creating certificate:', error)
  }

  return {
    isEligible: true,
    certificate: {
      studentName,
      certificateId: newCertId,
      avgPromptScore: avgScore,
      modulesCompleted: 5,
      issuedAt: new Date().toISOString(),
    },
  }
}

export default async function CertificatePage() {
  const { isEligible, certificate } = await getCertificateData()

  if (!isEligible) {
    return (
      <div className="p-4 md:p-6 max-w-2xl mx-auto space-y-6">
        <Link
          href="/ai-skills"
          className="inline-flex items-center gap-2 text-sm hover:text-ai-purple transition-colors"
          style={{ color: 'var(--muted-custom)' }}
        >
          <ArrowLeft className="w-4 h-4" />
          Back to AI Skills
        </Link>

        <div
          className="rounded-xl p-8 text-center space-y-4"
          style={{ background: 'var(--surface)', border: '1px solid var(--border-custom)' }}
        >
          <div
            className="w-16 h-16 rounded-full flex items-center justify-center mx-auto"
            style={{ background: 'var(--surface2)' }}
          >
            <Lock className="w-8 h-8 text-muted-custom" />
          </div>
          <h1 className="text-xl font-bold" style={{ color: 'var(--text)' }}>
            Certificate Locked
          </h1>
          <p className="text-sm text-muted-custom max-w-md mx-auto">
            Complete all 5 AI Literacy modules to unlock your certificate. This verifiable credential proves your AI skills to employers.
          </p>
          <Link
            href="/ai-skills"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium"
            style={{ background: 'var(--ai-purple)', color: 'white' }}
          >
            Continue Learning
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="p-4 md:p-6 max-w-2xl mx-auto space-y-6">
      <Link
        href="/ai-skills"
        className="inline-flex items-center gap-2 text-sm hover:text-ai-purple transition-colors"
        style={{ color: 'var(--muted-custom)' }}
      >
        <ArrowLeft className="w-4 h-4" />
        Back to AI Skills
      </Link>

      <div className="text-center space-y-2">
        <h1 className="text-2xl font-bold" style={{ color: 'var(--text)' }}>
          Your AI Literacy Certificate
        </h1>
        <p className="text-sm text-muted-custom">
          Congratulations! Download and share your verifiable credential.
        </p>
      </div>

      {certificate && (
        <CertificateGenerator
          studentName={certificate.studentName}
          certificateId={certificate.certificateId}
          avgPromptScore={certificate.avgPromptScore}
          modulesCompleted={certificate.modulesCompleted}
          issuedAt={certificate.issuedAt}
        />
      )}
    </div>
  )
}
