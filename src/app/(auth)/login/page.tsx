'use client'

import { Suspense, useState } from 'react'
import { createBrowserClient } from '@supabase/ssr'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { Loader2 } from 'lucide-react'
import { useTranslations } from 'next-intl'

function ResetSuccessFlash() {
  const t = useTranslations('auth')
  const searchParams = useSearchParams()

  if (searchParams.get('reset') !== 'success') return null

  return (
    <div
      className="p-3 rounded-lg text-sm mb-5"
      role="status"
      style={{
        background: 'rgba(34, 197, 94, 0.1)',
        color: 'var(--text)',
        border: '1px solid rgba(34, 197, 94, 0.4)',
      }}
    >
      {t('passwordUpdatedFlash')}
    </div>
  )
}

export default function LoginPage() {
  const t = useTranslations('auth')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setLoading(true)

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

    // Demo mode when Supabase isn't configured
    if (!supabaseUrl || !supabaseKey) {
      // Allow demo login - redirect to dashboard
      setTimeout(() => {
        router.push('/dashboard')
      }, 500)
      return
    }

    try {
      const supabase = createBrowserClient(supabaseUrl, supabaseKey)

      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (error) {
        setError(error.message)
        setLoading(false)
        return
      }

      router.push('/dashboard')
      router.refresh()
    } catch {
      setError(t('unexpectedError'))
      setLoading(false)
    }
  }

  return (
    <div
      className="min-h-screen flex items-center justify-center px-4"
      style={{ background: 'var(--bg)' }}
    >
      <div
        className="w-full max-w-md p-8 rounded-2xl"
        style={{ background: 'var(--surface)', border: '1px solid var(--border-custom)' }}
      >
        {/* Logo */}
        <div className="flex justify-center mb-8">
          <div
            className="w-16 h-16 rounded-xl flex items-center justify-center text-white font-bold text-2xl"
            style={{ background: 'var(--accent-red)' }}
          >
            AT
          </div>
        </div>

        <h1
          className="text-2xl font-bold text-center mb-2"
          style={{ color: 'var(--text)' }}
        >
          {t('welcomeBack')}
        </h1>
        <p
          className="text-center mb-8"
          style={{ color: 'var(--muted-custom)' }}
        >
          {t('signInSubtitle')}
        </p>

        <Suspense fallback={null}>
          <ResetSuccessFlash />
        </Suspense>

        <form onSubmit={handleSubmit} className="space-y-5">
          {error && (
            <div
              className="p-3 rounded-lg text-sm"
              role="alert"
              style={{
                background: 'rgba(230, 57, 70, 0.1)',
                color: 'var(--accent-red-text)',
                border: '1px solid var(--accent-red)'
              }}
            >
              {error}
            </div>
          )}

          <div>
            <label
              htmlFor="email"
              className="block text-sm font-medium mb-2"
              style={{ color: 'var(--text)' }}
            >
              {t('email')}
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full px-4 py-3 rounded-lg outline-none transition-all focus:ring-2"
              style={{
                background: 'var(--surface2)',
                color: 'var(--text)',
                border: '1px solid var(--border-custom)',
              }}
              placeholder={t('emailPlaceholder')}
            />
          </div>

          <div>
            <div className="flex items-center justify-between mb-2">
              <label
                htmlFor="password"
                className="block text-sm font-medium"
                style={{ color: 'var(--text)' }}
              >
                {t('password')}
              </label>
              <Link
                href="/forgot-password"
                className="inline-block text-sm font-medium hover:underline tap-target"
                style={{ color: 'var(--accent-red-text)' }}
              >
                {t('forgotPassword')}
              </Link>
            </div>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full px-4 py-3 rounded-lg outline-none transition-all focus:ring-2"
              style={{
                background: 'var(--surface2)',
                color: 'var(--text)',
                border: '1px solid var(--border-custom)',
              }}
              placeholder={t('passwordPlaceholder')}
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-lg font-semibold text-white transition-all hover:opacity-90 disabled:opacity-50 flex items-center justify-center gap-2"
            style={{ background: 'var(--accent-red)' }}
          >
            {loading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" aria-hidden="true" />
                {t('signingIn')}
              </>
            ) : (
              t('signIn')
            )}
          </button>
        </form>

        {/* A "Continue as Demo User" button lived here. It pushed to
            /dashboard, which in production the proxy bounces straight back
            to /login with no message - so it read as a broken control. And
            it could only ever be SEEN in production: with Supabase
            unconfigured the proxy redirects /login to /dashboard, so the
            demo user never reaches this page. A button visible only in the
            one mode where it cannot work. */}

        <p
          className="text-center mt-6 text-sm"
          style={{ color: 'var(--muted-custom)' }}
        >
          {t('noAccount')}{' '}
          <Link
            href="/signup"
            className="font-semibold hover:underline"
            style={{ color: 'var(--accent-red-text)' }}
          >
            {t('signUp')}
          </Link>
        </p>
      </div>
    </div>
  )
}
