'use client'

import dynamic from 'next/dynamic'

/**
 * Recharts is 376KB - by a wide margin the largest thing this app ships,
 * and it is used on exactly one page for two charts. Imported statically
 * it sat on the progress page's critical path, which is why the charts
 * took about four seconds to appear over an empty box.
 *
 * Loaded on demand instead, with a skeleton the same height as the chart
 * so the page does not jump when it arrives. `ssr: false` because Recharts
 * measures its container to size itself and has nothing to measure on the
 * server; rendering it there produced markup the client immediately threw
 * away.
 *
 * This wrapper is a client component because `ssr: false` is not allowed
 * in a Server Component, and progress/page.tsx is one.
 */

function ChartSkeleton() {
  return (
    <div
      className="w-full animate-pulse rounded-lg"
      style={{ height: 260, background: 'var(--surface2)' }}
      aria-hidden="true"
    />
  )
}

export const XPLineChart = dynamic(() => import('./XPLineChart'), {
  ssr: false,
  loading: ChartSkeleton,
})

export const AccuracyBarChart = dynamic(() => import('./AccuracyBarChart'), {
  ssr: false,
  loading: ChartSkeleton,
})
