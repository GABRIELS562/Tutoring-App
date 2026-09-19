'use client'

import { Suspense, useEffect, useState } from 'react'
import { createBrowserClient } from '@supabase/ssr'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { Loader2 } from 'lucide-react'
import { useTranslations } from 'next-intl'

const MIN_PASSWORD_LENGTH = 8

/**
 * `updateUser({ password })` must only ever run inside the short-lived
 * session Supabase creates from a password-recovery email link - never in
 * an ordinary logged-in session (which would let anyone who finds this
 * page while already signed in silently change their own password with
 * no re-authentication, or worse, be tricked into doing it for someone
 * else's shared/kiosk session). Distinguished two ways: the
 * `PASSWORD_RECOVERY` auth event (fires as soon as the SDK processes the
 * recovery link, including possibly before this component mounts its
 * listener) and, as a fallback for a session that already existed when
 * this component mounted, the `amr` (Authentication Methods Reference)
 * claim on the JWT via `getClaims()` - a recovery session carries
 * `{ method: 'recovery' }` there, an ordinary one carries `{ method:
 * 'password' }` (or similar).
 */
type SessionGate = 'checking' | 'recovery' | 'normal' | 'none'

function isRecoveryAmr(amr: unknown): boolean {
  if (!Array.isArray(amr)) return false
  return amr.some((entry) => typeof entry === 'object' && entry !== null && 'method' in entry && entry.method === 'recovery')
}

function useSessionGate(isDemoMode: boolean, supabaseUrl?: string, supabaseKey?: string): SessionGate {
  const [gate, setGate] = useState<SessionGate>('checking')

  useEffect(() => {
    if (isDemoMode || !supabaseUrl || !supabaseKey) return

    const supabase = createBrowserClient(supabaseUrl, supabaseKey)
    let cancelled = false

    supabase.auth.getClaims().then(({ data, error }) => {
      if (cancelled) return
      setGate((current) => {
        // The PASSWORD_RECOVERY event (below) is authoritative and may
        // already have resolved this before the getClaims() round trip
        // finishes - never downgrade away from a confirmed recovery gate.
        if (current === 'recovery') return current
        if (error || !data) return 'none'
        return isRecoveryAmr(data.claims.amr) ? 'recovery' : 'normal'
      })
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
      if (cancelled) return
      if (event === 'PASSWORD_RECOVERY') {
        setGate('recovery')
      } else if (event === 'SIGNED_OUT') {
        setGate('none')
      }
    })

    return () => {
      cancelled = true
      subscription.unsubscribe()
    }
  }, [isDemoMode, supabaseUrl, supabaseKey])

  return gate
}

function ResetPasswordForm() {
  const t = useTranslations('auth')
  const router = useRouter()
  const searchParams = useSearchParams()
  const linkInvalid = searchParams.get('error') === 'invalid_link'

  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [loading, setLoading] = useState(false)

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  const isDemoMode = !supabaseUrl || !supabaseKey
  const sessionGate = useSessionGate(isDemoMode, supabaseUrl, supabaseKey)

  const validate = () => {
    const newErrors: Record<string, string> = {}

    if (!password || password.length < MIN_PASSWORD_LENGTH) {
      newErrors.password = t('passwordMinLength')
    }

    if (password !== confirmPassword) {
      newErrors.confirmPassword = t('passwordsDoNotMatch')
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validate()) return

    setLoading(true)

    try {
      const supabase = createBrowserClient(supabaseUrl!, supabaseKey!)
      const { error } = await supabase.auth.updateUser({ password })

      if (error) {
        setErrors({ form: error.message })
        setLoading(false)
        return
      }

      // The recovery session that /auth/callback established has done its
      // job; sign out so the user re-authenticates with the new password
      // rather than silently staying signed in on this device.
      await supabase.auth.signOut()

      router.push('/login?reset=success')
    } catch {
      setErrors({ form: t('unexpectedError') })
      setLoading(false)
    }
  }

  if (isDemoMode) {
    return (
      <p className="text-center mb-8" style={{ color: 'var(--muted-custom)' }}>
        {t('demoModeResetMessage')}
      </p>
    )
  }

  if (linkInvalid || sessionGate === 'none') {
    return (
      <>
        <p
          className="text-center mb-8"
          role="alert"
          style={{ color: 'var(--accent-red)' }}
        >
          {t('invalidResetLink')}
        </p>
        <Link
          href="/forgot-password"
          className="block w-full py-3 rounded-lg font-semibold text-white text-center transition-all hover:opacity-90"
          style={{ background: 'var(--accent-red)' }}
        >
          {t('requestNewLink')}
        </Link>
      </>
    )
  }

  if (sessionGate === 'checking') {
    return (
      <p role="status" className="text-center mb-8" style={{ color: 'var(--muted-custom)' }}>
        {t('checkingSession')}
      </p>
    )
  }

  if (sessionGate === 'normal') {
    return (
      <>
        <p className="text-center mb-8" style={{ color: 'var(--muted-custom)' }}>
          {t('normalSessionMessage')}
        </p>
        <Link
          href="/dashboard"
          className="block w-full py-3 rounded-lg font-semibold text-white text-center transition-all hover:opacity-90"
          style={{ background: 'var(--accent-red)' }}
        >
          {t('goToDashboard')}
        </Link>
      </>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5" noValidate>
      {errors.form && (
        <div
          className="p-3 rounded-lg text-sm"
          role="alert"
          style={{
            background: 'rgba(230, 57, 70, 0.1)',
            color: 'var(--accent-red)',
            border: '1px solid var(--accent-red)',
          }}
        >
          {errors.form}
        </div>
      )}

      <div>
        <label
          htmlFor="newPassword"
          className="block text-sm font-medium mb-2"
          style={{ color: 'var(--text)' }}
        >
          {t('newPassword')}
        </label>
        <input
          id="newPassword"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          aria-invalid={Boolean(errors.password)}
          aria-describedby={errors.password ? 'newPassword-error' : undefined}
          className="w-full px-4 py-3 rounded-lg outline-none transition-all focus:ring-2"
          style={{
            background: 'var(--surface2)',
            color: 'var(--text)',
            border: errors.password ? '1px solid var(--accent-red)' : '1px solid var(--border-custom)',
          }}
          placeholder={t('passwordPlaceholder')}
        />
        {errors.password && (
          <p id="newPassword-error" className="mt-1 text-sm" style={{ color: 'var(--accent-red)' }}>
            {errors.password}
          </p>
        )}
      </div>

      <div>
        <label
          htmlFor="confirmPassword"
          className="block text-sm font-medium mb-2"
          style={{ color: 'var(--text)' }}
        >
          {t('confirmPassword')}
        </label>
        <input
          id="confirmPassword"
          type="password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          required
          aria-invalid={Boolean(errors.confirmPassword)}
          aria-describedby={errors.confirmPassword ? 'confirmPassword-error' : undefined}
          className="w-full px-4 py-3 rounded-lg outline-none transition-all focus:ring-2"
          style={{
            background: 'var(--surface2)',
            color: 'var(--text)',
            border: errors.confirmPassword ? '1px solid var(--accent-red)' : '1px solid var(--border-custom)',
          }}
          placeholder={t('passwordPlaceholder')}
        />
        {errors.confirmPassword && (
          <p id="confirmPassword-error" className="mt-1 text-sm" style={{ color: 'var(--accent-red)' }}>
            {errors.confirmPassword}
          </p>
        )}
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
            {t('updatingPassword')}
          </>
        ) : (
          t('updatePassword')
        )}
      </button>
    </form>
  )
}

export default function ResetPasswordPage() {
  const t = useTranslations('auth')

  return (
    <div
      className="min-h-screen flex items-center justify-center px-4"
      style={{ background: 'var(--bg)' }}
    >
      <div
        className="w-full max-w-md p-8 rounded-2xl"
        style={{ background: 'var(--surface)', border: '1px solid var(--border-custom)' }}
      >
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
          {t('resetPasswordTitle')}
        </h1>
        <p
          className="text-center mb-8"
          style={{ color: 'var(--muted-custom)' }}
        >
          {t('resetPasswordSubtitle')}
        </p>

        <Suspense fallback={null}>
          <ResetPasswordForm />
        </Suspense>
      </div>
    </div>
  )
}
