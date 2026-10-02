'use client'

import { useCallback, useEffect, useState } from 'react'
import { AlertTriangle, Loader2 } from 'lucide-react'
import { useTranslations } from 'next-intl'
import CertificateGenerator from '@/components/ai/CertificateGenerator'

interface CertificateInfo {
  studentName: string
  certificateId: string
  avgPromptScore: number
  modulesCompleted: number
  issuedAt: string
}

type IssueState =
  | { status: 'loading' }
  | { status: 'error'; message: string }
  | { status: 'ready'; certificate: CertificateInfo }

/**
 * Certificate issuance is server-side (POST /api/ai-skills/issue-certificate,
 * requireUser + service-role client) - this client component's only job is
 * to trigger that call and render whatever it returns. It never inserts
 * anything into Supabase itself.
 */
export default function IssueCertificate() {
  const t = useTranslations('aiSkills')
  const [state, setState] = useState<IssueState>({ status: 'loading' })

  // No setState call before the first `await` here: the initial mount
  // already renders the 'loading' state from useState's default, so this
  // only needs to set state once the fetch resolves. That keeps the
  // useEffect below free of a synchronous setState call (react-hooks/set-state-in-effect) -
  // resetting to 'loading' for a retry is handled explicitly by handleRetry.
  const issueCertificate = useCallback(async () => {
    try {
      const res = await fetch('/api/ai-skills/issue-certificate', { method: 'POST' })
      const data = await res.json()

      if (!res.ok) {
        setState({
          status: 'error',
          message: data.error || 'Something went wrong while generating your certificate.',
        })
        return
      }

      setState({ status: 'ready', certificate: data.certificate })
    } catch {
      setState({ status: 'error', message: 'Failed to connect. Please try again.' })
    }
  }, [])

  const handleRetry = useCallback(() => {
    setState({ status: 'loading' })
    issueCertificate()
  }, [issueCertificate])

  // react-hooks/set-state-in-effect flags this because its static analysis
  // finds a setState call reachable anywhere inside issueCertificate
  // (including its post-await continuation) - it can't distinguish that
  // from the synchronous-derived-state anti-pattern the rule exists to
  // catch. This is the standard "fetch data on mount" effect
  // (https://react.dev/learn/synchronizing-with-effects#fetching-data):
  // issueCertificate calls POST /api/ai-skills/issue-certificate once on
  // mount and sets state only after that request resolves, not
  // synchronously during the effect. No data-fetching library is set up
  // in this project to sidestep the rule the "proper" way.
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    issueCertificate()
  }, [issueCertificate])

  if (state.status === 'loading') {
    return (
      <div
        className="rounded-xl p-8 text-center space-y-4"
        style={{ background: 'var(--surface)', border: '1px solid var(--border-custom)' }}
      >
        <Loader2 className="w-8 h-8 mx-auto animate-spin text-muted-custom" />
        <p className="text-sm text-muted-custom">{t('generatingCertificate')}</p>
      </div>
    )
  }

  if (state.status === 'error') {
    return (
      <div
        className="rounded-xl p-8 text-center space-y-4"
        style={{ background: 'var(--surface)', border: '1px solid var(--border-custom)' }}
      >
        <div
          className="w-16 h-16 rounded-full flex items-center justify-center mx-auto"
          style={{ background: 'var(--surface2)' }}
        >
          <AlertTriangle className="w-8 h-8 text-muted-custom" />
        </div>
        {/* h2: rendered inside the certificate page, which has a Topbar h1. */}
        <h2 className="text-xl font-bold" style={{ color: 'var(--text)' }}>{t('certificateFailed')}</h2>
        <p className="text-sm text-muted-custom max-w-md mx-auto">
          {state.message} Please try again - if this keeps happening, let us know.
        </p>
        <button
          onClick={handleRetry}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium"
          style={{ background: 'var(--ai-purple)', color: 'white' }}
        >{t('tryAgain')}</button>
      </div>
    )
  }

  return (
    <CertificateGenerator
      studentName={state.certificate.studentName}
      certificateId={state.certificate.certificateId}
      avgPromptScore={state.certificate.avgPromptScore}
      modulesCompleted={state.certificate.modulesCompleted}
      issuedAt={state.certificate.issuedAt}
    />
  )
}
