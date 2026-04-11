export default function ProgressLoading() {
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
        <div className="h-9 w-9 rounded-full animate-pulse" style={{ background: 'var(--surface2)' }} />
      </div>

      <div className="p-4 md:p-6 max-w-6xl mx-auto space-y-6">
        {/* XP Chart skeleton */}
        <div
          className="rounded-xl p-5"
          style={{ background: 'var(--surface)', border: '1px solid var(--border-custom)' }}
        >
          <div className="h-5 w-40 rounded animate-pulse mb-4" style={{ background: 'var(--surface2)' }} />
          <div className="h-[250px] rounded-lg animate-pulse" style={{ background: 'var(--surface2)' }} />
        </div>

        {/* Accuracy Chart skeleton */}
        <div
          className="rounded-xl p-5"
          style={{ background: 'var(--surface)', border: '1px solid var(--border-custom)' }}
        >
          <div className="h-5 w-36 rounded animate-pulse mb-4" style={{ background: 'var(--surface2)' }} />
          <div className="h-[250px] rounded-lg animate-pulse" style={{ background: 'var(--surface2)' }} />
        </div>

        {/* Two column section */}
        <div className="grid md:grid-cols-2 gap-6">
          {/* Activity Calendar skeleton */}
          <div
            className="rounded-xl p-5"
            style={{ background: 'var(--surface)', border: '1px solid var(--border-custom)' }}
          >
            <div className="h-5 w-36 rounded animate-pulse mb-4" style={{ background: 'var(--surface2)' }} />
            <div className="grid grid-cols-7 gap-1">
              {Array.from({ length: 56 }).map((_, i) => (
                <div
                  key={i}
                  className="w-7 h-7 rounded-sm animate-pulse"
                  style={{ background: 'var(--surface2)' }}
                />
              ))}
            </div>
          </div>

          {/* Leaderboard skeleton */}
          <div
            className="rounded-xl p-5"
            style={{ background: 'var(--surface)', border: '1px solid var(--border-custom)' }}
          >
            <div className="h-5 w-40 rounded animate-pulse mb-4" style={{ background: 'var(--surface2)' }} />
            <div className="space-y-3">
              {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
                <div key={i} className="flex items-center gap-3">
                  <div className="h-6 w-6 rounded animate-pulse" style={{ background: 'var(--surface2)' }} />
                  <div className="h-4 flex-1 rounded animate-pulse" style={{ background: 'var(--surface2)' }} />
                  <div className="h-4 w-12 rounded animate-pulse" style={{ background: 'var(--surface2)' }} />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
