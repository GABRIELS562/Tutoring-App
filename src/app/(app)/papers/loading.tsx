export default function PapersLoading() {
  return (
    <div className="min-h-screen" style={{ background: 'var(--bg)' }}>
      {/* Topbar skeleton */}
      <div
        className="h-[52px] flex items-center justify-between px-4 md:px-6"
        style={{ background: 'var(--surface)', borderBottom: '1px solid var(--border-custom)' }}
      >
        <div className="space-y-1">
          <div className="h-5 w-28 rounded animate-pulse" style={{ background: 'var(--surface2)' }} />
          <div className="h-3 w-40 rounded animate-pulse" style={{ background: 'var(--surface2)' }} />
        </div>
        <div className="flex items-center gap-3">
          <div className="h-8 w-16 rounded-full animate-pulse hidden sm:block" style={{ background: 'var(--surface2)' }} />
          <div className="h-9 w-9 rounded-full animate-pulse" style={{ background: 'var(--surface2)' }} />
        </div>
      </div>

      <div className="p-4 md:p-6 max-w-6xl mx-auto">
        {/* Header skeleton */}
        <div className="mb-6">
          <div className="h-8 w-48 rounded animate-pulse mb-2" style={{ background: 'var(--surface2)' }} />
          <div className="h-4 w-72 rounded animate-pulse" style={{ background: 'var(--surface2)' }} />
        </div>

        {/* Filters skeleton */}
        <div
          className="rounded-xl p-4 mb-6"
          style={{ background: 'var(--surface)', border: '1px solid var(--border-custom)' }}
        >
          <div className="flex flex-wrap gap-3">
            {[1, 2, 3, 4].map((i) => (
              <div
                key={i}
                className="h-10 w-28 rounded-lg animate-pulse"
                style={{ background: 'var(--surface2)' }}
              />
            ))}
          </div>
        </div>

        {/* Paper cards grid skeleton */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div
              key={i}
              className="rounded-xl p-5"
              style={{ background: 'var(--surface)', border: '1px solid var(--border-custom)' }}
            >
              {/* Paper header */}
              <div className="flex items-start justify-between mb-3">
                <div className="space-y-1">
                  <div className="h-5 w-32 rounded animate-pulse" style={{ background: 'var(--surface2)' }} />
                  <div className="h-4 w-24 rounded animate-pulse" style={{ background: 'var(--surface2)' }} />
                </div>
                <div className="h-8 w-8 rounded-lg animate-pulse" style={{ background: 'var(--surface2)' }} />
              </div>

              {/* Tags */}
              <div className="flex flex-wrap gap-2 mb-4">
                <div className="h-6 w-16 rounded-full animate-pulse" style={{ background: 'var(--surface2)' }} />
                <div className="h-6 w-20 rounded-full animate-pulse" style={{ background: 'var(--surface2)' }} />
                <div className="h-6 w-14 rounded-full animate-pulse" style={{ background: 'var(--surface2)' }} />
              </div>

              {/* Actions */}
              <div className="flex gap-2">
                <div className="h-9 flex-1 rounded-lg animate-pulse" style={{ background: 'var(--surface2)' }} />
                <div className="h-9 flex-1 rounded-lg animate-pulse" style={{ background: 'var(--surface2)' }} />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
