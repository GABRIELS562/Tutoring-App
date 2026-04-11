'use client'

import { AlertTriangle, RefreshCw } from 'lucide-react'

type ErrorProps = {
  error: Error & { digest?: string }
  reset: () => void
}

export default function FormulasError({ error, reset }: ErrorProps) {
  return (
    <div className="min-h-screen" style={{ background: 'var(--bg)' }}>
      {/* Topbar placeholder */}
      <div
        className="h-[52px] flex items-center px-4"
        style={{ background: 'var(--surface)', borderBottom: '1px solid var(--border-custom)' }}
      >
        <span className="font-semibold" style={{ color: 'var(--text)' }}>
          Formula Sheet
        </span>
      </div>

      <div className="p-4 md:p-6 max-w-4xl mx-auto">
        <div
          className="rounded-xl p-8 text-center"
          style={{ background: 'var(--surface)', border: '1px solid var(--border-custom)' }}
        >
          <AlertTriangle
            className="w-12 h-12 mx-auto mb-4"
            style={{ color: 'var(--accent-red)' }}
          />
          <h2
            className="text-lg font-semibold mb-2"
            style={{ color: 'var(--text)' }}
          >
            Something went wrong
          </h2>
          <p
            className="text-sm mb-6"
            style={{ color: 'var(--muted-custom)' }}
          >
            {error.message || 'Failed to load the formula sheet. Please try again.'}
          </p>
          <button
            onClick={reset}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg font-medium text-white transition-all hover:opacity-90"
            style={{ background: 'var(--accent-red)' }}
          >
            <RefreshCw className="w-4 h-4" />
            Try again
          </button>
        </div>
      </div>
    </div>
  )
}
