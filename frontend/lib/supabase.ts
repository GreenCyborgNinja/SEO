import mockProducts from './mock-products.json'

export interface Product {
  id: string
  external_id: string
  name: string
  description: string | null
  seo_description: string | null
  price: number
  original_price: number | null
  affiliate_url: string
  image_url: string | null
  category: string | null
  brand: string | null
  rating: number | null
  review_count: number
  created_at: string
  updated_at: string
}

export interface Category {
  id: string
  name: string
  slug: string
  description: string | null
}

export const CATEGORIES: Category[] = [
  { id: '1', name: 'Laptops', slug: 'laptops', description: 'Die besten Laptops' },
  { id: '2', name: 'Smartphones', slug: 'smartphones', description: 'Aktuelle Smartphones' },
  { id: '3', name: 'Gaming', slug: 'gaming', description: 'Gaming-Equipment' },
  { id: '4', name: 'Zubehör', slug: 'zubehoer', description: 'Technisches Zubehör' },
  { id: '5', name: 'Bücher', slug: 'buecher', description: 'Die besten Bücher' },
]

export const MOCK_PRODUCTS: Product[] = mockProducts as Product[]

export async function searchProducts(params: { query: string }) {
  const q = params.query.toLowerCase()
  const filtered = MOCK_PRODUCTS.filter(
    p => p.name.toLowerCase().includes(q) || (p.category && p.category.includes(q))
  )
  return { products: filtered, total_products: filtered.length, page: 1, total_pages: 1 }
}

export async function getProductDetails(asin: string) {
  return MOCK_PRODUCTS.find(p => p.id === asin || p.external_id === asin) || null
}

export async function fetchDeals() {
  return MOCK_PRODUCTS.filter(p => p.original_price != null)
}

export async function fetchAllAvailableProducts() {
  return MOCK_PRODUCTS
}

export const isConfigured = false
