'use client'

import { useState } from 'react'
import { createBrowserClient } from '@supabase/ssr'
import Link from 'next/link'
import { Loader2, Mail } from 'lucide-react'
import { useTranslations } from 'next-intl'

export default function ForgotPasswordPage() {
  const t = useTranslations('auth')
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [submitted, setSubmitted] = useState(false)

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  const isDemoMode = !supabaseUrl || !supabaseKey

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const supabase = createBrowserClient(supabaseUrl!, supabaseKey!)
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/auth/callback?next=/reset-password`,
      })

      // Intentionally not branching on `error` here: revealing whether the
      // reset call succeeded would let an attacker enumerate which emails
      // have an account. The generic "sent" state below is shown either
      // way; the error is only logged for our own debugging.
      if (error) {
        console.error('resetPasswordForEmail failed:', error.message)
      }
    } catch (error) {
      console.error('resetPasswordForEmail threw:', error)
    } finally {
      setLoading(false)
      setSubmitted(true)
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
        <div className="flex justify-center mb-8">
          <div
            className="w-16 h-16 rounded-xl flex items-center justify-center text-white font-bold text-2xl"
            style={{ background: 'var(--accent-red)' }}
          >
            AT
          </div>
        </div>

        {isDemoMode ? (
          <>
            <h1
              className="text-2xl font-bold text-center mb-2"
              style={{ color: 'var(--text)' }}
            >
              {t('forgotPasswordTitle')}
            </h1>
            <p
              className="text-center mb-8"
              style={{ color: 'var(--muted-custom)' }}
            >
              {t('demoModeResetMessage')}
            </p>
          </>
        ) : submitted ? (
          <>
            <div className="flex justify-center mb-4" aria-hidden="true">
              <Mail className="w-10 h-10" style={{ color: 'var(--accent-red)' }} />
            </div>
            <h1
              className="text-2xl font-bold text-center mb-2"
              style={{ color: 'var(--text)' }}
              role="status"
            >
              {t('resetLinkSentTitle')}
            </h1>
            <p
              className="text-center mb-8"
              style={{ color: 'var(--muted-custom)' }}
            >
              {t('resetLinkSentMessage')}
            </p>
          </>
        ) : (
          <>
            <h1
              className="text-2xl font-bold text-center mb-2"
              style={{ color: 'var(--text)' }}
            >
              {t('forgotPasswordTitle')}
            </h1>
            <p
              className="text-center mb-8"
              style={{ color: 'var(--muted-custom)' }}
            >
              {t('forgotPasswordSubtitle')}
            </p>

            <form onSubmit={handleSubmit} className="space-y-5">
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

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 rounded-lg font-semibold text-white transition-all hover:opacity-90 disabled:opacity-50 flex items-center justify-center gap-2"
                style={{ background: 'var(--accent-red)' }}
              >
                {loading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" aria-hidden="true" />
                    {t('sendingResetLink')}
                  </>
                ) : (
                  t('sendResetLink')
                )}
              </button>
            </form>
          </>
        )}

        <p
          className="text-center mt-6 text-sm"
          style={{ color: 'var(--muted-custom)' }}
        >
          <Link
            href="/login"
            className="font-semibold hover:underline"
            style={{ color: 'var(--accent-red)' }}
          >
            {t('backToSignIn')}
          </Link>
        </p>
      </div>
    </div>
  )
}
