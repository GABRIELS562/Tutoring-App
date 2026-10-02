import type { NextConfig } from "next";
import withPWAInit from 'next-pwa';
import createNextIntlPlugin from 'next-intl/plugin';

const withPWA = withPWAInit({
  dest: 'public',
  register: true,
  skipWaiting: true,
  disable: process.env.NODE_ENV === 'development',
  runtimeCaching: [
    // NOTHING BEHIND THE LOGIN IS RUNTIME-CACHED, and that is deliberate.
    //
    // The page routes (/topics/*, /formulas) and /api/* used to be cached
    // here. With the worker finally registering, that was tested and the
    // worker served a cached topic page, status 200, to a request the
    // server answers with a 307 to /login. Cached /api/* responses are
    // worse: those carry one student's XP, hearts and attempt history, and
    // this audience shares devices - a family phone would hand the next
    // reader whatever the last one had loaded.
    //
    // What is left is public and immutable: hashed build assets and audio.
    // The app shell is still precached, so repeat loads stay fast.
    //
    // Offline access to lesson content already exists and is the right
    // shape for it: the topic page's "save notes for offline" button,
    // which is per-user, explicit, and stored in IndexedDB
    // (src/lib/offlineStorage.ts).
    {
      urlPattern: /\/audio\/.*/,
      handler: 'CacheFirst',
      options: {
        cacheName: 'audio-files',
        expiration: { maxEntries: 100, maxAgeSeconds: 30 * 24 * 60 * 60 }
      }
    },
    {
      urlPattern: /\.(js|css|woff2?)$/,
      handler: 'StaleWhileRevalidate',
      options: {
        cacheName: 'static-assets',
        expiration: { maxEntries: 100, maxAgeSeconds: 7 * 24 * 60 * 60 }
      }
    }
  ]
})

/**
 * Content-Security-Policy, built from what the app actually loads - every
 * origin below was confirmed against the running production build, not
 * guessed:
 *
 * - script/style 'unsafe-inline': Next streams the RSC payload through
 *   inline <script> tags, and the UI styles almost everything through the
 *   style={{…}} prop. A nonce would be stricter, but it has to be minted
 *   per request in the proxy and threaded through; this still blocks the
 *   thing that matters most, loading script from somewhere else.
 * - font-src is 'self' only: next/font/google self-hosts the woff2 at
 *   build time, so nothing is fetched from Google at runtime.
 * - img-src needs data: and blob: for the certificate canvas and the
 *   camera scan, both of which render generated images.
 * - frame-src is YouTube: every lesson video embeds www.youtube.com.
 * - connect-src picks up the Supabase URL from the environment, so it is
 *   right for whichever project a deploy points at.
 */
function contentSecurityPolicy(): string {
  const supabase = process.env.NEXT_PUBLIC_SUPABASE_URL ?? ''
  const isDev = process.env.NODE_ENV !== 'production'
  // React Fast Refresh evaluates strings, so a CSP without 'unsafe-eval'
  // silently kills hot reload - the dev server starts, the page renders,
  // and edits stop appearing. Production neither needs nor gets it: the
  // production bundle was checked with this exact policy and raised no
  // eval violation.
  const connect = ["'self'", supabase].filter(Boolean).join(' ')
  const script = isDev ? "'self' 'unsafe-inline' 'unsafe-eval'" : "'self' 'unsafe-inline'"

  return [
    "default-src 'self'",
    `script-src ${script}`,
    "style-src 'self' 'unsafe-inline'",
    "img-src 'self' data: blob:",
    "font-src 'self' data:",
    `connect-src ${connect}`,
    'frame-src https://www.youtube.com',
    "object-src 'none'",
    "base-uri 'self'",
    "form-action 'self'",
    "frame-ancestors 'none'",
    'upgrade-insecure-requests',
  ].join('; ')
}

const SECURITY_HEADERS = [
  { key: 'Content-Security-Policy', value: contentSecurityPolicy() },
  // frame-ancestors above covers modern browsers; this is the old guard.
  { key: 'X-Frame-Options', value: 'DENY' },
  { key: 'X-Content-Type-Options', value: 'nosniff' },
  { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
  // camera stays on: the AI camera-scan feature photographs a question.
  { key: 'Permissions-Policy', value: 'camera=(self), microphone=(), geolocation=(), interest-cohort=()' },
  // No preload: that is a commitment to HTTPS for the domain that is hard
  // to walk back, and it is the client's domain to make.
  { key: 'Strict-Transport-Security', value: 'max-age=31536000; includeSubDomains' },
]

const nextConfig: NextConfig = {
  reactStrictMode: true,
  async headers() {
    return [{ source: '/:path*', headers: SECURITY_HEADERS }]
  },
};

const withNextIntl = createNextIntlPlugin('./src/i18n/request.ts');

export default withNextIntl(withPWA(nextConfig));
