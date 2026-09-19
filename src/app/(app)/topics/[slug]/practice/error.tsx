'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { AlertCircle, RefreshCw } from 'lucide-react'
import { useTranslations } from 'next-intl'

export default function PracticeError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  const router = useRouter()
  const t = useTranslations('common')
  const tPractice = useTranslations('practice')

  useEffect(() => {
    console.error('Practice error:', error)
  }, [error])

  const handleRetry = () => {
    reset()
    router.refresh()
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4" style={{ background: 'var(--bg)' }}>
      <div
        className="max-w-md w-full rounded-xl p-6 text-center"
        style={{ background: 'var(--surface)', border: '1px solid var(--border-custom)' }}
      >
        <div
          className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4"
          style={{ background: 'rgba(230, 57, 70, 0.15)' }}
        >
          <AlertCircle className="w-8 h-8" style={{ color: 'var(--accent-red)' }} />
        </div>
        <h2 className="text-xl font-bold mb-2" style={{ color: 'var(--text)' }}>
          {t('error')}
        </h2>
        <p className="text-sm mb-6" style={{ color: 'var(--muted-custom)' }}>
          {tPractice('loadErrorMessage')}
        </p>
        <button
          onClick={handleRetry}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors"
          style={{ background: 'var(--accent-red)', color: 'white' }}
        >
          <RefreshCw className="w-4 h-4" />
          {t('retry')}
        </button>
      </div>
    </div>
  )
}
