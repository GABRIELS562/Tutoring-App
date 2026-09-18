import { redirect } from 'next/navigation'
import { isDemoAuth, requireAdmin, AuthError } from '@/lib/auth/require-user'
import AdminNav from './AdminNav'

export const dynamic = 'force-dynamic'

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  if (isDemoAuth()) {
    return renderAdmin(children, 'Demo Admin')
  }

  // Delegates the actual session/admin-role check to requireAdmin() (same
  // helper every admin API route uses) instead of re-implementing it here
  // - one place owns the isUserAdmin lookup and the ADMIN_EMAIL fallback.
  // Fail CLOSED: any error maps to a redirect, never to admin access.
  // A 401 (no session) goes to /login; a 403 (authenticated, not admin)
  // goes to /dashboard; anything else (a genuinely unexpected error) also
  // goes to /login, same as a missing session.
  try {
    const user = await requireAdmin()
    return renderAdmin(children, user.email || 'Admin')
  } catch (error) {
    if (error instanceof AuthError && error.status === 403) {
      redirect('/dashboard')
    }

    if (!(error instanceof AuthError)) {
      console.error('Admin auth error:', error)
    }
    redirect('/login')
  }
}

function renderAdmin(children: React.ReactNode, userName: string) {
  return (
    <div className="min-h-screen" style={{ background: 'var(--bg)' }}>
      <AdminNav userName={userName} />
      <main className="p-4 md:p-6">
        {children}
      </main>
    </div>
  )
}
