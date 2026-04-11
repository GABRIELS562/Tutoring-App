'use client'

import { AlertCircle, RefreshCw } from 'lucide-react'

export default function AISkillsError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return (
    <div className="p-4 md:p-6 max-w-2xl mx-auto">
      <div
        className="rounded-xl p-8 text-center space-y-4"
        style={{ background: 'var(--surface)', border: '1px solid var(--border-custom)' }}
      >
        <div
          className="w-16 h-16 rounded-full flex items-center justify-center mx-auto"
          style={{ background: 'rgba(230, 57, 70, 0.1)' }}
        >
          <AlertCircle className="w-8 h-8 text-accent-red" />
        </div>

        <h1 className="text-xl font-bold" style={{ color: 'var(--text)' }}>
          Something went wrong
        </h1>

        <p className="text-sm text-muted-custom">
          {error.message || 'Failed to load AI Skills. Please try again.'}
        </p>

        <button
          onClick={reset}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all"
          style={{ background: 'var(--ai-purple)', color: 'white' }}
        >
          <RefreshCw className="w-4 h-4" />
          Try Again
        </button>
      </div>
    </div>
  )
}
