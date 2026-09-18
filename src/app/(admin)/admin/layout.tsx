import { redirect } from 'next/navigation'
import { isDemoAuth, getSessionUser, type SessionUser } from '@/lib/auth/require-user'
import { isUserAdmin } from '@/db/queries/admin'
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

  // Fail CLOSED: any error resolving the session or checking admin status
  // sends the user to /login. isAdmin is never set to true from a catch.
  let user: SessionUser | null
  let isAdminByRole = false

  try {
    user = await getSessionUser()
    if (user) {
      isAdminByRole = await isUserAdmin(user.id)
    }
  } catch (error) {
    console.error('Admin auth error:', error)
    redirect('/login')
  }

  if (!user) {
    redirect('/login')
  }

  const adminEmail = process.env.ADMIN_EMAIL
  const isAdminByEmail = Boolean(adminEmail && user.email && user.email === adminEmail)

  if (!isAdminByRole && !isAdminByEmail) {
    redirect('/dashboard')
  }

  return renderAdmin(children, user.email || 'Admin')
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
