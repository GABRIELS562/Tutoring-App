'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { createBrowserClient } from '@supabase/ssr'
import { FileQuestion, BookOpen, LogOut, Shield } from 'lucide-react'

type AdminNavProps = {
  userName: string
}

export default function AdminNav({ userName }: AdminNavProps) {
  const pathname = usePathname()
  const router = useRouter()

  const handleSignOut = async () => {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

    if (supabaseUrl && supabaseKey) {
      const supabase = createBrowserClient(supabaseUrl, supabaseKey)
      await supabase.auth.signOut()
    }
    router.push('/login')
    router.refresh()
  }

  const navItems = [
    { href: '/admin/questions', label: 'Questions', icon: FileQuestion },
    { href: '/admin/topics', label: 'Topics', icon: BookOpen },
  ]

  return (
    <header
      className="h-14 flex items-center justify-between px-4 md:px-6"
      style={{ background: 'var(--surface)', borderBottom: '1px solid var(--border-custom)' }}
    >
      {/* Left: Logo + Nav */}
      <div className="flex items-center gap-6">
        <Link href="/admin" className="flex items-center gap-2">
          <div
            className="w-8 h-8 rounded-lg flex items-center justify-center"
            style={{ background: 'var(--accent-red)' }}
          >
            <Shield className="w-5 h-5 text-white" />
          </div>
          <span className="font-bold text-lg hidden sm:block" style={{ color: 'var(--text)' }}>
            Admin Panel
          </span>
        </Link>

        <nav className="flex items-center gap-1">
          {navItems.map((item) => {
            const isActive = pathname === item.href
            const Icon = item.icon
            return (
              <Link
                key={item.href}
                href={item.href}
                className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors"
                style={{
                  background: isActive ? 'var(--accent-red)' : 'transparent',
                  color: isActive ? 'white' : 'var(--muted-custom)',
                }}
              >
                <Icon className="w-4 h-4" />
                <span className="hidden sm:inline">{item.label}</span>
              </Link>
            )
          })}
        </nav>
      </div>

      {/* Right: User + Sign out */}
      <div className="flex items-center gap-4">
        <span className="text-sm hidden md:block" style={{ color: 'var(--muted-custom)' }}>
          {userName}
        </span>
        <button
          onClick={handleSignOut}
          className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors hover:bg-white/5"
          style={{ color: 'var(--accent-red)' }}
        >
          <LogOut className="w-4 h-4" />
          <span className="hidden sm:inline">Sign out</span>
        </button>
      </div>
    </header>
  )
}
