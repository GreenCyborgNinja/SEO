import { createClient, SupabaseClient } from '@supabase/supabase-js'
import {
  searchProducts as rapidSearch,
  getProductDetails as rapidDetails,
  getBestSellers,
  getDeals as rapidDeals,
  isRapidAPIConfigured,
} from './rapidapi'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''

export const supabase: SupabaseClient = supabaseUrl && supabaseAnonKey
  ? createClient(supabaseUrl, supabaseAnonKey)
  : (null as unknown as SupabaseClient)

export const isConfigured = !!(supabaseUrl && supabaseAnonKey)

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

export const MOCK_PRODUCTS: Product[] = [
  {
    id: '1', external_id: 'LAPTOP-001', name: 'Apple MacBook Pro 14" M3 Pro',
    description: 'Das MacBook Pro mit M3 Pro Chip bietet enorme Leistung für Profis.',
    seo_description: 'Entdecke das neue Apple MacBook Pro mit M3 Pro Chip. Perfekt für Profis.',
    price: 1999.00, original_price: 2249.00,
    affiliate_url: 'https://www.amazon.de/dp/B0CMZFCQ6D',
    image_url: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=800',
    category: 'laptops', brand: 'Apple', rating: 4.8, review_count: 234,
    created_at: new Date().toISOString(), updated_at: new Date().toISOString(),
  },
  {
    id: '2', external_id: 'LAPTOP-002', name: 'ASUS ROG Strix G16 Gaming Laptop',
    description: 'Gaming-Laptop mit Intel Core i7-13650HX, NVIDIA RTX 4070.',
    seo_description: 'ASUS ROG Strix G16 - Gaming-Power mit RTX 4070.',
    price: 1499.00, original_price: 1799.00,
    affiliate_url: 'https://www.amazon.de/dp/B0CMZFCQ6D',
    image_url: 'https://images.unsplash.com/photo-1603302576837-37561b2e2302?w=800',
    category: 'gaming', brand: 'ASUS', rating: 4.6, review_count: 156,
    created_at: new Date().toISOString(), updated_at: new Date().toISOString(),
  },
  {
    id: '3', external_id: 'LAPTOP-003', name: 'Lenovo ThinkPad X1 Carbon Gen 11',
    description: 'Ultraleichtes Business-Notebook mit Intel Core i7.',
    seo_description: 'Lenovo ThinkPad X1 Carbon - Der Business-Klassiker.',
    price: 1699.00, original_price: 1999.00,
    affiliate_url: 'https://www.amazon.de/dp/B0CMZFCQ6D',
    image_url: 'https://images.unsplash.com/photo-1588872657578-7efd1f1555ed?w=800',
    category: 'laptops', brand: 'Lenovo', rating: 4.7, review_count: 89,
    created_at: new Date().toISOString(), updated_at: new Date().toISOString(),
  },
  {
    id: '4', external_id: 'PHONE-001', name: 'Samsung Galaxy S24 Ultra',
    description: 'Premium-Smartphone mit 256GB, Titanium Gray, Galaxy AI.',
    seo_description: 'Das Samsung Galaxy S24 Ultra mit revolutionären AI-Funktionen.',
    price: 1399.00, original_price: 1499.00,
    affiliate_url: 'https://www.amazon.de/dp/B0CMZFCQ6D',
    image_url: 'https://images.unsplash.com/photo-1610945265064-0e34e5519bbf?w=800',
    category: 'smartphones', brand: 'Samsung', rating: 4.9, review_count: 412,
    created_at: new Date().toISOString(), updated_at: new Date().toISOString(),
  },
  {
    id: '5', external_id: 'PHONE-002', name: 'Apple iPhone 15 Pro Max 256GB',
    description: 'A17 Pro Chip, Titanium-Design, 5x Optical Zoom.',
    seo_description: 'iPhone 15 Pro Max mit Titan-Design und A17 Pro Chip.',
    price: 1199.00, original_price: 1399.00,
    affiliate_url: 'https://www.amazon.de/dp/B0CMZFCQ6D',
    image_url: 'https://images.unsplash.com/photo-1695043133149-9cb9074a2d4a?w=800',
    category: 'smartphones', brand: 'Apple', rating: 4.8, review_count: 567,
    created_at: new Date().toISOString(), updated_at: new Date().toISOString(),
  },
  {
    id: '6', external_id: 'PHONE-003', name: 'Google Pixel 8 Pro',
    description: 'AI-Smartphone mit Tensor G3 Chip, 7 Jahre Updates.',
    seo_description: 'Google Pixel 8 Pro - AI-First Smartphone.',
    price: 899.00, original_price: 999.00,
    affiliate_url: 'https://www.amazon.de/dp/B0CMZFCQ6D',
    image_url: 'https://images.unsplash.com/photo-1598327105666-5b89351aff70?w=800',
    category: 'smartphones', brand: 'Google', rating: 4.7, review_count: 234,
    created_at: new Date().toISOString(), updated_at: new Date().toISOString(),
  },
  {
    id: '7', external_id: 'GAMING-001', name: 'Sony PlayStation 5 Slim',
    description: 'Die neue slim Version der PS5 mit 1TB SSD.',
    seo_description: 'Sony PlayStation 5 Slim - Next-Gen Gaming jetzt kompakter.',
    price: 449.00, original_price: 499.00,
    affiliate_url: 'https://www.amazon.de/dp/B0CMZFCQ6D',
    image_url: 'https://images.unsplash.com/photo-1606144042614-b2417e99c4e3?w=800',
    category: 'gaming', brand: 'Sony', rating: 4.9, review_count: 1023,
    created_at: new Date().toISOString(), updated_at: new Date().toISOString(),
  },
  {
    id: '8', external_id: 'GAMING-002', name: 'Xbox Series X',
    description: '1TB SSD, 4K/120fps Gaming.',
    seo_description: 'Xbox Series X - Next-Gen Gaming vom Feinsten.',
    price: 449.00, original_price: 499.00,
    affiliate_url: 'https://www.amazon.de/dp/B0CMZFCQ6D',
    image_url: 'https://images.unsplash.com/photo-1621259182978-fbf93132d53d?w=800',
    category: 'gaming', brand: 'Microsoft', rating: 4.8, review_count: 892,
    created_at: new Date().toISOString(), updated_at: new Date().toISOString(),
  },
  {
    id: '9', external_id: 'ACC-001', name: 'Logitech MX Master 3S',
    description: 'Premium kabellose Maus, 8K DPI, leise Klicks.',
    seo_description: 'Logitech MX Master 3S - Die perfekte Maus für Produktivität.',
    price: 89.99, original_price: 99.99,
    affiliate_url: 'https://www.amazon.de/dp/B0CMZFCQ6D',
    image_url: 'https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?w=800',
    category: 'zubehoer', brand: 'Logitech', rating: 4.8, review_count: 1245,
    created_at: new Date().toISOString(), updated_at: new Date().toISOString(),
  },
  {
    id: '10', external_id: 'ACC-002', name: 'Apple AirPods Pro (2. Gen)',
    description: 'Active Noise Cancelling, MagSafe Ladecase.',
    seo_description: 'Apple AirPods Pro - Sound der Spitzenklasse.',
    price: 229.00, original_price: 279.00,
    affiliate_url: 'https://www.amazon.de/dp/B0CMZFCQ6D',
    image_url: 'https://images.unsplash.com/photo-1600294037681-c80b4cb5b434?w=800',
    category: 'zubehoer', brand: 'Apple', rating: 4.7, review_count: 2134,
    created_at: new Date().toISOString(), updated_at: new Date().toISOString(),
  },
  {
    id: '11', external_id: 'LAPTOP-004', name: 'Dell XPS 15',
    description: '15.6" OLED, Intel Core i7-13700H, 32GB RAM.',
    seo_description: 'Dell XPS 15 - Eleganz trifft Leistung.',
    price: 1899.00, original_price: 2199.00,
    affiliate_url: 'https://www.amazon.de/dp/B0CMZFCQ6D',
    image_url: 'https://images.unsplash.com/photo-1593642632559-0c6d3fc62b89?w=800',
    category: 'laptops', brand: 'Dell', rating: 4.6, review_count: 178,
    created_at: new Date().toISOString(), updated_at: new Date().toISOString(),
  },
  {
    id: '12', external_id: 'GAMING-003', name: 'Nintendo Switch OLED',
    description: 'OLED Display, 64GB Speicher, Ethernet-Port.',
    seo_description: 'Nintendo Switch OLED - Das beste Hybrid-Gaming.',
    price: 349.00, original_price: 379.00,
    affiliate_url: 'https://www.amazon.de/dp/B0CMZFCQ6D',
    image_url: 'https://images.unsplash.com/photo-1578303512597-81e6cc155b3e?w=800',
    category: 'gaming', brand: 'Nintendo', rating: 4.8, review_count: 756,
    created_at: new Date().toISOString(), updated_at: new Date().toISOString(),
  },
]

export const MOCK_CATEGORIES: Category[] = CATEGORIES

export async function fetchDeals(country = 'DE') {
  if (isConfigured) {
    const { data } = await supabase
      .from('products')
      .select('*')
      .not('original_price', 'is', null)
      .order('created_at', { ascending: false })
      .limit(12)
    if (data && data.length > 0) return data as Product[]
  }
  if (isRapidAPIConfigured) {
    const deals = await rapidDeals(country)
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
      category: d.deal_category || null,
      brand: null,
      rating: null,
      review_count: 0,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }))
  }
  return []
}

export async function searchProducts(params: {
  query: string; country?: string; page?: number; sort_by?: string;
  product_condition?: string; is_prime?: boolean; deals_and_discounts?: string;
}) {
  if (isConfigured) {
    const { data } = await supabase
      .from('products')
      .select('*')
      .ilike('name', `%${params.query}%`)
      .limit(20)
    if (data && data.length > 0) return { products: data as Product[], total_products: data.length, page: 1, total_pages: 1 }
  }
  const mockFiltered = MOCK_PRODUCTS.filter(
    (p) => p.name.toLowerCase().includes(params.query.toLowerCase()) || p.category?.includes(params.query.toLowerCase())
  )
  if (mockFiltered.length > 0) return { products: mockFiltered, total_products: mockFiltered.length, page: 1, total_pages: 1 }
  if (isRapidAPIConfigured) return rapidSearch(params)
  return { products: [], total_products: 0, page: 1, total_pages: 1 }
}

export async function getProductDetails(asin: string, country = 'DE') {
  if (isConfigured) {
    const { data } = await supabase.from('products').select('*').eq('external_id', asin).single()
    if (data) return data as Product
  }
  const mock = MOCK_PRODUCTS.find((p) => p.id === asin || p.external_id === asin)
  if (mock) return mock
  if (isRapidAPIConfigured) return rapidDetails(asin, country)
  return null
}

export { getBestSellers, rapidDeals as getDeals, isRapidAPIConfigured }
