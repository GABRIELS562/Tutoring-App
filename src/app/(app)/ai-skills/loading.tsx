export default function AISkillsLoading() {
  return (
    <div className="p-4 md:p-6 max-w-4xl mx-auto space-y-8">
      {/* Header skeleton */}
      <div className="space-y-4">
        <div className="flex items-center gap-3">
          <div
            className="w-12 h-12 rounded-xl animate-pulse"
            style={{ background: 'var(--surface2)' }}
          />
          <div className="space-y-2">
            <div
              className="h-6 w-32 rounded animate-pulse"
              style={{ background: 'var(--surface2)' }}
            />
            <div
              className="h-4 w-48 rounded animate-pulse"
              style={{ background: 'var(--surface2)' }}
            />
          </div>
        </div>

        {/* Progress skeleton */}
        <div
          className="p-4 rounded-xl animate-pulse"
          style={{ background: 'var(--surface)', border: '1px solid var(--border-custom)' }}
        >
          <div className="flex gap-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="space-y-2">
                <div
                  className="h-8 w-16 rounded"
                  style={{ background: 'var(--surface2)' }}
                />
                <div
                  className="h-3 w-12 rounded"
                  style={{ background: 'var(--surface2)' }}
                />
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Modules skeleton */}
      <div className="space-y-4">
        <div
          className="h-5 w-20 rounded animate-pulse"
          style={{ background: 'var(--surface2)' }}
        />

        <div className="space-y-3">
          {[1, 2, 3, 4, 5].map((i) => (
            <div
              key={i}
              className="rounded-xl p-4 animate-pulse"
              style={{ background: 'var(--surface)', border: '1px solid var(--border-custom)' }}
            >
              <div className="flex items-center gap-4">
                <div
                  className="w-10 h-10 rounded-lg"
                  style={{ background: 'var(--surface2)' }}
                />
                <div className="flex-1 space-y-2">
                  <div
                    className="h-5 w-3/4 rounded"
                    style={{ background: 'var(--surface2)' }}
                  />
                  <div
                    className="h-4 w-1/2 rounded"
                    style={{ background: 'var(--surface2)' }}
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
