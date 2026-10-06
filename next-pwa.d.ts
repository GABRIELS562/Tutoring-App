declare module 'next-pwa' {
  import { NextConfig } from 'next'

  interface PWAConfig {
    dest?: string
    register?: boolean
    skipWaiting?: boolean
    disable?: boolean
    /**
     * Patterns excluded from the PRECACHE manifest, matched against
     * webpack asset names (e.g. `static/media/KaTeX_Main-Regular.woff`) -
     * note: asset names, not request URLs, so no leading `/_next/`.
     *
     * next-pwa spreads this into workbox's `exclude` (index.js), but
     * these declarations are hand-written because the package ships no
     * types, so it had to be added here to be usable.
     */
    buildExcludes?: Array<RegExp | string>
    runtimeCaching?: Array<{
      urlPattern: RegExp | string
      handler: string
      options?: {
        cacheName?: string
        /** Workbox's NetworkFirst timeout before it falls back to the
         * cache. Supported by Workbox but absent from this declaration,
         * which is hand-written here because next-pwa ships no types. */
        networkTimeoutSeconds?: number
        expiration?: {
          maxEntries?: number
          maxAgeSeconds?: number
        }
      }
    }>
  }

  function withPWA(config: PWAConfig): (nextConfig: NextConfig) => NextConfig
  export default withPWA
}
