'use client'

import { useState } from 'react'
import { createBrowserClient } from '@supabase/ssr'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Loader2 } from 'lucide-react'
import { useTranslations } from 'next-intl'

export default function SignupPage() {
  const t = useTranslations('auth')
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [grade, setGrade] = useState<number | ''>('')
  const [school, setSchool] = useState('')
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const validate = () => {
    const newErrors: Record<string, string> = {}

    if (!name.trim()) {
      newErrors.name = t('fullNameRequired')
    }

    if (!email.trim()) {
      newErrors.email = t('emailRequired')
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      newErrors.email = t('emailInvalid')
    }

    if (!password) {
      newErrors.password = t('passwordRequired')
    } else if (password.length < 8) {
      newErrors.password = t('passwordMinLength')
    }

    if (!grade) {
      newErrors.grade = t('gradeRequired')
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validate()) return

    setLoading(true)

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

    if (!supabaseUrl || !supabaseKey) {
      setErrors({ form: t('supabaseNotConfigured') })
      setLoading(false)
      return
    }

    try {
      const supabase = createBrowserClient(supabaseUrl, supabaseKey)

      // Sign up with Supabase Auth
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            name,
            grade,
          },
        },
      })

      if (authError) {
        setErrors({ form: authError.message })
        setLoading(false)
        return
      }

      // Insert user row into public.users table.
      //
      // Identity fields only. xp, streak_count, hearts, is_premium and
      // is_admin are deliberately NOT sent: they have safe defaults in
      // schema.ts (0, 0, 5, false, false), and the RLS migration grants
      // the client INSERT on these five columns alone, so that a
      // hand-rolled signup request cannot open an account already holding
      // premium, the admin bit, or 999999 XP. Sending them here would now
      // fail the whole insert on a column permission error.
      if (authData.user) {
        const { error: insertError } = await supabase
          .from('users')
          .insert({
            id: authData.user.id,
            email,
            name,
            grade: grade as number,
            school: school || null,
          })

        if (insertError) {
          console.error('Error inserting user:', insertError)
          // Don't block signup if user row fails - they can still use the app
        }
      }

      router.push('/dashboard')
      router.refresh()
    } catch {
      setErrors({ form: t('unexpectedError') })
      setLoading(false)
    }
  }

  return (
    <div
      className="min-h-screen flex items-center justify-center px-4 py-8"
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
          {t('createAccount')}
        </h1>
        <p
          className="text-center mb-8"
          style={{ color: 'var(--muted-custom)' }}
        >
          {t('createAccountSubtitle')}
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          {errors.form && (
            <div
              className="p-3 rounded-lg text-sm"
              style={{
                background: 'rgba(230, 57, 70, 0.1)',
                color: 'var(--accent-red)',
                border: '1px solid var(--accent-red)'
              }}
            >
              {errors.form}
            </div>
          )}

          <div>
            <label
              htmlFor="name"
              className="block text-sm font-medium mb-2"
              style={{ color: 'var(--text)' }}
            >
              {t('fullName')}
            </label>
            <input
              id="name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-4 py-3 rounded-lg outline-none transition-all focus:ring-2"
              style={{
                background: 'var(--surface2)',
                color: 'var(--text)',
                border: errors.name ? '1px solid var(--accent-red)' : '1px solid var(--border-custom)',
              }}
              placeholder={t('fullNamePlaceholder')}
            />
            {errors.name && (
              <p className="mt-1 text-sm" style={{ color: 'var(--accent-red)' }}>{errors.name}</p>
            )}
          </div>

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
              className="w-full px-4 py-3 rounded-lg outline-none transition-all focus:ring-2"
              style={{
                background: 'var(--surface2)',
                color: 'var(--text)',
                border: errors.email ? '1px solid var(--accent-red)' : '1px solid var(--border-custom)',
              }}
              placeholder={t('emailPlaceholder')}
            />
            {errors.email && (
              <p className="mt-1 text-sm" style={{ color: 'var(--accent-red)' }}>{errors.email}</p>
            )}
          </div>

          <div>
            <label
              htmlFor="password"
              className="block text-sm font-medium mb-2"
              style={{ color: 'var(--text)' }}
            >
              {t('password')}
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-3 rounded-lg outline-none transition-all focus:ring-2"
              style={{
                background: 'var(--surface2)',
                color: 'var(--text)',
                border: errors.password ? '1px solid var(--accent-red)' : '1px solid var(--border-custom)',
              }}
              placeholder={t('passwordPlaceholder')}
            />
            {errors.password && (
              <p className="mt-1 text-sm" style={{ color: 'var(--accent-red)' }}>{errors.password}</p>
            )}
          </div>

          <div>
            <label
              htmlFor="grade"
              className="block text-sm font-medium mb-2"
              style={{ color: 'var(--text)' }}
            >
              {t('grade')}
            </label>
            <select
              id="grade"
              value={grade}
              onChange={(e) => setGrade(e.target.value ? Number(e.target.value) : '')}
              className="w-full px-4 py-3 rounded-lg outline-none transition-all focus:ring-2"
              style={{
                background: 'var(--surface2)',
                color: 'var(--text)',
                border: errors.grade ? '1px solid var(--accent-red)' : '1px solid var(--border-custom)',
              }}
            >
              <option value="">{t('gradeSelectPlaceholder')}</option>
              <option value="10">{t('grade')} 10</option>
              <option value="11">{t('grade')} 11</option>
              <option value="12">{t('grade')} 12</option>
            </select>
            {errors.grade && (
              <p className="mt-1 text-sm" style={{ color: 'var(--accent-red)' }}>{errors.grade}</p>
            )}
          </div>

          <div>
            <label
              htmlFor="school"
              className="block text-sm font-medium mb-2"
              style={{ color: 'var(--text)' }}
            >
              {t('school')} <span style={{ color: 'var(--muted-custom)' }}>(optional)</span>
            </label>
            <input
              id="school"
              type="text"
              value={school}
              onChange={(e) => setSchool(e.target.value)}
              className="w-full px-4 py-3 rounded-lg outline-none transition-all focus:ring-2"
              style={{
                background: 'var(--surface2)',
                color: 'var(--text)',
                border: '1px solid var(--border-custom)',
              }}
              placeholder={t('schoolPlaceholder')}
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-lg font-semibold text-white transition-all hover:opacity-90 disabled:opacity-50 flex items-center justify-center gap-2 mt-6"
            style={{ background: 'var(--accent-red)' }}
          >
            {loading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                {t('creatingAccount')}
              </>
            ) : (
              t('createAccount')
            )}
          </button>
        </form>

        <p
          className="text-center mt-6 text-sm"
          style={{ color: 'var(--muted-custom)' }}
        >
          {t('hasAccount')}{' '}
          <Link
            href="/login"
            className="font-semibold hover:underline"
            style={{ color: 'var(--accent-red)' }}
          >
            {t('signIn')}
          </Link>
        </p>
      </div>
    </div>
  )
}
