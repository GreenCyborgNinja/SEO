'use client'

import { useState } from 'react'

/** The contact form had no handler at all before — it silently discarded everything. */
export default function ContactForm() {
  const [form, setForm] = useState({ name: '', email: '', subject: '', message: '' })
  const [state, setState] = useState<'idle' | 'sending' | 'done' | 'error'>('idle')
  const [error, setError] = useState('')

  const submit = async (event: React.FormEvent) => {
    event.preventDefault()
    setState('sending')
    setError('')

    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      const data = await res.json()
      if (res.ok) {
        setState('done')
      } else {
        setState('error')
        setError(data.error ?? 'Die Nachricht konnte nicht gesendet werden.')
      }
    } catch {
      setState('error')
      setError('Keine Verbindung zum Server.')
    }
  }

  if (state === 'done') {
    return (
      <div className="bg-success/10 text-success rounded-lg p-6">
        <p className="font-semibold">Danke für deine Nachricht!</p>
        <p className="text-sm mt-1">Wir melden uns so schnell wie möglich bei dir.</p>
      </div>
    )
  }

  const field = 'w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent'

  return (
    <form onSubmit={submit} className="space-y-4">
      <div>
        <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">Name</label>
        <input
          id="name"
          type="text"
          required
          value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
          className={field}
          placeholder="Dein Name"
        />
      </div>

      <div>
        <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">E-Mail</label>
        <input
          id="email"
          type="email"
          required
          value={form.email}
          onChange={(e) => setForm({ ...form, email: e.target.value })}
          className={field}
          placeholder="deine@email.de"
        />
      </div>

      <div>
        <label htmlFor="subject" className="block text-sm font-medium text-gray-700 mb-1">Betreff</label>
        <input
          id="subject"
          type="text"
          required
          value={form.subject}
          onChange={(e) => setForm({ ...form, subject: e.target.value })}
          className={field}
          placeholder="Worum geht es?"
        />
      </div>

      <div>
        <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-1">Nachricht</label>
        <textarea
          id="message"
          rows={6}
          required
          minLength={10}
          value={form.message}
          onChange={(e) => setForm({ ...form, message: e.target.value })}
          className={field}
          placeholder="Deine Nachricht an uns..."
        />
      </div>

      {state === 'error' && <p className="text-sm text-red-600">{error}</p>}

      <button
        type="submit"
        disabled={state === 'sending'}
        className="w-full bg-accent text-white py-3 px-4 rounded-md hover:brightness-110 transition font-medium disabled:opacity-60"
      >
        {state === 'sending' ? 'Wird gesendet …' : 'Nachricht senden'}
      </button>
    </form>
  )
}
