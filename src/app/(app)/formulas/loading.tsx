import { Loader2 } from 'lucide-react'

export default function FormulasLoading() {
  return (
    <div className="min-h-screen" style={{ background: 'var(--bg)' }}>
      {/* Skeleton Topbar */}
      <div
        className="h-[52px] flex items-center px-4"
        style={{ background: 'var(--surface)', borderBottom: '1px solid var(--border-custom)' }}
      >
        <div className="h-5 w-32 rounded animate-pulse" style={{ background: 'var(--surface2)' }} />
      </div>

      <div className="p-4 md:p-6 max-w-4xl mx-auto">
        {/* Skeleton Badge */}
        <div
          className="h-6 w-28 rounded-full mb-4 animate-pulse"
          style={{ background: 'var(--surface2)' }}
        />

        {/* Skeleton Filters */}
        <div
          className="rounded-xl p-4 mb-6"
          style={{ background: 'var(--surface)', border: '1px solid var(--border-custom)' }}
        >
          <div
            className="h-10 rounded-lg mb-4 animate-pulse"
            style={{ background: 'var(--surface2)' }}
          />
          <div className="flex gap-3">
            <div
              className="h-10 w-48 rounded-lg animate-pulse"
              style={{ background: 'var(--surface2)' }}
            />
            <div
              className="h-10 w-36 rounded-lg animate-pulse"
              style={{ background: 'var(--surface2)' }}
            />
          </div>
        </div>

        {/* Loading Indicator */}
        <div className="flex flex-col items-center justify-center py-16">
          <Loader2
            className="w-8 h-8 animate-spin mb-3"
            style={{ color: 'var(--accent-red-text)' }}
          />
          <p className="text-sm" style={{ color: 'var(--muted-custom)' }}>
            Loading formulas...
          </p>
        </div>

        {/* Skeleton Cards */}
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="rounded-xl p-4 animate-pulse"
              style={{ background: 'var(--surface)', border: '1px solid var(--border-custom)' }}
            >
              <div className="flex items-center gap-3 mb-3">
                <div className="h-4 w-4 rounded" style={{ background: 'var(--surface2)' }} />
                <div className="h-5 w-40 rounded" style={{ background: 'var(--surface2)' }} />
              </div>
              <div className="h-16 rounded-lg" style={{ background: 'var(--surface2)' }} />
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
