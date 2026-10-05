import { redirect } from 'next/navigation'
import { isDemoAuth } from '@/lib/auth/require-user'
import { isDemoDeployment } from '@/lib/env'

/**
 * Where "/" sends you.
 *
 * This used to redirect to /login unconditionally, which meant that with no
 * Supabase configured - the demo setup, where the app deliberately runs as
 * a demo student and every route is open - opening the app still landed on
 * a sign-in wall for an account that cannot exist. The only ways through
 * were to know the /dashboard URL or to spot "Continue as Demo User".
 *
 * isDemoAuth() is false in production and whenever Supabase IS configured,
 * so a real deployment still starts at /login exactly as before.
 *
 * isDemoDeployment() covers the production demo build, where isDemoAuth()
 * is false by design (it gates demo-admin, which must stay shut) but the
 * app is still serving demo content behind an open proxy. Without it "/"
 * went to /login and the proxy bounced it on to /dashboard - two redirects
 * through a sign-in page, for the one URL the client actually types.
 */
export default function Home() {
  const toDashboard = isDemoAuth() || isDemoDeployment()
  redirect(toDashboard ? '/dashboard' : '/login')
}
