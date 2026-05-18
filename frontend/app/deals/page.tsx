import type { Metadata } from 'next'
import {
  MOCK_PRODUCTS,
  getDeals,
  type Product,
} from '@/lib/supabase'
import ProductCard from '@/components/ProductCard'

export const metadata: Metadata = {
  title: 'Aktuelle Deals & Angebote',
  description: 'Die besten Amazon-Deals und Angebote für Technik, Laptops, Smartphones, Gaming und mehr – täglich aktualisiert.',
}

async function getDealProducts(): Promise<Product[]> {
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
  const discounted = MOCK_PRODUCTS.filter(p => p.original_price != null)
  return discounted.length > 0 ? discounted : MOCK_PRODUCTS
}

export const revalidate = 86400

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
          <p className="text-gray-500 text-lg">Derzeit keine Deals verfügbar.</p>
        </div>
      )}
    </div>
  )
}
