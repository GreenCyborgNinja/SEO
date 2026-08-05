'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

const CHANNELS = ['Pinterest', 'Instagram', 'Google Ads', 'TikTok', 'Sonstiges']

export default function SpendForm() {
  const router = useRouter()
  const [form, setForm] = useState({
    day: new Date().toISOString().slice(0, 10),
    channel: CHANNELS[0],
    amount_eur: '',
    note: '',
  })
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)

  const submit = async (event: React.FormEvent) => {
    event.preventDefault()
    setBusy(true)
    setError('')

    try {
      const res = await fetch('/api/admin/spend', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...form, amount_eur: Number(form.amount_eur.replace(',', '.')) }),
      })
      if (res.ok) {
        setForm({ ...form, amount_eur: '', note: '' })
        router.refresh()
      } else {
        const data = await res.json()
        setError(data.error ?? 'Speichern fehlgeschlagen.')
      }
    } catch {
      setError('Keine Verbindung zum Server.')
    } finally {
      setBusy(false)
    }
  }

  const field =
    'w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent'

  return (
    <form onSubmit={submit} className="grid grid-cols-1 sm:grid-cols-5 gap-3 items-end">
      <div>
        <label htmlFor="day" className="block text-xs font-medium text-gray-600 mb-1">Datum</label>
        <input
          id="day"
          type="date"
          required
          value={form.day}
          onChange={(e) => setForm({ ...form, day: e.target.value })}
          className={field}
        />
      </div>

      <div>
        <label htmlFor="channel" className="block text-xs font-medium text-gray-600 mb-1">Kanal</label>
        <select
          id="channel"
          value={form.channel}
          onChange={(e) => setForm({ ...form, channel: e.target.value })}
          className={field}
        >
          {CHANNELS.map((channel) => (
            <option key={channel} value={channel}>{channel}</option>
          ))}
        </select>
      </div>

      <div>
        <label htmlFor="amount" className="block text-xs font-medium text-gray-600 mb-1">Betrag (€)</label>
        <input
          id="amount"
          type="text"
          inputMode="decimal"
          required
          placeholder="50,00"
          value={form.amount_eur}
          onChange={(e) => setForm({ ...form, amount_eur: e.target.value })}
          className={field}
        />
      </div>

      <div>
        <label htmlFor="note" className="block text-xs font-medium text-gray-600 mb-1">Notiz</label>
        <input
          id="note"
          type="text"
          placeholder="optional"
          value={form.note}
          onChange={(e) => setForm({ ...form, note: e.target.value })}
          className={field}
        />
      </div>

      <button
        type="submit"
        disabled={busy}
        className="bg-accent text-white py-2 px-4 rounded-lg text-sm font-semibold hover:brightness-110 transition disabled:opacity-60"
      >
        {busy ? 'Speichern …' : 'Hinzufügen'}
      </button>

      {error && <p className="sm:col-span-5 text-sm text-red-600">{error}</p>}
    </form>
  )
}
