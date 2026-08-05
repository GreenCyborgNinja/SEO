'use client'

import { useEffect } from 'react'
import { usePathname } from 'next/navigation'

/**
 * First-party pageview tracking — our replacement for Google Analytics.
 *
 * Fire-and-forget via sendBeacon: nothing is awaited during render, so page
 * performance is unaffected. No third-party script, no cross-site cookie, only
 * the anonymous dt_sid issued by our own middleware.
 */
export default function Analytics() {
  const pathname = usePathname()

  useEffect(() => {
    if (!pathname) return
    // Internal routes are not content — tracking them only adds noise.
    if (pathname.startsWith('/admin') || pathname.startsWith('/api')) return

    const payload = JSON.stringify({ type: 'pageview', path: pathname })

    if (navigator.sendBeacon) {
      navigator.sendBeacon('/api/track', new Blob([payload], { type: 'application/json' }))
    } else {
      void fetch('/api/track', {
        method: 'POST',
        body: payload,
        headers: { 'Content-Type': 'application/json' },
        keepalive: true,
      }).catch(() => {})
    }
  }, [pathname])

  return null
}
