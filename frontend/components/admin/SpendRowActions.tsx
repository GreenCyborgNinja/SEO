'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function SpendRowActions({ id }: { id: string }) {
  const router = useRouter()
  const [busy, setBusy] = useState(false)

  const remove = async () => {
    setBusy(true)
    try {
      await fetch('/api/admin/spend', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id }),
      })
      router.refresh()
    } finally {
      setBusy(false)
    }
  }

  return (
    <button
      type="button"
      onClick={remove}
      disabled={busy}
      className="text-xs text-gray-400 hover:text-red-600 transition disabled:opacity-50"
      aria-label="Eintrag löschen"
    >
      {busy ? '…' : 'Löschen'}
    </button>
  )
}
