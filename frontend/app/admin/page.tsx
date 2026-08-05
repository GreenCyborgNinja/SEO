import type { Metadata } from 'next'
import Link from 'next/link'
import {
  getClicksByCategory,
  getClicksBySource,
  getDailySeries,
  getKpis,
  getSpendByChannel,
  getTopProducts,
} from '@/lib/db/analytics'
import StatTile from '@/components/charts/StatTile'
import BarChart from '@/components/charts/BarChart'
import LineChart from '@/components/charts/LineChart'
import { formatCompact, formatEuro } from '@/components/charts/tokens'
import { cn } from '@/lib/utils'

interface PageProps {
  searchParams: Promise<{ range?: string }>
}

export const metadata: Metadata = {
  title: 'Dashboard',
  robots: { index: false, follow: false },
}

export const dynamic = 'force-dynamic'

const RANGES = [7, 30, 90] as const

export default async function AdminPage({ searchParams }: PageProps) {
  const { range } = await searchParams
  const days = RANGES.includes(Number(range) as (typeof RANGES)[number]) ? Number(range) : 30

  const [kpis, series, topProducts, byCategory, bySource, byChannel] = await Promise.all([
    getKpis(days),
    getDailySeries(days),
    getTopProducts(days),
    getClicksByCategory(days),
    getClicksBySource(days),
    getSpendByChannel(days),
  ])

  return (
    <div className="space-y-8">
      {/* Filters in one row above the charts. */}
      <div className="flex flex-wrap items-center gap-2">
        <span className="text-sm text-gray-500 mr-1">Zeitraum:</span>
        {RANGES.map((option) => (
          <Link
            key={option}
            href={`/admin?range=${option}`}
            className={cn(
              'px-4 py-1.5 rounded-full text-sm font-medium transition',
              days === option ? 'bg-accent text-white' : 'bg-white text-gray-600 hover:bg-gray-100'
            )}
          >
            {option} Tage
          </Link>
        ))}
      </div>

      <section>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatTile
            label="Ø CAC"
            value={kpis.cac == null ? 'n/a' : formatEuro(kpis.cac)}
            hero
            tone="accent"
            hint={
              kpis.cac == null
                ? 'Kein CAC berechenbar: im Zeitraum gab es keine Neukunden.'
                : `${formatEuro(kpis.spend)} Werbekosten ÷ ${kpis.new_customers} Neukunden`
            }
          />
          <StatTile label="Seitenaufrufe" value={formatCompact(kpis.pageviews)} hint={`${formatCompact(kpis.visitors)} Sitzungen`} />
          <StatTile
            label="Affiliate-Klicks"
            value={formatCompact(kpis.clicks)}
            hint={
              // Clicks are counted server-side in /go, pageviews client-side via
              // beacon — so bots and JS-less visitors can push the ratio past 100 %.
              kpis.ctr > 100
                ? `CTR ${String(kpis.ctr).replace('.', ',')} % – mehr Klicks als gemessene Aufrufe (Besucher ohne JavaScript)`
                : `CTR ${String(kpis.ctr).replace('.', ',')} %`
            }
          />
        </div>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mt-4">
          <StatTile label="Neukunden" value={formatCompact(kpis.new_customers)} hint="Registrierungen im Zeitraum" />
          <StatTile label="Werbekosten" value={formatEuro(kpis.spend)} hint="Manuell erfasst" />
          <StatTile
            label="Klicks je Neukunde"
            value={kpis.new_customers > 0 ? formatCompact(Math.round(kpis.clicks / kpis.new_customers)) : 'n/a'}
          />
          <StatTile label="Zeitraum" value={`${days} Tage`} hint="Über die Filter oben umschaltbar" />
        </div>

        <p className="mt-4 text-xs text-gray-500 bg-white rounded-xl shadow-md px-5 py-4">
          <strong className="text-gray-700">CAC-Formel:</strong> Σ Werbekosten ÷ Neukunden. Werbekosten
          werden unter <Link href="/admin/spend" className="text-accent hover:underline">Werbekosten</Link>{' '}
          erfasst, Neukunden sind Registrierungen im gewählten Zeitraum. Ohne Neukunden ist der Wert
          nicht definiert und wird als <em>n/a</em> ausgewiesen – nicht als 0 €.
        </p>
      </section>

      <LineChart
        title="Traffic-Entwicklung"
        subtitle="Seitenaufrufe und Affiliate-Klicks pro Tag"
        data={series}
      />

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        <BarChart
          title="Top-Produkte"
          subtitle="Meiste Affiliate-Klicks im Zeitraum"
          data={topProducts}
          unit=" Klicks"
        />
        <BarChart
          title="Klicks nach Kategorie"
          subtitle="Wo die Kaufabsicht entsteht"
          data={byCategory}
          unit=" Klicks"
        />
        <BarChart
          title="Klicks nach Platzierung"
          subtitle="Welche Fläche konvertiert (aus dem ascsubtag)"
          data={bySource}
          unit=" Klicks"
        />
        <BarChart
          title="Werbekosten nach Kanal"
          subtitle="Grundlage der CAC-Berechnung"
          data={byChannel.map((entry) => ({ ...entry, value: Math.round(entry.value) }))}
          unit=" €"
          emptyMessage="Noch keine Werbekosten erfasst."
        />
      </div>
    </div>
  )
}
