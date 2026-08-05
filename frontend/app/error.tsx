'use client'

import { useEffect } from 'react'

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error(error)
  }, [error])

  return (
    <div className="text-center py-24">
      <h1 className="text-3xl font-bold text-primary">Da ist etwas schiefgelaufen</h1>
      <p className="mt-3 text-gray-600 max-w-md mx-auto">
        Die Seite konnte nicht geladen werden. Bitte versuche es erneut – falls das Problem
        bestehen bleibt, ist vermutlich die Datenbank nicht erreichbar.
      </p>
      <button
        onClick={reset}
        className="mt-8 bg-accent text-white px-6 py-3 rounded-xl font-semibold hover:brightness-110 transition"
      >
        Erneut versuchen
      </button>
    </div>
  )
}
