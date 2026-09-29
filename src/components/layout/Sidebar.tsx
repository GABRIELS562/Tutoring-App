'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { createBrowserClient } from '@supabase/ssr'
import { useTranslations } from 'next-intl'
import {
  Home,
  BookOpen,
  PenTool,
  FileText,
  BarChart3,
  Sigma,
  LogOut,
  Brain,
  Swords,
} from 'lucide-react'

const NAV_ICONS = {
  dashboard: Home,
  subjects: BookOpen,
  aiSkills: Brain,
  practice: PenTool,
  papers: FileText,
  progress: BarChart3,
  examGame: Swords,
  formulas: Sigma,
} as const

export default function Sidebar() {
  const pathname = usePathname()
  const router = useRouter()
  const tHome = useTranslations('home')
  const tSubjects = useTranslations('subjects')
  const tNav = useTranslations('nav')
  const tPractice = useTranslations('practice')
  const tProgress = useTranslations('progress')

  const navItems = [
    { key: 'dashboard', icon: NAV_ICONS.dashboard, label: tHome('dashboardTitle'), href: '/dashboard' },
    { key: 'subjects', icon: NAV_ICONS.subjects, label: tSubjects('title'), href: '/subjects' },
    { key: 'aiSkills', icon: NAV_ICONS.aiSkills, label: tNav('aiSkills'), href: '/ai-skills', isAI: true },
    { key: 'practice', icon: NAV_ICONS.practice, label: tPractice('title'), href: '/topics/trig-gr11/practice' },
    { key: 'examGame', icon: NAV_ICONS.examGame, label: tNav('examGame'), href: '/exam' },
    { key: 'papers', icon: NAV_ICONS.papers, label: tNav('papers'), href: '/papers' },
    // /formulas existed but nothing in the app linked to it - the whole
    // formula sheet was reachable only by typing the URL.
    { key: 'formulas', icon: NAV_ICONS.formulas, label: tNav('formulas'), href: '/formulas' },
    { key: 'progress', icon: NAV_ICONS.progress, label: tProgress('title'), href: '/progress' },
  ]

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

  const isActive = (href: string) => {
    if (href === '/dashboard') return pathname === href
    return pathname.startsWith(href)
  }

  return (
    <>
      {/* Desktop Sidebar */}
      <aside
        className="fixed left-0 top-0 h-full w-[60px] hidden md:flex flex-col items-center py-4 z-50"
        style={{ background: 'var(--surface)', borderRight: '1px solid var(--border-custom)' }}
      >
        {/* Logo */}
        <Link href="/dashboard" className="mb-8">
          <div
            className="w-10 h-10 rounded-lg flex items-center justify-center text-white font-bold text-sm"
            style={{ background: 'var(--accent-red)' }}
          >
            AT
          </div>
        </Link>

        {/* Nav Items */}
        <nav className="flex-1 flex flex-col items-center gap-2">
          {navItems.map((item) => {
            const Icon = item.icon
            const active = isActive(item.href)
            const isAI = 'isAI' in item && item.isAI
            const activeColor = isAI ? 'var(--ai-purple)' : 'var(--accent-red)'
            const activeBg = isAI ? 'rgba(139, 92, 246, 0.15)' : 'rgba(230, 57, 70, 0.15)'

            return (
              <Link
                key={item.href}
                href={item.href}
                aria-current={active ? 'page' : undefined}
                className="relative group w-10 h-10 rounded-lg flex items-center justify-center transition-all"
                style={{
                  background: active ? activeBg : 'transparent',
                  color: active ? activeColor : 'var(--muted-custom)',
                }}
              >
                <Icon className="w-5 h-5" />
                {/* Tooltip */}
                <span
                  className="absolute left-full ml-3 px-2 py-1 rounded text-xs font-medium whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none"
                  style={{ background: 'var(--surface2)', color: 'var(--text)' }}
                >
                  {item.label}
                </span>
              </Link>
            )
          })}
        </nav>

        {/* Sign Out */}
        <button
          onClick={handleSignOut}
          className="w-10 h-10 rounded-lg flex items-center justify-center transition-all hover:bg-red-500/10 group relative"
          style={{ color: 'var(--muted-custom)' }}
          aria-label={tNav('signOut')}
        >
          <LogOut className="w-5 h-5" />
          <span
            className="absolute left-full ml-3 px-2 py-1 rounded text-xs font-medium whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none"
            style={{ background: 'var(--surface2)', color: 'var(--text)' }}
          >
            {tNav('signOut')}
          </span>
        </button>
      </aside>

      {/* Mobile Bottom Tab Bar */}
      <nav
        // Scrolls rather than squashing: eight destinations do not fit
        // across a 360px phone, and the Afrikaans labels are longer
        // ("Eksamenspel", "Paneelbord"). justify-around silently crushed
        // them into each other instead of letting the row scroll.
        className="fixed bottom-0 left-0 right-0 h-16 md:hidden flex items-center gap-1 px-2 overflow-x-auto overscroll-x-contain z-50"
        style={{
          background: 'var(--surface)',
          borderTop: '1px solid var(--border-custom)',
          paddingBottom: 'env(safe-area-inset-bottom, 0px)',
          scrollbarWidth: 'none',
        }}
      >
        {navItems.map((item) => {
          const Icon = item.icon
          const active = isActive(item.href)
          const isAI = 'isAI' in item && item.isAI
          const activeColor = isAI ? 'var(--ai-purple)' : 'var(--accent-red)'

          return (
            <Link
              key={item.href}
              href={item.href}
              aria-current={active ? 'page' : undefined}
              className="flex shrink-0 flex-col items-center justify-center gap-1 px-3 py-2 rounded-lg transition-all"
              style={{
                color: active ? activeColor : 'var(--muted-custom)',
              }}
            >
              <Icon className="w-5 h-5" />
              {/* First word only, and capped: "KI-Vaardighede" has no
                  space to split on and would otherwise set the tab width. */}
              <span className="text-[10px] font-medium max-w-[4.5rem] truncate">
                {item.label.split(' ')[0]}
              </span>
            </Link>
          )
        })}
      </nav>
    </>
  )
}
