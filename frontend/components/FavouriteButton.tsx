'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { cn } from '@/lib/utils'

interface FavouriteButtonProps {
  productId: string
  size?: 'sm' | 'md'
  showLabel?: boolean
}

/**
 * Wishlist toggle. Client-side so product pages stay statically cached; the
 * favourite state is fetched once per mount from /api/favorites.
 */
export default function FavouriteButton({ productId, size = 'md', showLabel = false }: FavouriteButtonProps) {
  const [state, setState] = useState<'unknown' | 'guest' | 'on' | 'off'>('unknown')
  const [busy, setBusy] = useState(false)
  const router = useRouter()

  useEffect(() => {
    let active = true
    fetch('/api/favorites')
      .then((res) => (res.status === 401 ? null : res.json()))
      .then((data) => {
        if (!active) return
        if (!data) return setState('guest')
        setState(data.product_ids?.includes(productId) ? 'on' : 'off')
      })
      .catch(() => active && setState('guest'))
    return () => {
      active = false
    }
  }, [productId])

  const toggle = async () => {
    if (state === 'guest') return router.push(`/login?next=${encodeURIComponent(`/product/${productId}`)}`)
    if (state === 'unknown' || busy) return

    const next = state === 'on' ? 'off' : 'on'
    setBusy(true)
    setState(next) // optimistic
    try {
      const res = await fetch('/api/favorites', {
        method: next === 'on' ? 'POST' : 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ product_id: productId }),
      })
      if (!res.ok) setState(state)
    } catch {
      setState(state)
    } finally {
      setBusy(false)
    }
  }

  const active = state === 'on'
  const iconSize = size === 'sm' ? 'w-4 h-4' : 'w-5 h-5'

  return (
    <button
      type="button"
      onClick={toggle}
      disabled={busy}
      aria-pressed={active}
      aria-label={active ? 'Von der Merkliste entfernen' : 'Zur Merkliste hinzufügen'}
      title={
        state === 'guest'
          ? 'Anmelden, um Produkte zu merken'
          : active
            ? 'Von der Merkliste entfernen'
            : 'Zur Merkliste hinzufügen'
      }
      className={cn(
        'inline-flex items-center gap-1.5 shrink-0 transition-colors',
        showLabel && 'text-sm font-medium',
        active ? 'text-accent' : 'text-gray-400 hover:text-accent'
      )}
    >
      <svg className={iconSize} fill={active ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
        />
      </svg>
      {showLabel && <span>{active ? 'Gemerkt' : 'Merken'}</span>}
    </button>
  )
}
