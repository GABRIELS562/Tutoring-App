'use client'

import dynamic from 'next/dynamic'

/**
 * Loads the camera scanner off the critical path.
 *
 * CameraScan is rendered by the (app) layout, so it was on every page, and
 * it is the ONLY thing in that layout tree importing framer-motion -
 * checked against Sidebar, Topbar, SkipLink and InstallPrompt, none of
 * which use it. That put a 121 KB animation library in front of the
 * dashboard, the papers list, the formula sheet and the progress page,
 * none of which open a camera.
 *
 * The scanner itself is untouched; only the moment it loads changes. The
 * floating button now appears after hydration rather than in the server
 * HTML, which is the one visible trade and a fair one for taking the
 * library off pages that never use it.
 *
 * ssr:false has to live in a client component - a server component may not
 * pass it to next/dynamic - which is the only reason this wrapper exists.
 */
const CameraScan = dynamic(() => import('./CameraScan'), {
  ssr: false,
  // No skeleton: a placeholder for a floating action button would be a
  // grey circle that turns into a red one, which is worse than it simply
  // appearing.
  loading: () => null,
})

export default function CameraScanLoader() {
  return <CameraScan />
}
