'use client'

import { useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { signIn } from 'next-auth/react'

export default function LoginForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const next = searchParams.get('next') || '/account'
  const registered = searchParams.get('registered') === '1'

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)

  const submit = async (event: React.FormEvent) => {
    event.preventDefault()
    setBusy(true)
    setError('')

    const result = await signIn('credentials', { email, password, redirect: false })

    if (result?.error) {
      // Auth.js deliberately does not say which half was wrong.
      setError('E-Mail-Adresse oder Passwort ist falsch.')
      setBusy(false)
      return
    }

    router.push(next)
    router.refresh()
  }

  return (
    <form onSubmit={submit} className="space-y-4">
      {registered && (
        <p className="bg-success/10 text-success text-sm rounded-lg px-4 py-3">
          Konto erstellt. Du kannst dich jetzt anmelden.
        </p>
      )}

      <div>
        <label htmlFor="email" className="block text-sm font-medium text-gray-700">
          E-Mail-Adresse
        </label>
        <input
          id="email"
          type="email"
          required
          autoComplete="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent"
        />
      </div>

      <div>
        <label htmlFor="password" className="block text-sm font-medium text-gray-700">
          Passwort
        </label>
        <input
          id="password"
          type="password"
          required
          autoComplete="current-password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent"
        />
      </div>

      {error && <p className="text-sm text-red-600">{error}</p>}

      <button
        type="submit"
        disabled={busy}
        className="w-full bg-accent text-white py-3 rounded-xl font-bold hover:brightness-110 transition disabled:opacity-60"
      >
        {busy ? 'Anmelden …' : 'Anmelden'}
      </button>
    </form>
  )
}
