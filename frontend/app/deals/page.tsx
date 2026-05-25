import type { Metadata } from 'next'
import { fetchDeals, type Product } from '@/lib/supabase'
import SortableProductGrid from '@/components/SortableProductGrid'

export const metadata: Metadata = {
  title: 'Aktuelle Deals & Angebote',
  description: 'Die besten Amazon-Deals und Angebote für Technik, Laptops, Smartphones, Gaming und mehr – täglich aktualisiert.',
}

async function getDealProducts(): Promise<Product[]> {
  return fetchDeals()
}

export const dynamic = 'force-static'

export default async function DealsPage() {
  const products = await getDealProducts()

  return (
    <div>
      <div className="mb-10 text-center">
        <h1 className="text-4xl font-bold text-primary mb-3">Aktuelle Deals & Angebote</h1>
        <p className="text-lg text-gray-600 max-w-2xl mx-auto">
          Täglich aktualisierte Angebote von Amazon. Hier findest du die besten Preisnachlässe auf Technik-Produkte.
        </p>
      </div>

      <SortableProductGrid products={products} />
    </div>
  )
}
