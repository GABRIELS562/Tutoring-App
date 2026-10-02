/**
 * The practice page's loading skeleton.
 *
 * This was loading.tsx. A route-level loading file wraps the whole page in
 * a Suspense boundary, which makes Next flush the shell - and commit the
 * HTTP status - before the page component runs at all, so an unknown topic
 * slug answered 200 while rendering "Topic not found". As a plain
 * component it is the fallback for a Suspense boundary the page declares
 * AFTER it has validated the slug, which keeps the skeleton and lets
 * notFound() set a real 404.
 */
export default function PracticeSkeleton() {
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

      <div className="max-w-2xl mx-auto p-4 md:p-6">
        {/* Progress bar skeleton */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-2">
            <div className="h-4 w-24 rounded animate-pulse" style={{ background: 'var(--surface2)' }} />
            <div className="h-4 w-16 rounded animate-pulse" style={{ background: 'var(--surface2)' }} />
          </div>
          <div className="h-2 w-full rounded-full animate-pulse" style={{ background: 'var(--surface2)' }} />
        </div>

        {/* Question card skeleton */}
        <div
          className="rounded-xl p-6"
          style={{ background: 'var(--surface)', border: '1px solid var(--border-custom)' }}
        >
          {/* Question header */}
          <div className="flex items-center justify-between mb-4">
            <div className="h-6 w-24 rounded animate-pulse" style={{ background: 'var(--surface2)' }} />
            <div className="flex items-center gap-2">
              <div className="h-6 w-16 rounded-full animate-pulse" style={{ background: 'var(--surface2)' }} />
              <div className="h-6 w-20 rounded-full animate-pulse" style={{ background: 'var(--surface2)' }} />
            </div>
          </div>

          {/* Question text skeleton */}
          <div className="space-y-3 mb-6">
            <div className="h-5 w-full rounded animate-pulse" style={{ background: 'var(--surface2)' }} />
            <div className="h-5 w-4/5 rounded animate-pulse" style={{ background: 'var(--surface2)' }} />
            <div
              className="h-16 w-full rounded-lg animate-pulse my-4"
              style={{ background: 'var(--surface2)' }}
            />
          </div>

          {/* Options skeleton */}
          <div className="space-y-3 mb-6">
            {['A', 'B', 'C', 'D'].map((letter) => (
              <div
                key={letter}
                className="flex items-center gap-3 p-4 rounded-lg"
                style={{ background: 'var(--surface2)', border: '1px solid var(--border-custom)' }}
              >
                <div
                  className="w-8 h-8 rounded-lg animate-pulse"
                  style={{ background: 'var(--surface)' }}
                />
                <div className="h-4 flex-1 rounded animate-pulse" style={{ background: 'var(--surface)' }} />
              </div>
            ))}
          </div>

          {/* Submit button skeleton */}
          <div
            className="h-12 w-full rounded-lg animate-pulse"
            style={{ background: 'var(--surface2)' }}
          />
        </div>

        {/* Hearts/XP bar skeleton */}
        <div className="mt-4 flex items-center justify-center gap-4">
          <div className="h-8 w-20 rounded-full animate-pulse" style={{ background: 'var(--surface2)' }} />
          <div className="h-8 w-24 rounded-full animate-pulse" style={{ background: 'var(--surface2)' }} />
        </div>
      </div>
    </div>
  )
}
