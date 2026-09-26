import { redirect } from 'next/navigation'
import { isDemoAuth } from '@/lib/auth/require-user'

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
 */
export default function Home() {
  redirect(isDemoAuth() ? '/dashboard' : '/login')
}
