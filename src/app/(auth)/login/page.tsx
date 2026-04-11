'use client'

import { useState } from 'react'
import { createBrowserClient } from '@supabase/ssr'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Loader2 } from 'lucide-react'

export default function LoginPage() {
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
      setError('An unexpected error occurred')
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
          Welcome back
        </h1>
        <p
          className="text-center mb-8"
          style={{ color: 'var(--muted-custom)' }}
        >
          Sign in to continue learning
        </p>

        <form onSubmit={handleSubmit} className="space-y-5">
          {error && (
            <div
              className="p-3 rounded-lg text-sm"
              style={{
                background: 'rgba(230, 57, 70, 0.1)',
                color: 'var(--accent-red)',
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
              Email
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
              placeholder="you@example.com"
            />
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
              required
              className="w-full px-4 py-3 rounded-lg outline-none transition-all focus:ring-2"
              style={{
                background: 'var(--surface2)',
                color: 'var(--text)',
                border: '1px solid var(--border-custom)',
              }}
              placeholder="••••••••"
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
                <Loader2 className="w-5 h-5 animate-spin" />
                Signing in...
              </>
            ) : (
              'Sign in'
            )}
          </button>
        </form>

        {/* Demo Mode Button */}
        <div className="relative my-6">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t" style={{ borderColor: 'var(--border-custom)' }}></div>
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-2" style={{ background: 'var(--surface)', color: 'var(--muted-custom)' }}>or</span>
          </div>
        </div>

        <button
          onClick={() => router.push('/dashboard')}
          className="w-full py-3 rounded-lg font-semibold transition-all hover:opacity-90 flex items-center justify-center gap-2"
          style={{
            background: 'var(--surface2)',
            color: 'var(--text)',
            border: '1px solid var(--border-custom)'
          }}
        >
          Continue as Demo User
        </button>

        <p
          className="text-center mt-6 text-sm"
          style={{ color: 'var(--muted-custom)' }}
        >
          Don&apos;t have an account?{' '}
          <Link
            href="/signup"
            className="font-semibold hover:underline"
            style={{ color: 'var(--accent-red)' }}
          >
            Sign up
          </Link>
        </p>
      </div>
    </div>
  )
}
