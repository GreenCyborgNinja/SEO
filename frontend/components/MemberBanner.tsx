'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'

interface Perks {
  logged_in: boolean
  member_codes: number
  name?: string | null
}

/**
 * Thin strip below the header: invites guests to register, reminds members of
 * their available codes. Client-side so the cached layout stays cached.
 */
export default function MemberBanner() {
  const [perks, setPerks] = useState<Perks | null>(null)
  const [dismissed, setDismissed] = useState(false)

  useEffect(() => {
    // Reading sessionStorage here and bailing out avoids a synchronous setState
    // in the effect body (React 19 flags that as a cascading render).
    if (sessionStorage.getItem('dt_banner_dismissed') === '1') return

    let active = true
    fetch('/api/me/perks')
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (active && data) setPerks(data)
      })
      .catch(() => {})
    return () => {
      active = false
    }
  }, [])

  if (!perks || dismissed || perks.member_codes === 0) return null

  const dismiss = () => {
    sessionStorage.setItem('dt_banner_dismissed', '1')
    setDismissed(true)
  }

  return (
    <div className="bg-accent/10 border-b border-accent/20">
      <div className="container mx-auto px-4 py-2.5 flex items-center justify-between gap-4 text-sm">
        {perks.logged_in ? (
          <p className="text-primary">
            <span className="font-semibold">{perks.member_codes} Member-Rabatt(e)</span> für dich freigeschaltet.{' '}
            <Link href="/account#rabatte" className="text-accent font-medium hover:underline">
              Codes ansehen →
            </Link>
          </p>
        ) : (
          <p className="text-primary">
            <span className="font-semibold">{perks.member_codes} exklusive Rabatt-Codes</span> für
            registrierte Mitglieder.{' '}
            <Link href="/register" className="text-accent font-medium hover:underline">
              Kostenlos registrieren →
            </Link>
          </p>
        )}
        <button
          type="button"
          onClick={dismiss}
          aria-label="Hinweis ausblenden"
          className="text-gray-400 hover:text-gray-600 shrink-0"
        >
          ✕
        </button>
      </div>
    </div>
  )
}
