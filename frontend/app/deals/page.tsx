import type { Metadata } from 'next'
import { getDeals } from '@/lib/db/products'
import SortableProductGrid from '@/components/SortableProductGrid'

export const revalidate = 600

export const metadata: Metadata = {
  title: 'Aktuelle Deals & Angebote',
  description:
    'Die besten Amazon-Deals und Angebote für Technik, Laptops, Smartphones, Gaming und mehr – täglich aktualisiert.',
  alternates: { canonical: '/deals' },
}

export default async function DealsPage() {
  const products = await getDeals()

  return (
    <div>
      <div className="mb-10 text-center">
        <h1 className="text-4xl font-bold text-primary mb-3">Aktuelle Deals &amp; Angebote</h1>
        <p className="text-lg text-gray-600 max-w-2xl mx-auto">
          Täglich aktualisierte Angebote von Amazon. Hier findest du die besten Preisnachlässe auf
          Technik-Produkte – sortiert nach der höchsten Ersparnis.
        </p>
      </div>

      <SortableProductGrid
        products={products}
        emptyMessage="Derzeit sind keine reduzierten Produkte verfügbar. Schau später wieder vorbei."
      />
    </div>
  )
}
