import { redirect } from 'next/navigation'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { UserProvider, UserData } from '@/context/UserContext'
import Sidebar from '@/components/layout/Sidebar'
import SkipLink from '@/components/layout/SkipLink'
import InstallPrompt from '@/components/InstallPrompt'
import CameraScanLoader from '@/components/ai/CameraScanLoader'

// Force dynamic rendering - don't prerender at build time
export const dynamic = 'force-dynamic'

async function getUser(): Promise<UserData | null> {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  // If Supabase isn't configured, return a demo user
  if (!supabaseUrl || !supabaseKey) {
    return {
      id: 'demo-user',
      email: 'demo@example.com',
      name: 'Demo Student',
      grade: 11,
      school: 'Demo School',
      xp: 1250,
      streakCount: 7,
      hearts: 5,
      isPremium: false,
    }
  }

  const cookieStore = await cookies()

  const supabase = createServerClient(supabaseUrl, supabaseKey, {
    cookies: {
      getAll() {
        return cookieStore.getAll()
      },
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) =>
            cookieStore.set(name, value, options)
          )
        } catch {
          // Ignore
        }
      },
    },
  })

  const {
    data: { user: authUser },
  } = await supabase.auth.getUser()

  if (!authUser) {
    return null
  }

  // Get user data from public.users table
  const { data: userData } = await supabase
    .from('users')
    .select('*')
    .eq('id', authUser.id)
    .single()

  if (userData) {
    return {
      id: userData.id,
      email: userData.email,
      name: userData.name,
      grade: userData.grade,
      school: userData.school,
      xp: userData.xp || 0,
      streakCount: userData.streak_count || 0,
      hearts: userData.hearts || 5,
      isPremium: userData.is_premium || false,
    }
  }

  // Fallback if user row doesn't exist yet
  return {
    id: authUser.id,
    email: authUser.email || '',
    name: authUser.user_metadata?.name || 'Student',
    grade: authUser.user_metadata?.grade || null,
    school: null,
    xp: 0,
    streakCount: 0,
    hearts: 5,
    isPremium: false,
  }
}

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const user = await getUser()

  // Only redirect if Supabase is configured and user is null
  const supabaseConfigured = process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  if (supabaseConfigured && !user) {
    redirect('/login')
  }

  return (
    <UserProvider user={user}>
      <SkipLink />
      <div className="min-h-screen" style={{ background: 'var(--bg)' }}>
        <Sidebar />
        {/* Main content area. tabIndex={-1} makes it a valid programmatic
            focus target for SkipLink - without it, .focus() from script
            is a no-op on a non-interactive element like <main>. */}
        <main id="main-content" tabIndex={-1} className="md:ml-[60px] pb-20 md:pb-0">
          {children}
        </main>
        <InstallPrompt />
        <CameraScanLoader />
      </div>
    </UserProvider>
  )
}
