import { createClient, SupabaseClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''

export const supabase: SupabaseClient = supabaseUrl && supabaseAnonKey
  ? createClient(supabaseUrl, supabaseAnonKey)
  : (null as unknown as SupabaseClient)

export const isConfigured = !!(supabaseUrl && supabaseAnonKey)

export const MOCK_PRODUCTS: Product[] = [
  {
    id: '12',
    external_id: 'BOOK-001',
    name: 'BGB - Bürgerliches Gesetzbuch (dtv-Textausgabe)',
    description: 'Die maßgebliche Textausgabe des Bürgerlichen Gesetzbuchs. Dieser handliche Taschenbuchband enthält neben dem BGB auch wichtige Nebengesetze wie das EGBGB, AGG, ProdHaftG und WEG. Das Standardwerk für Jurastudierende, Rechtsanwälte und alle, die eine verlässliche, portable Ausgabe des deutschen Zivilrechts benötigen.',
    seo_description: 'BGB - Bürgerliches Gesetzbuch (dtv-Textausgabe) - Die aktuelle Textausgabe des deutschen Zivilrechts. Ideal für Studium und Beruf.',
    price: 8.90,
    original_price: null,
    affiliate_url: 'https://www.amazon.de/dp/3423533331',
    image_url: 'https://m.media-amazon.com/images/I/81+20u6GvSL._SL1500_.jpg',
    category: 'buecher',
    brand: 'dtv',
    rating: 4.6,
    review_count: 845,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
  {
    id: '1',
    external_id: 'LAPTOP-001',
    name: 'Apple MacBook Pro 14" M3 Pro',
    description: 'Das MacBook Pro mit M3 Pro Chip bietet enorme Leistung.',
    seo_description: 'Entdecke das neue Apple MacBook Pro mit M3 Pro Chip. Perfekt für Profis.',
    price: 1999.00,
    original_price: 2249.00,
    affiliate_url: 'https://amazon.de',
    image_url: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=800',
    category: 'laptops',
    brand: 'Apple',
    rating: 4.8,
    review_count: 234,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: '2',
    external_id: 'LAPTOP-003',
    name: 'Dell XPS 15',
    description: 'Premium Windows Laptop mit OLED Display.',
    seo_description: 'Dell XPS 15 - Eleganz trifft Leistung.',
    price: 1799.00,
    original_price: 1999.00,
    affiliate_url: 'https://amazon.de',
    image_url: 'https://images.unsplash.com/photo-1593642632559-0c6d3fc62b89?w=800',
    category: 'laptops',
    brand: 'Dell',
    rating: 4.7,
    review_count: 189,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: '3',
    external_id: 'LAPTOP-004',
    name: 'Lenovo ThinkPad X1 Carbon',
    description: 'Business Laptop mit top Tastatur.',
    seo_description: 'Lenovo ThinkPad X1 Carbon - Der Business-Klassiker.',
    price: 1499.00,
    original_price: 1799.00,
    affiliate_url: 'https://amazon.de',
    image_url: 'https://images.unsplash.com/photo-1588872657578-7efd1f1555ed?w=800',
    category: 'laptops',
    brand: 'Lenovo',
    rating: 4.6,
    review_count: 312,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: '4',
    external_id: 'PHONE-001',
    name: 'Samsung Galaxy S24 Ultra',
    description: 'Premium-Smartphone mit AI-Features.',
    seo_description: 'Das Samsung Galaxy S24 Ultra mit revolutionären AI-Funktionen.',
    price: 1399.00,
    original_price: 1499.00,
    affiliate_url: 'https://amazon.de',
    image_url: 'https://images.unsplash.com/photo-1610945265064-0e34e5519bbf?w=800',
    category: 'smartphones',
    brand: 'Samsung',
    rating: 4.9,
    review_count: 412,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: '5',
    external_id: 'PHONE-002',
    name: 'Apple iPhone 15 Pro Max',
    description: 'Das ultimative iPhone.',
    seo_description: 'iPhone 15 Pro Max mit Titan-Design und A17 Pro Chip.',
    price: 1199.00,
    original_price: 1399.00,
    affiliate_url: 'https://amazon.de',
    image_url: 'https://images.unsplash.com/photo-1695043133149-9cb9074a2d4a?w=800',
    category: 'smartphones',
    brand: 'Apple',
    rating: 4.8,
    review_count: 567,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: '6',
    external_id: 'PHONE-003',
    name: 'Google Pixel 8 Pro',
    description: 'Das beste Google Phone.',
    seo_description: 'Google Pixel 8 Pro - AI-First Smartphone.',
    price: 999.00,
    original_price: 1199.00,
    affiliate_url: 'https://amazon.de',
    image_url: 'https://images.unsplash.com/photo-1592750475338-74b7b21085ab?w=800',
    category: 'smartphones',
    brand: 'Google',
    rating: 4.7,
    review_count: 234,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: '7',
    external_id: 'GAMING-001',
    name: 'Sony PlayStation 5 Slim',
    description: 'Die neue slim Version der PS5.',
    seo_description: 'Sony PlayStation 5 Slim - Next-Gen Gaming jetzt kompakter.',
    price: 449.00,
    original_price: 499.00,
    affiliate_url: 'https://amazon.de',
    image_url: 'https://images.unsplash.com/photo-1606144042614-b2417e99c4e3?w=800',
    category: 'gaming',
    brand: 'Sony',
    rating: 4.9,
    review_count: 1023,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: '8',
    external_id: 'GAMING-002',
    name: 'ASUS ROG Strix G16 Gaming Laptop',
    description: 'High-Performance Gaming Laptop.',
    seo_description: 'ASUS ROG Strix G16 - Gaming-Power mit RTX 4070.',
    price: 1499.00,
    original_price: 1799.00,
    affiliate_url: 'https://amazon.de',
    image_url: 'https://images.unsplash.com/photo-1603302576837-37561b2e2302?w=800',
    category: 'gaming',
    brand: 'ASUS',
    rating: 4.6,
    review_count: 156,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: '9',
    external_id: 'GAMING-003',
    name: 'Xbox Series X',
    description: 'Die stärkste Xbox aller Zeiten.',
    seo_description: 'Xbox Series X - Next-Gen Gaming vom Feinsten.',
    price: 499.00,
    original_price: 549.00,
    affiliate_url: 'https://amazon.de',
    image_url: 'https://images.unsplash.com/photo-1621259182978-fbf93132d53d?w=800',
    category: 'gaming',
    brand: 'Microsoft',
    rating: 4.8,
    review_count: 892,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: '10',
    external_id: 'ACC-001',
    name: 'Logitech MX Master 3S',
    description: 'Premium kabellose Maus.',
    seo_description: 'Logitech MX Master 3S - Die perfekte Maus für Produktivität.',
    price: 89.99,
    original_price: 99.99,
    affiliate_url: 'https://amazon.de',
    image_url: 'https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?w=800',
    category: 'zubehoer',
    brand: 'Logitech',
    rating: 4.8,
    review_count: 1245,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: '11',
    external_id: 'ACC-002',
    name: 'Apple AirPods Pro',
    description: 'Premium Noise-Cancelling Kopfhörer.',
    seo_description: 'Apple AirPods Pro - Sound der Spitzenklasse.',
    price: 249.00,
    original_price: 279.00,
    affiliate_url: 'https://amazon.de',
    image_url: 'https://images.unsplash.com/photo-1600294037681-c80b4cb5b434?w=800',
    category: 'zubehoer',
    brand: 'Apple',
    rating: 4.7,
    review_count: 2156,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  }
]

export const MOCK_CATEGORIES: Category[] = [
  { id: '1', name: 'Laptops', slug: 'laptops', description: 'Die besten Laptops' },
  { id: '2', name: 'Smartphones', slug: 'smartphones', description: 'Aktuelle Smartphones' },
  { id: '3', name: 'Gaming', slug: 'gaming', description: 'Gaming-Equipment' },
  { id: '4', name: 'Zubehör', slug: 'zubehoer', description: 'Technisches Zubehör' },
  { id: '5', name: 'Bücher', slug: 'buecher', description: 'Die besten Bücher' }
]

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