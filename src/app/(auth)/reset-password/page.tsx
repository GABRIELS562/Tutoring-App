'use client'

import { Suspense, useState } from 'react'
import { createBrowserClient } from '@supabase/ssr'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { Loader2 } from 'lucide-react'
import { useTranslations } from 'next-intl'

const MIN_PASSWORD_LENGTH = 8

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

  if (linkInvalid) {
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
