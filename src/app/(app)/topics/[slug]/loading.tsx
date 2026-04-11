export default function TopicLoading() {
  return (
    <div className="min-h-screen" style={{ background: 'var(--bg)' }}>
      {/* Topbar skeleton */}
      <div
        className="h-[52px] flex items-center justify-between px-4 md:px-6"
        style={{ background: 'var(--surface)', borderBottom: '1px solid var(--border-custom)' }}
      >
        <div className="space-y-1">
          <div className="h-5 w-32 rounded animate-pulse" style={{ background: 'var(--surface2)' }} />
          <div className="h-3 w-24 rounded animate-pulse" style={{ background: 'var(--surface2)' }} />
        </div>
        <div className="h-9 w-9 rounded-full animate-pulse" style={{ background: 'var(--surface2)' }} />
      </div>

      <div className="max-w-4xl mx-auto p-4 md:p-6 space-y-6">
        {/* Topic header skeleton */}
        <div className="space-y-2">
          <div className="h-8 w-48 rounded animate-pulse" style={{ background: 'var(--surface2)' }} />
          <div className="h-4 w-64 rounded animate-pulse" style={{ background: 'var(--surface2)' }} />
        </div>

        {/* Progress bar skeleton */}
        <div
          className="rounded-xl p-4"
          style={{ background: 'var(--surface)', border: '1px solid var(--border-custom)' }}
        >
          <div className="flex items-center justify-between mb-2">
            <div className="h-4 w-24 rounded animate-pulse" style={{ background: 'var(--surface2)' }} />
            <div className="h-4 w-12 rounded animate-pulse" style={{ background: 'var(--surface2)' }} />
          </div>
          <div className="h-2 w-full rounded-full animate-pulse" style={{ background: 'var(--surface2)' }} />
        </div>

        {/* Table of contents skeleton (mobile dropdown) */}
        <div
          className="md:hidden rounded-xl p-4"
          style={{ background: 'var(--surface)', border: '1px solid var(--border-custom)' }}
        >
          <div className="h-5 w-36 rounded animate-pulse" style={{ background: 'var(--surface2)' }} />
        </div>

        {/* Note blocks skeleton */}
        <div className="space-y-4">
          {[1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className="rounded-xl p-5"
              style={{ background: 'var(--surface)', border: '1px solid var(--border-custom)' }}
            >
              <div className="h-5 w-40 rounded animate-pulse mb-4" style={{ background: 'var(--surface2)' }} />
              <div className="space-y-2">
                <div className="h-4 w-full rounded animate-pulse" style={{ background: 'var(--surface2)' }} />
                <div className="h-4 w-full rounded animate-pulse" style={{ background: 'var(--surface2)' }} />
                <div className="h-4 w-3/4 rounded animate-pulse" style={{ background: 'var(--surface2)' }} />
              </div>
              {i === 2 && (
                <div
                  className="mt-4 rounded-lg p-4"
                  style={{ background: 'var(--surface2)' }}
                >
                  <div className="h-20 w-full rounded animate-pulse" style={{ background: 'var(--surface)' }} />
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Practice button skeleton */}
        <div
          className="rounded-xl p-4 h-16"
          style={{ background: 'var(--surface2)' }}
        />
      </div>
    </div>
  )
}
