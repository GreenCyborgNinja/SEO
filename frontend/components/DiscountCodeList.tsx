'use client'

import { useState } from 'react'
import type { MemberCode } from '@/lib/db/discounts'

interface DiscountCodeListProps {
  codes: MemberCode[]
}

/**
 * Member codes.
 *
 * We are an affiliate shop: there is no own checkout, so a code can never be
 * "applied" here. These are vouchers to redeem at Amazon — the UI says that
 * plainly instead of faking a cart discount.
 */
export default function DiscountCodeList({ codes }: DiscountCodeListProps) {
  const [revealed, setRevealed] = useState<Record<string, string>>(
    Object.fromEntries(codes.filter((code) => code.revealed).map((code) => [code.id, code.code]))
  )
  const [busy, setBusy] = useState<string | null>(null)
  const [copied, setCopied] = useState<string | null>(null)

  const reveal = async (codeId: string) => {
    setBusy(codeId)
    try {
      const res = await fetch('/api/discounts/reveal', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code_id: codeId }),
      })
      const data = await res.json()
      if (res.ok) setRevealed((prev) => ({ ...prev, [codeId]: data.code }))
    } finally {
      setBusy(null)
    }
  }

  const copy = async (code: string, codeId: string) => {
    try {
      await navigator.clipboard.writeText(code)
      setCopied(codeId)
      setTimeout(() => setCopied(null), 2000)
    } catch {
      // Clipboard blocked — the code is visible anyway.
    }
  }

  if (codes.length === 0) {
    return (
      <p className="bg-white rounded-xl shadow-md p-6 text-gray-600 text-sm">
        Aktuell sind keine Rabatt-Aktionen aktiv. Mit dem Newsletter erfährst du zuerst davon.
      </p>
    )
  }

  return (
    <div className="space-y-4">
      <p className="text-sm text-gray-600">
        Wir sind ein Affiliate-Shop – der Rabatt wird direkt bei Amazon eingelöst. Kopiere den Code
        und gib ihn dort im Bestellvorgang ein.
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {codes.map((code) => {
          const value = revealed[code.id]
          return (
            <div key={code.id} className="bg-white rounded-xl shadow-md p-5 flex flex-col">
              <div className="flex items-start justify-between gap-3">
                <h3 className="font-semibold text-gray-900">{code.title}</h3>
                <span className="shrink-0 bg-success/10 text-success text-sm font-bold px-2.5 py-1 rounded-full">
                  {code.value_label}
                </span>
              </div>
              {code.description && <p className="text-sm text-gray-600 mt-2">{code.description}</p>}

              <div className="mt-4 pt-4 border-t flex items-center gap-2">
                {value ? (
                  <>
                    <code className="flex-1 bg-gray-100 rounded-lg px-3 py-2 font-mono text-sm font-bold tracking-wider text-primary">
                      {value}
                    </code>
                    <button
                      type="button"
                      onClick={() => copy(value, code.id)}
                      className="text-sm font-medium text-accent hover:underline shrink-0"
                    >
                      {copied === code.id ? 'Kopiert!' : 'Kopieren'}
                    </button>
                  </>
                ) : (
                  <button
                    type="button"
                    onClick={() => reveal(code.id)}
                    disabled={busy === code.id}
                    className="w-full bg-accent text-white py-2.5 rounded-lg font-semibold text-sm hover:brightness-110 transition disabled:opacity-60"
                  >
                    {busy === code.id ? 'Wird geladen …' : 'Code anzeigen'}
                  </button>
                )}
              </div>

              {code.valid_until && (
                <p className="mt-3 text-xs text-gray-400">
                  Gültig bis {new Date(code.valid_until).toLocaleDateString('de-DE')}
                </p>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
