'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { signIn } from 'next-auth/react'

export default function RegisterForm() {
  const router = useRouter()
  const [form, setForm] = useState({ name: '', email: '', password: '', newsletter: true })
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)

  const submit = async (event: React.FormEvent) => {
    event.preventDefault()
    setBusy(true)
    setError('')

    try {
      const res = await fetch('/api/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      const data = await res.json()

      if (!res.ok) {
        setError(data.error ?? 'Die Registrierung ist fehlgeschlagen.')
        setBusy(false)
        return
      }

      // Straight into the session — no second form to fill in.
      const signedIn = await signIn('credentials', {
        email: form.email,
        password: form.password,
        redirect: false,
      })

      router.push(signedIn?.error ? '/login?registered=1' : '/account')
      router.refresh()
    } catch {
      setError('Keine Verbindung zum Server.')
      setBusy(false)
    }
  }

  return (
    <form onSubmit={submit} className="space-y-4">
      <div>
        <label htmlFor="name" className="block text-sm font-medium text-gray-700">Name</label>
        <input
          id="name"
          type="text"
          required
          minLength={2}
          autoComplete="name"
          value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
          className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent"
        />
      </div>

      <div>
        <label htmlFor="email" className="block text-sm font-medium text-gray-700">E-Mail-Adresse</label>
        <input
          id="email"
          type="email"
          required
          autoComplete="email"
          value={form.email}
          onChange={(e) => setForm({ ...form, email: e.target.value })}
          className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent"
        />
      </div>

      <div>
        <label htmlFor="password" className="block text-sm font-medium text-gray-700">Passwort</label>
        <input
          id="password"
          type="password"
          required
          minLength={8}
          autoComplete="new-password"
          value={form.password}
          onChange={(e) => setForm({ ...form, password: e.target.value })}
          className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent"
        />
        <p className="mt-1 text-xs text-gray-500">Mindestens 8 Zeichen.</p>
      </div>

      <label className="flex items-start gap-2 text-sm text-gray-600">
        <input
          type="checkbox"
          checked={form.newsletter}
          onChange={(e) => setForm({ ...form, newsletter: e.target.checked })}
          className="mt-0.5 accent-accent"
        />
        <span>
          Ja, ich möchte den Deal-Newsletter erhalten. Du bekommst zuerst eine Bestätigungs-E-Mail
          (Double-Opt-in) und kannst dich jederzeit abmelden.
        </span>
      </label>

      {error && <p className="text-sm text-red-600">{error}</p>}

      <button
        type="submit"
        disabled={busy}
        className="w-full bg-accent text-white py-3 rounded-xl font-bold hover:brightness-110 transition disabled:opacity-60"
      >
        {busy ? 'Konto wird erstellt …' : 'Kostenlos registrieren'}
      </button>

      <p className="text-xs text-gray-500">
        Mit der Registrierung akzeptierst du unsere{' '}
        <Link href="/privacy" className="text-accent hover:underline">Datenschutzerklärung</Link>.
      </p>
    </form>
  )
}
