'use client'

import { useState } from 'react'
import { createBrowserClient } from '@supabase/ssr'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Loader2 } from 'lucide-react'

export default function SignupPage() {
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
      newErrors.name = 'Full name is required'
    }

    if (!email.trim()) {
      newErrors.email = 'Email is required'
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      newErrors.email = 'Invalid email address'
    }

    if (!password) {
      newErrors.password = 'Password is required'
    } else if (password.length < 8) {
      newErrors.password = 'Password must be at least 8 characters'
    }

    if (!grade) {
      newErrors.grade = 'Please select your grade'
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
      setErrors({ form: 'Supabase is not configured. Please set environment variables.' })
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

      // Insert user row into public.users table
      if (authData.user) {
        const { error: insertError } = await supabase
          .from('users')
          .insert({
            id: authData.user.id,
            email,
            name,
            grade: grade as number,
            school: school || null,
            xp: 0,
            streak_count: 0,
            hearts: 5,
            is_premium: false,
          })

        if (insertError) {
          console.error('Error inserting user:', insertError)
          // Don't block signup if user row fails - they can still use the app
        }
      }

      router.push('/dashboard')
      router.refresh()
    } catch {
      setErrors({ form: 'An unexpected error occurred' })
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
          Create your account
        </h1>
        <p
          className="text-center mb-8"
          style={{ color: 'var(--muted-custom)' }}
        >
          Start your learning journey today
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
              Full name
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
              placeholder="John Doe"
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
              Email
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
              placeholder="you@example.com"
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
              Password
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
              placeholder="••••••••"
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
              Grade
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
              <option value="">Select your grade</option>
              <option value="10">Grade 10</option>
              <option value="11">Grade 11</option>
              <option value="12">Grade 12</option>
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
              School <span style={{ color: 'var(--muted-custom)' }}>(optional)</span>
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
              placeholder="Your school name"
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
                Creating account...
              </>
            ) : (
              'Create account'
            )}
          </button>
        </form>

        <p
          className="text-center mt-6 text-sm"
          style={{ color: 'var(--muted-custom)' }}
        >
          Already have an account?{' '}
          <Link
            href="/login"
            className="font-semibold hover:underline"
            style={{ color: 'var(--accent-red)' }}
          >
            Sign in
          </Link>
        </p>
      </div>
    </div>
  )
}
