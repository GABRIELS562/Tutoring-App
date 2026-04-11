export default function DashboardLoading() {
  return (
    <div className="min-h-screen" style={{ background: 'var(--bg)' }}>
      {/* Topbar skeleton */}
      <div
        className="h-[52px] flex items-center justify-between px-4 md:px-6"
        style={{ background: 'var(--surface)', borderBottom: '1px solid var(--border-custom)' }}
      >
        <div className="space-y-1">
          <div className="h-5 w-24 rounded animate-pulse" style={{ background: 'var(--surface2)' }} />
          <div className="h-3 w-32 rounded animate-pulse" style={{ background: 'var(--surface2)' }} />
        </div>
        <div className="flex items-center gap-3">
          <div className="h-8 w-16 rounded-full animate-pulse hidden sm:block" style={{ background: 'var(--surface2)' }} />
          <div className="h-9 w-9 rounded-full animate-pulse" style={{ background: 'var(--surface2)' }} />
        </div>
      </div>

      <div className="p-4 md:p-6 max-w-6xl mx-auto space-y-6">
        {/* Welcome banner skeleton */}
        <div
          className="rounded-xl p-6 h-28"
          style={{ background: 'var(--surface2)' }}
        >
          <div className="h-8 w-64 rounded animate-pulse mb-2" style={{ background: 'var(--surface)' }} />
          <div className="h-4 w-48 rounded animate-pulse" style={{ background: 'var(--surface)' }} />
        </div>

        {/* Stats row skeleton */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className="rounded-xl p-4 h-24"
              style={{ background: 'var(--surface)', border: '1px solid var(--border-custom)' }}
            >
              <div className="h-8 w-8 rounded-lg animate-pulse mb-2" style={{ background: 'var(--surface2)' }} />
              <div className="h-6 w-12 rounded animate-pulse mb-1" style={{ background: 'var(--surface2)' }} />
              <div className="h-3 w-20 rounded animate-pulse" style={{ background: 'var(--surface2)' }} />
            </div>
          ))}
        </div>

        {/* Two columns skeleton */}
        <div className="grid md:grid-cols-2 gap-6">
          {[1, 2].map((i) => (
            <div
              key={i}
              className="rounded-xl p-5 space-y-4"
              style={{ background: 'var(--surface)', border: '1px solid var(--border-custom)' }}
            >
              <div className="h-5 w-32 rounded animate-pulse" style={{ background: 'var(--surface2)' }} />
              {[1, 2, 3, 4].map((j) => (
                <div key={j} className="space-y-2">
                  <div className="h-4 w-full rounded animate-pulse" style={{ background: 'var(--surface2)' }} />
                  <div className="h-2 w-full rounded-full animate-pulse" style={{ background: 'var(--surface2)' }} />
                </div>
              ))}
            </div>
          ))}
        </div>

        {/* Quick actions skeleton */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="rounded-xl p-5 h-20"
              style={{ background: 'var(--surface)', border: '1px solid var(--border-custom)' }}
            >
              <div className="h-5 w-24 rounded animate-pulse mb-2" style={{ background: 'var(--surface2)' }} />
              <div className="h-3 w-32 rounded animate-pulse" style={{ background: 'var(--surface2)' }} />
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
