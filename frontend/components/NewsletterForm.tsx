'use client'

import { useState } from 'react'

interface NewsletterFormProps {
  source?: string
  defaultEmail?: string
  compact?: boolean
}

export default function NewsletterForm({ source = 'footer', defaultEmail = '' }: NewsletterFormProps) {
  const [email, setEmail] = useState(defaultEmail)
  const [state, setState] = useState<'idle' | 'sending' | 'done' | 'error'>('idle')
  const [message, setMessage] = useState('')

  const submit = async (event: React.FormEvent) => {
    event.preventDefault()
    setState('sending')
    try {
      const res = await fetch('/api/newsletter/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, source }),
      })
      const data = await res.json()
      if (res.ok) {
        setState('done')
        setMessage(data.message)
      } else {
        setState('error')
        setMessage(data.error ?? 'Das hat nicht funktioniert. Bitte versuche es später erneut.')
      }
    } catch {
      setState('error')
      setMessage('Keine Verbindung zum Server.')
    }
  }

  if (state === 'done') {
    return <p className="text-sm text-success">{message}</p>
  }

  return (
    <form onSubmit={submit} className="space-y-2">
      <label htmlFor={`newsletter-${source}`} className="sr-only">
        E-Mail-Adresse
      </label>
      <div className="flex gap-2">
        <input
          id={`newsletter-${source}`}
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="deine@email.de"
          className="flex-1 min-w-0 px-3 py-2 rounded-lg bg-primary border border-gray-600 text-white placeholder-gray-500 text-sm focus:outline-none focus:border-accent"
        />
        <button
          type="submit"
          disabled={state === 'sending'}
          className="bg-accent text-white px-4 py-2 rounded-lg text-sm font-semibold hover:brightness-110 transition disabled:opacity-60"
        >
          {state === 'sending' ? '…' : 'Abonnieren'}
        </button>
      </div>
      {state === 'error' && <p className="text-xs text-red-400">{message}</p>}
      <p className="text-xs text-gray-500">
        Wir senden dir eine Bestätigungs-E-Mail (Double-Opt-in). Abmeldung jederzeit möglich.
      </p>
    </form>
  )
}
