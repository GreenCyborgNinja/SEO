import type { Metadata } from 'next'
import {
  isRapidAPIConfigured,
  getDeals,
  searchProducts,
  type Product,
} from '@/lib/supabase'
import ProductCard from '@/components/ProductCard'

export const metadata: Metadata = {
  title: 'Aktuelle Deals & Angebote',
  description: 'Die besten Amazon-Deals und Angebote für Technik, Laptops, Smartphones, Gaming und mehr – täglich aktualisiert.',
}

async function getDealProducts(): Promise<Product[]> {
  if (!isRapidAPIConfigured) return []

  const deals = await getDeals('DE', 'ALL', 'ALL', 'ALL')
  if (deals.length > 0) {
    return deals.map((d) => ({
      id: d.deal_id,
      external_id: d.deal_id,
      name: d.deal_title,
      description: null,
      seo_description: null,
      price: d.deal_price || 0,
      original_price: d.list_price || null,
      affiliate_url: d.deal_url,
      image_url: d.deal_photo || null,
      category: d.deal_category || 'deals',
      brand: null,
      rating: null,
      review_count: 0,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }))
  }

  const searches = ['Angebot Laptop', 'Angebot Smartphone', 'Angebot Gaming', 'Angebot Kopfhörer']
  const seen = new Set<string>()
  const products: Product[] = []

  for (const query of searches) {
    try {
      const result = await searchProducts({
        query,
        country: 'DE',
        page: 1,
        sort_by: 'RELEVANCE',
        deals_and_discounts: 'ALL',
      })
      for (const p of result.products) {
        if (!seen.has(p.id) && p.original_price && p.original_price > p.price) {
          seen.add(p.id)
          products.push(p)
        }
      }
    } catch {
      continue
    }
    if (products.length >= 30) break
  }

  return products.slice(0, 30)
}

export const revalidate = 3600

export default async function DealsPage() {
  const products = await getDealProducts()

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-10 text-center">
        <h1 className="text-4xl font-bold text-primary mb-3">Aktuelle Deals & Angebote</h1>
        <p className="text-lg text-gray-600 max-w-2xl mx-auto">
          Täglich aktualisierte Angebote von Amazon. Hier findest du die besten Preisnachlässe auf Technik-Produkte.
        </p>
      </div>

      {products.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {products.map((product, index) => (
            <ProductCard key={product.id} product={product} index={index} />
          ))}
        </div>
      ) : (
        <div className="text-center py-16">
          <p className="text-gray-500 text-lg">
            {isRapidAPIConfigured
              ? 'Derzeit keine Deals verfügbar. Bitte versuche es später erneut.'
              : 'Bitte konfiguriere RAPIDAPI_KEY in den Umgebungsvariablen, um Deals zu sehen.'}
          </p>
        </div>
      )}
    </div>
  )
}
