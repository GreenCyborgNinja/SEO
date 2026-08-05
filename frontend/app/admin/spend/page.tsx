import type { Metadata } from 'next'
import { getSpendEntries } from '@/lib/db/analytics'
import { formatEuro } from '@/components/charts/tokens'
import SpendForm from '@/components/admin/SpendForm'
import SpendRowActions from '@/components/admin/SpendRowActions'

export const metadata: Metadata = {
  title: 'Werbekosten',
  robots: { index: false, follow: false },
}

export const dynamic = 'force-dynamic'

export default async function SpendPage() {
  const entries = await getSpendEntries()
  const total = entries.reduce((sum, entry) => sum + entry.amount_eur, 0)

  return (
    <div className="space-y-8">
      <div className="bg-white rounded-xl shadow-md p-6">
        <h2 className="font-semibold text-primary">Werbekosten erfassen</h2>
        <p className="text-sm text-gray-500 mt-1 mb-5">
          Trage aus, was du für Werbung ausgegeben hast (z.&nbsp;B. Pinterest, Instagram). Diese
          Summe ist der Zähler der CAC-Formel.
        </p>
        <SpendForm />
      </div>

      <div className="bg-white rounded-xl shadow-md p-6">
        <div className="flex items-baseline justify-between gap-4 mb-4">
          <h2 className="font-semibold text-primary">Erfasste Ausgaben</h2>
          <p className="text-sm text-gray-500">
            Summe: <span className="font-semibold text-primary tabular-nums">{formatEuro(total)}</span>
          </p>
        </div>

        {entries.length === 0 ? (
          <p className="text-sm text-gray-500">
            Noch keine Ausgaben erfasst. Ohne Werbekosten bleibt der CAC bei 0 €.
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-gray-500 border-b">
                  <th className="py-2 pr-4 font-medium">Datum</th>
                  <th className="py-2 pr-4 font-medium">Kanal</th>
                  <th className="py-2 pr-4 font-medium text-right">Betrag</th>
                  <th className="py-2 pr-4 font-medium">Notiz</th>
                  <th className="py-2 font-medium sr-only">Aktion</th>
                </tr>
              </thead>
              <tbody>
                {entries.map((entry) => (
                  <tr key={entry.id} className="border-b last:border-b-0">
                    <td className="py-2.5 pr-4 tabular-nums whitespace-nowrap">
                      {new Date(entry.day).toLocaleDateString('de-DE')}
                    </td>
                    <td className="py-2.5 pr-4">{entry.channel}</td>
                    <td className="py-2.5 pr-4 text-right tabular-nums font-medium">
                      {formatEuro(entry.amount_eur)}
                    </td>
                    <td className="py-2.5 pr-4 text-gray-500">{entry.note || '–'}</td>
                    <td className="py-2.5 text-right">
                      <SpendRowActions id={entry.id} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
