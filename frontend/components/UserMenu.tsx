'use client'

import { useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

interface SessionUser {
  name?: string | null
  email?: string | null
  role?: string
}

/**
 * Session-aware header menu. Deliberately a client component fetching
 * /api/auth/session: if the root layout read the session on the server, every
 * page would become dynamic and the whole catalogue would lose ISR caching.
 */
export default function UserMenu() {
  const [user, setUser] = useState<SessionUser | null>(null)
  const [open, setOpen] = useState(false)
  const wrapperRef = useRef<HTMLDivElement>(null)
  const router = useRouter()

  useEffect(() => {
    let active = true
    fetch('/api/auth/session')
      .then((res) => res.json())
      .then((data) => {
        if (active) setUser(data?.user ?? null)
      })
      .catch(() => {})
    return () => {
      active = false
    }
  }, [])

  useEffect(() => {
    const onClick = (event: MouseEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', onClick)
    return () => document.removeEventListener('mousedown', onClick)
  }, [])

  const signOut = async () => {
    // Auth.js requires the CSRF token for the sign-out POST.
    const csrf = await fetch('/api/auth/csrf').then((res) => res.json())
    await fetch('/api/auth/signout', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({ csrfToken: csrf.csrfToken, json: 'true' }),
    })
    setUser(null)
    setOpen(false)
    router.refresh()
  }

  if (!user) {
    return (
      <Link
        href="/login"
        className="shrink-0 text-sm font-medium hover:text-accent transition-colors whitespace-nowrap"
      >
        Anmelden
      </Link>
    )
  }

  const initial = (user.name || user.email || '?').charAt(0).toUpperCase()

  return (
    <div ref={wrapperRef} className="relative shrink-0">
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        aria-expanded={open}
        aria-haspopup="menu"
        className="w-9 h-9 rounded-full bg-accent text-white font-bold flex items-center justify-center hover:brightness-110 transition"
        title={user.email ?? 'Mein Konto'}
      >
        {initial}
      </button>

      {open && (
        <div
          role="menu"
          className="absolute right-0 mt-2 w-56 bg-white text-gray-700 rounded-lg shadow-xl overflow-hidden z-50"
        >
          <div className="px-4 py-3 border-b">
            <p className="text-sm font-semibold text-gray-900 truncate">{user.name || 'Mein Konto'}</p>
            <p className="text-xs text-gray-500 truncate">{user.email}</p>
          </div>
          <Link href="/account" className="block px-4 py-2.5 text-sm hover:bg-gray-50" onClick={() => setOpen(false)}>
            Mein Konto
          </Link>
          <Link href="/account#merkliste" className="block px-4 py-2.5 text-sm hover:bg-gray-50" onClick={() => setOpen(false)}>
            Merkliste
          </Link>
          <Link href="/account#rabatte" className="block px-4 py-2.5 text-sm hover:bg-gray-50" onClick={() => setOpen(false)}>
            Meine Rabatte
          </Link>
          {user.role === 'admin' && (
            <Link
              href="/admin"
              className="block px-4 py-2.5 text-sm font-medium text-accent hover:bg-gray-50 border-t"
              onClick={() => setOpen(false)}
            >
              Admin-Dashboard
            </Link>
          )}
          <button
            type="button"
            onClick={signOut}
            className="w-full text-left px-4 py-2.5 text-sm text-gray-600 hover:bg-gray-50 border-t"
          >
            Abmelden
          </button>
        </div>
      )}
    </div>
  )
}
