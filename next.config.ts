import type { NextConfig } from "next";
import withPWAInit from 'next-pwa';
import createNextIntlPlugin from 'next-intl/plugin';

const withPWA = withPWAInit({
  dest: 'public',
  register: true,
  skipWaiting: true,
  disable: process.env.NODE_ENV === 'development',
  runtimeCaching: [
    {
      urlPattern: /^https:\/\/fonts\.googleapis\.com/,
      handler: 'StaleWhileRevalidate',
      options: { cacheName: 'google-fonts-stylesheets' }
    },
    {
      urlPattern: /^https:\/\/fonts\.gstatic\.com/,
      handler: 'CacheFirst',
      options: {
        cacheName: 'google-fonts-webfonts',
        expiration: { maxEntries: 30, maxAgeSeconds: 365 * 24 * 60 * 60 }
      }
    },
    {
      urlPattern: /\/topics\/.*/,
      handler: 'CacheFirst',
      options: {
        cacheName: 'topic-pages',
        expiration: { maxEntries: 60, maxAgeSeconds: 7 * 24 * 60 * 60 }
      }
    },
    {
      urlPattern: /\/formulas/,
      handler: 'CacheFirst',
      options: {
        cacheName: 'formula-sheet',
        expiration: { maxEntries: 10, maxAgeSeconds: 30 * 24 * 60 * 60 }
      }
    },
    {
      urlPattern: /\/audio\/.*/,
      handler: 'CacheFirst',
      options: {
        cacheName: 'audio-files',
        expiration: { maxEntries: 100, maxAgeSeconds: 30 * 24 * 60 * 60 }
      }
    },
    {
      urlPattern: /\/api\/.*/,
      handler: 'NetworkFirst',
      options: {
        cacheName: 'api-cache',
        expiration: { maxEntries: 50, maxAgeSeconds: 60 * 60 }
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

const nextConfig: NextConfig = {
  reactStrictMode: true,
  webpack: (config) => {
    // Fix for react-pdf canvas dependency
    config.resolve.alias.canvas = false;
    config.resolve.alias.encoding = false;
    return config;
  },
};

const withNextIntl = createNextIntlPlugin('./src/i18n/request.ts');

export default withNextIntl(withPWA(nextConfig));
