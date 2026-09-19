'use client'

import { useState, useRef, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createBrowserClient } from '@supabase/ssr'
import { useUser } from '@/context/UserContext'
import { Flame, Gem, User, Settings, LogOut, ChevronDown, WifiOff } from 'lucide-react'
import LanguageToggle from './LanguageToggle'
import { useOnlineStatus } from '@/hooks/useOnlineStatus'
import { useTranslations } from 'next-intl'

type TopbarProps = {
  title: string
  subtitle?: string
}

export default function Topbar({ title, subtitle }: TopbarProps) {
  const { user } = useUser()
  const t = useTranslations('topbar')
  const tCommon = useTranslations('common')
  const tNav = useTranslations('nav')
  const tTopics = useTranslations('topics')
  const [dropdownOpen, setDropdownOpen] = useState(false)
  const isOnline = useOnlineStatus()
  const dropdownRef = useRef<HTMLDivElement>(null)
  const router = useRouter()

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setDropdownOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

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

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2)
  }

  return (
    <header
      className="h-[52px] flex items-center justify-between px-4 md:px-6"
      style={{ background: 'var(--surface)', borderBottom: '1px solid var(--border-custom)' }}
    >
      {/* Left: Title */}
      <div>
        <h1 className="text-lg font-bold" style={{ color: 'var(--text)' }}>
          {title}
        </h1>
        {subtitle && (
          <p className="text-xs" style={{ color: 'var(--muted-custom)' }}>
            {subtitle}
          </p>
        )}
      </div>

      {/* Right: Badges + Avatar */}
      <div className="flex items-center gap-3">
        {/* Language Toggle */}
        <LanguageToggle />

        {/* Offline Indicator */}
        {!isOnline && (
          <div
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium"
            style={{ background: 'rgba(244, 162, 97, 0.15)', color: 'var(--gold)' }}
          >
            <WifiOff className="w-3 h-3" />
            <span className="hidden sm:inline">{tCommon('offline')}</span>
          </div>
        )}

        {/* Streak Badge */}
        <div
          className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-full text-sm font-medium"
          style={{ background: 'rgba(244, 162, 97, 0.15)', color: 'var(--gold)' }}
        >
          <Flame className="w-4 h-4" />
          <span>{user?.streakCount || 0}</span>
        </div>

        {/* XP Badge */}
        <div
          className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-full text-sm font-medium"
          style={{ background: 'rgba(42, 157, 143, 0.15)', color: 'var(--teal)' }}
        >
          <Gem className="w-4 h-4" />
          <span>{user?.xp || 0}</span>
        </div>

        {/* Grade Pill */}
        {user?.grade && (
          <div
            className="hidden md:flex items-center px-2.5 py-1 rounded-full text-sm font-medium text-white"
            style={{ background: 'var(--accent-red)' }}
          >
            {tTopics('grade')} {user.grade}
          </div>
        )}

        {/* Avatar Dropdown */}
        <div className="relative" ref={dropdownRef}>
          <button
            onClick={() => setDropdownOpen(!dropdownOpen)}
            className="flex items-center gap-2 rounded-full focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ring)]"
            aria-label={t('userMenu')}
            aria-expanded={dropdownOpen}
          >
            <div
              className="w-9 h-9 rounded-full flex items-center justify-center text-white text-sm font-semibold"
              style={{ background: 'var(--accent-red)' }}
            >
              {user?.name ? getInitials(user.name) : 'U'}
            </div>
            <ChevronDown
              className="w-4 h-4 hidden md:block transition-transform"
              style={{
                color: 'var(--muted-custom)',
                transform: dropdownOpen ? 'rotate(180deg)' : 'rotate(0)',
              }}
            />
          </button>

          {/* Dropdown Menu */}
          {dropdownOpen && (
            <div
              className="absolute right-0 top-full mt-2 w-48 rounded-lg shadow-lg py-1 z-50"
              style={{ background: 'var(--surface2)', border: '1px solid var(--border-custom)' }}
            >
              <div className="px-4 py-2 border-b" style={{ borderColor: 'var(--border-custom)' }}>
                <p className="text-sm font-medium" style={{ color: 'var(--text)' }}>
                  {user?.name || t('userFallback')}
                </p>
                <p className="text-xs" style={{ color: 'var(--muted-custom)' }}>
                  {user?.email}
                </p>
              </div>

              <button
                onClick={() => {
                  setDropdownOpen(false)
                  // Navigate to profile (if implemented)
                }}
                className="w-full flex items-center gap-3 px-4 py-2 text-sm transition-colors hover:bg-white/5"
                style={{ color: 'var(--text)' }}
              >
                <User className="w-4 h-4" />
                {tNav('profile')}
              </button>

              <button
                onClick={() => {
                  setDropdownOpen(false)
                  // Navigate to settings (if implemented)
                }}
                className="w-full flex items-center gap-3 px-4 py-2 text-sm transition-colors hover:bg-white/5"
                style={{ color: 'var(--text)' }}
              >
                <Settings className="w-4 h-4" />
                {tNav('settings')}
              </button>

              <div className="border-t my-1" style={{ borderColor: 'var(--border-custom)' }} />

              <button
                onClick={handleSignOut}
                className="w-full flex items-center gap-3 px-4 py-2 text-sm transition-colors hover:bg-white/5"
                style={{ color: 'var(--accent-red)' }}
              >
                <LogOut className="w-4 h-4" />
                {tNav('signOut')}
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  )
}
