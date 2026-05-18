import type { Product } from './supabase'

const RAPIDAPI_HOST = 'real-time-amazon-data.p.rapidapi.com'
const RAPIDAPI_KEY = process.env.RAPIDAPI_KEY || process.env.NEXT_PUBLIC_RAPIDAPI_KEY || ''

function getHeaders(): Record<string, string> {
  if (!RAPIDAPI_KEY) {
    throw new Error('RAPIDAPI_KEY is not configured')
  }
  return {
    'x-rapidapi-key': RAPIDAPI_KEY,
    'x-rapidapi-host': RAPIDAPI_HOST,
    'Content-Type': 'application/json',
  }
}

async function fetchRapidAPI<T>(endpoint: string, params: Record<string, string>): Promise<T> {
  const url = new URL(`https://${RAPIDAPI_HOST}${endpoint}`)
  Object.entries(params).forEach(([key, value]) => url.searchParams.set(key, value))

  const response = await fetch(url.toString(), { headers: getHeaders(), next: { revalidate: 86400 } })

  if (!response.ok) {
    throw new Error(`RapidAPI error: ${response.status} ${response.statusText}`)
  }

  const json = await response.json()
  if (json.status === 'ERROR') {
    throw new Error(`RapidAPI error: ${json.error?.message || 'Unknown error'}`)
  }

  return json.data as T
}

interface RapidAPIProduct {
  asin: string
  product_title: string
  product_description?: string
  product_price: string | number
  product_original_price?: string | number
  product_url: string
  product_photo: string
  product_star_rating?: string | number
  product_num_ratings?: string | number
  product_details?: Record<string, string>
  category_path?: string
  sales_rank?: string | number
  brand?: string
}

function parseGermanPrice(value: string | number | undefined | null): number {
  if (value == null) return 0
  if (typeof value === 'number') return value
  const cleaned = value.replace(/[^0-9.,]/g, '')
  const normalized = cleaned.replace(/\./g, '').replace(',', '.')
  return parseFloat(normalized) || 0
}

function transformProduct(item: RapidAPIProduct): Product {
  const price = parseGermanPrice(item.product_price)
  const originalPrice = item.product_original_price ? parseGermanPrice(item.product_original_price) : 0

  const rating = item.product_star_rating
    ? parseFloat(String(item.product_star_rating))
    : null

  return {
    id: item.asin,
    external_id: item.asin,
    name: item.product_title || '',
    description: item.product_description || null,
    seo_description: null,
    price: isNaN(price) ? 0 : price,
    original_price: originalPrice && !isNaN(originalPrice) && originalPrice > 0 ? originalPrice : null,
    affiliate_url: item.product_url || `https://www.amazon.de/dp/${item.asin}`,
    image_url: item.product_photo || null,
    category: item.category_path?.split('>')[0]?.trim() || null,
    brand: item.product_details?.brand || item.brand || null,
    rating,
    review_count: item.product_num_ratings ? parseInt(String(item.product_num_ratings), 10) || 0 : 0,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  }
}

export interface SearchResponse {
  products: Product[]
  total_products: number
  page: number
  total_pages: number
}

export async function searchProducts(params: {
  query: string
  country?: string
  page?: number
  sort_by?: string
  product_condition?: string
  is_prime?: boolean
  deals_and_discounts?: string
}): Promise<SearchResponse> {
  const queryParams: Record<string, string> = {
    query: params.query,
    country: params.country || 'DE',
    page: String(params.page || 1),
    sort_by: params.sort_by || 'RELEVANCE',
    product_condition: params.product_condition || 'ALL',
    is_prime: String(!!params.is_prime).toLowerCase(),
    deals_and_discounts: params.deals_and_discounts || 'NONE',
  }

  const data = await fetchRapidAPI<any>('/search', queryParams)
  return {
    products: (data.products || []).map(transformProduct),
    total_products: data.total_products || 0,
    page: data.page || 1,
    total_pages: data.total_pages || 1,
  }
}

export async function getProductDetails(asin: string, country = 'DE'): Promise<Product | null> {
  try {
    const data = await fetchRapidAPI<any>('/product-details', { asin, country })
    return data ? transformProduct(data) : null
  } catch {
    return null
  }
}

export interface Offer {
  id: string
  price: number
  seller_name?: string
  seller_id?: string
  condition?: string
  delivery_info?: string
}

export interface ProductOffersResponse {
  product: Product
  offers: Offer[]
  total_offers: number
  page: number
}

export async function getProductOffers(
  asin: string,
  country = 'DE',
  limit = 50,
  page = 1
): Promise<ProductOffersResponse | null> {
  try {
    const data = await fetchRapidAPI<any>('/product-offers', {
      asin,
      country,
      limit: String(limit),
      page: String(page),
    })
    return {
      product: data ? transformProduct(data) : null as unknown as Product,
      offers: (data.product_offers || []).map((o: any) => ({
        id: o.offer_id || o.id,
        price: parseFloat(String(o.price || 0)),
        seller_name: o.seller_name,
        seller_id: o.seller_id,
        condition: o.condition,
        delivery_info: o.delivery_info,
      })),
      total_offers: data.total_offers || 0,
      page: data.page || 1,
    }
  } catch {
    return null
  }
}

export interface Review {
  id: string
  title?: string
  content?: string
  rating: number
  author?: string
  date?: string
  verified_purchase?: boolean
}

export interface ProductReviewsResponse {
  reviews: Review[]
  total_reviews: number
  next_cursor?: string
}

export async function getProductReviews(
  asin: string,
  country = 'DE',
  sort_by = 'TOP_REVIEWS',
  star_rating = 'ALL',
  verified_only = false,
  images_only = false,
): Promise<ProductReviewsResponse | null> {
  try {
    const data = await fetchRapidAPI<any>('/product-reviews', {
      asin,
      country,
      sort_by,
      star_rating,
      verified_purchases_only: String(verified_only).toLowerCase(),
      images_or_videos_only: String(images_only).toLowerCase(),
      current_format_only: 'false',
    })
    return {
      reviews: (data.reviews || []).map((r: any) => ({
        id: r.review_id || r.id,
        title: r.review_title,
        content: r.review_content || r.review_text,
        rating: parseInt(String(r.review_rating || 0), 10),
        author: r.review_author,
        date: r.review_date,
        verified_purchase: r.verified_purchase,
      })),
      total_reviews: data.total_reviews || 0,
      next_cursor: data.next_cursor,
    }
  } catch {
    return null
  }
}

export interface BestSeller {
  asin: string
  name: string
  price: number
  original_price: number | null
  image_url: string | null
  rating: number | null
  review_count: number
  affiliate_url: string
  rank?: number
}

export async function getBestSellers(
  category: string,
  type = 'BEST_SELLERS',
  country = 'DE',
  page = 1,
): Promise<BestSeller[]> {
  try {
    const data = await fetchRapidAPI<any>('/best-sellers', {
      category,
      type,
      country,
      page: String(page),
    })
    return (data.best_sellers || []).map((item: any) => ({
      asin: item.asin,
      name: item.product_title || '',
      price: parseFloat(String(item.product_price || 0)),
      original_price: item.list_price ? parseFloat(String(item.list_price)) : null,
      image_url: item.product_photo || null,
      rating: item.product_star_rating ? parseFloat(String(item.product_star_rating)) : null,
      review_count: parseInt(String(item.product_num_ratings || 0), 10),
      affiliate_url: item.product_url || '',
      rank: item.best_seller_rank ? parseInt(String(item.best_seller_rank), 10) : undefined,
    }))
  } catch {
    return []
  }
}

export interface Deal {
  deal_id: string
  deal_title: string
  deal_url: string
  deal_photo?: string
  deal_price?: number
  list_price?: number
  deal_category?: string
}

function extractPrice(val: any): number | undefined {
  if (val == null) return undefined
  if (typeof val === 'number') return val
  if (typeof val === 'object' && val.amount != null) return val.amount
  const n = parseFloat(String(val))
  return isNaN(n) ? undefined : n
}

export async function getDeals(
  country = 'DE',
  min_rating = 'ALL',
  price_range = 'ALL',
  discount_range = 'ALL',
): Promise<Deal[]> {
  try {
    const data = await fetchRapidAPI<any>('/deals-v2', {
      country,
      min_product_star_rating: min_rating,
      price_range,
      discount_range,
    })
    return (data.deals || []).map((d: any) => ({
      deal_id: d.deal_id || '',
      deal_title: d.deal_title || '',
      deal_url: d.deal_url || '',
      deal_photo: d.deal_photo || null,
      deal_price: extractPrice(d.deal_price),
      list_price: extractPrice(d.list_price),
      deal_category: d.deal_category || undefined,
    }))
  } catch {
    return []
  }
}

export interface Category {
  id: string
  name: string
}

export async function getProductCategories(country = 'DE'): Promise<Category[]> {
  try {
    const data = await fetchRapidAPI<any[]>('/product-category-list', { country })
    return (data || []).map((c: any, i: number) => ({
      id: c.id || String(c.category_id || i),
      name: c.name || c.category_name || '',
    }))
  } catch {
    return []
  }
}

export async function getAsinToGtin(asin: string, type = 'EAN-13'): Promise<string | null> {
  try {
    const data = await fetchRapidAPI<any>('/asin-to-gtin', { asin, type })
    return data?.gtin || data?.ean || data?.upc || null
  } catch {
    return null
  }
}

export async function getGtinToAsin(gtin: string): Promise<Product[]> {
  try {
    const data = await fetchRapidAPI<any>('/gtin-to-asin', { gtin })
    return (data.products || []).map(transformProduct)
  } catch {
    return []
  }
}

export const isRapidAPIConfigured = !!RAPIDAPI_KEY
