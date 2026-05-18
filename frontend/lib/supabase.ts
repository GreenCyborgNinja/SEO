import { createClient, SupabaseClient } from '@supabase/supabase-js'
import {
  searchProducts,
  getProductDetails,
  getBestSellers,
  getDeals,
  isRapidAPIConfigured,
} from './rapidapi'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''

export const supabase: SupabaseClient = supabaseUrl && supabaseAnonKey
  ? createClient(supabaseUrl, supabaseAnonKey)
  : (null as unknown as SupabaseClient)

export const isConfigured = !!(supabaseUrl && supabaseAnonKey)

export function isLiveMode(): boolean {
  return isConfigured || isRapidAPIConfigured
}

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
    const deals = await getDeals(country)
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

export { searchProducts, getProductDetails, getBestSellers, getDeals, isRapidAPIConfigured }
