import Link from 'next/link'
import { CheckCircle2, XCircle } from 'lucide-react'
import { lookupCertificate, type VerifiedCertificate } from '@/lib/certificates/verify-certificate'

interface VerifyPageProps {
  params: Promise<{ certificateId: string }>
}

export async function generateMetadata({ params }: VerifyPageProps) {
  const { certificateId } = await params
  return {
    title: `Verify Certificate ${certificateId} | Angelo Tutoring`,
    description: 'Verify an AI Literacy Certificate issued by Angelo Tutoring.',
  }
}

/**
 * Public, unauthenticated, human-readable certificate verification page.
 * QR codes and shared links (see CertificateGenerator.tsx) point here
 * rather than at the JSON API route - an employer scanning the QR code
 * should see a readable "valid certificate" card, not raw JSON. Uses the
 * exact same lookupCertificate() the API route uses, so both surfaces
 * agree on what counts as a valid certificate.
 *
 * Not under (app)/(admin) - no session/auth is required or expected, and
 * src/middleware.ts's protected-route list does not include /verify.
 */
export default async function VerifyCertificatePage({ params }: VerifyPageProps) {
  const { certificateId } = await params
  const certificate = await lookupCertificate(certificateId)

  return (
    <div
      className="min-h-screen flex items-center justify-center p-4"
      style={{ background: 'var(--bg)' }}
    >
      {certificate ? (
        <ValidCertificateCard certificate={certificate} />
      ) : (
        <NotFoundCard certificateId={certificateId} />
      )}
    </div>
  )
}

function ValidCertificateCard({ certificate }: { certificate: VerifiedCertificate }) {
  const formattedDate = new Date(certificate.issuedAt).toLocaleDateString('en-ZA', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })

  return (
    <div
      className="max-w-md w-full rounded-xl p-8 text-center space-y-5"
      style={{ background: 'var(--surface)', border: '1px solid var(--teal)' }}
    >
      <div
        className="w-16 h-16 rounded-full flex items-center justify-center mx-auto"
        style={{ background: 'rgba(42, 157, 143, 0.15)' }}
      >
        <CheckCircle2 className="w-8 h-8" style={{ color: 'var(--teal)' }} />
      </div>

      <div>
        <p
          className="text-xs font-semibold uppercase tracking-wide"
          style={{ color: 'var(--teal)' }}
        >
          Valid certificate
        </p>
        <h1 className="text-xl font-bold mt-1" style={{ color: 'var(--text)' }}>
          {certificate.studentName}
        </h1>
        <p className="text-sm mt-1" style={{ color: 'var(--muted-custom)' }}>
          has successfully completed the{' '}
          <strong style={{ color: 'var(--text)' }}>{certificate.course}</strong>
        </p>
      </div>

      <div
        className="grid grid-cols-2 gap-4 text-left text-sm rounded-lg p-4"
        style={{ background: 'var(--surface2)' }}
      >
        <div>
          <p style={{ color: 'var(--muted-custom)' }}>Issued</p>
          <p className="font-medium" style={{ color: 'var(--text)' }}>{formattedDate}</p>
        </div>
        <div>
          <p style={{ color: 'var(--muted-custom)' }}>Modules completed</p>
          <p className="font-medium" style={{ color: 'var(--text)' }}>
            {certificate.modulesCompleted} / 5
          </p>
        </div>
        <div>
          <p style={{ color: 'var(--muted-custom)' }}>Average score</p>
          <p className="font-medium" style={{ color: 'var(--text)' }}>
            {certificate.avgPromptScore.toFixed(1)} / 5
          </p>
        </div>
        <div>
          <p style={{ color: 'var(--muted-custom)' }}>Certificate ID</p>
          <p className="font-mono text-xs break-all" style={{ color: 'var(--text)' }}>
            {certificate.certificateId}
          </p>
        </div>
      </div>

      <p className="text-xs" style={{ color: 'var(--muted-custom)' }}>
        Issued by {certificate.issuer}
      </p>
    </div>
  )
}

function NotFoundCard({ certificateId }: { certificateId: string }) {
  return (
    <div
      className="max-w-md w-full rounded-xl p-8 text-center space-y-4"
      style={{ background: 'var(--surface)', border: '1px solid var(--border-custom)' }}
    >
      <div
        className="w-16 h-16 rounded-full flex items-center justify-center mx-auto"
        style={{ background: 'rgba(230, 57, 70, 0.15)' }}
      >
        <XCircle className="w-8 h-8" style={{ color: 'var(--accent-red)' }} />
      </div>
      <h1 className="text-xl font-bold" style={{ color: 'var(--text)' }}>
        Certificate not found
      </h1>
      <p className="text-sm" style={{ color: 'var(--muted-custom)' }}>
        We couldn&apos;t find a certificate with ID{' '}
        <code className="font-mono break-all">{certificateId}</code>. Double-check
        the link or QR code and try again.
      </p>
      <Link
        href="/"
        className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium"
        style={{ background: 'var(--ai-purple)', color: 'white' }}
      >
        Go to Angelo Tutoring
      </Link>
    </div>
  )
}
