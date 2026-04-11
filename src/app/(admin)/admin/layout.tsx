import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { createServerClient } from '@supabase/ssr'
import { isUserAdmin } from '@/db/queries/admin'
import AdminNav from './AdminNav'

export const dynamic = 'force-dynamic'

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  // Check authentication and admin status
  let isAdmin = false
  let userName = ''

  try {
    const cookieStore = await cookies()
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

    if (supabaseUrl && supabaseKey) {
      const supabase = createServerClient(supabaseUrl, supabaseKey, {
        cookies: {
          getAll() {
            return cookieStore.getAll()
          },
          setAll() {},
        },
      })

      const { data: { user } } = await supabase.auth.getUser()

      if (!user) {
        redirect('/login')
      }

      isAdmin = await isUserAdmin(user.id)
      userName = user.email || 'Admin'

      if (!isAdmin) {
        // Check for demo/dev mode - allow access if ADMIN_EMAIL matches
        const adminEmail = process.env.ADMIN_EMAIL
        if (adminEmail && user.email === adminEmail) {
          isAdmin = true
        }
      }
    } else {
      // Demo mode - allow access
      isAdmin = true
      userName = 'Demo Admin'
    }
  } catch (error) {
    console.error('Admin auth error:', error)
    // In case of error, allow demo access
    isAdmin = true
    userName = 'Demo Admin'
  }

  if (!isAdmin) {
    redirect('/dashboard')
  }

  return (
    <div className="min-h-screen" style={{ background: 'var(--bg)' }}>
      <AdminNav userName={userName} />
      <main className="p-4 md:p-6">
        {children}
      </main>
    </div>
  )
}
