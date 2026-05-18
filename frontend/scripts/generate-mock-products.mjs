import { readFileSync, writeFileSync, readdirSync, existsSync } from 'fs'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const PROJECT_ROOT = join(__dirname, '..')

const HARDCODED_FALLBACK = [
  { id: '1', external_id: 'LAPTOP-001', name: 'Apple MacBook Pro 14" M3 Pro', description: 'Das MacBook Pro mit M3 Pro Chip bietet enorme Leistung f\u00fcr Profis.', seo_description: 'Entdecke das neue Apple MacBook Pro mit M3 Pro Chip. Perfekt f\u00fcr Profis.', price: 1999.00, original_price: 2249.00, affiliate_url: 'https://www.amazon.de/dp/B0CMZFCQ6D', image_url: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=800', category: 'laptops', brand: 'Apple', rating: 4.8, review_count: 234, created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
  { id: '2', external_id: 'LAPTOP-002', name: 'ASUS ROG Strix G16 Gaming Laptop', description: 'Gaming-Laptop mit Intel Core i7-13650HX, NVIDIA RTX 4070.', seo_description: 'ASUS ROG Strix G16 - Gaming-Power mit RTX 4070.', price: 1499.00, original_price: 1799.00, affiliate_url: 'https://www.amazon.de/dp/B0CMZFCQ6D', image_url: 'https://images.unsplash.com/photo-1603302576837-37561b2e2302?w=800', category: 'gaming', brand: 'ASUS', rating: 4.6, review_count: 156, created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
  { id: '3', external_id: 'LAPTOP-003', name: 'Lenovo ThinkPad X1 Carbon Gen 11', description: 'Ultraleichtes Business-Notebook mit Intel Core i7.', seo_description: 'Lenovo ThinkPad X1 Carbon - Der Business-Klassiker.', price: 1699.00, original_price: 1999.00, affiliate_url: 'https://www.amazon.de/dp/B0CMZFCQ6D', image_url: 'https://images.unsplash.com/photo-1588872657578-7efd1f1555ed?w=800', category: 'laptops', brand: 'Lenovo', rating: 4.7, review_count: 89, created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
  { id: '4', external_id: 'PHONE-001', name: 'Samsung Galaxy S24 Ultra', description: 'Premium-Smartphone mit 256GB, Titanium Gray, Galaxy AI.', seo_description: 'Das Samsung Galaxy S24 Ultra mit revolution\u00e4ren AI-Funktionen.', price: 1399.00, original_price: 1499.00, affiliate_url: 'https://www.amazon.de/dp/B0CMZFCQ6D', image_url: 'https://images.unsplash.com/photo-1610945265064-0e34e5519bbf?w=800', category: 'smartphones', brand: 'Samsung', rating: 4.9, review_count: 412, created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
  { id: '5', external_id: 'PHONE-002', name: 'Apple iPhone 15 Pro Max 256GB', description: 'A17 Pro Chip, Titanium-Design, 5x Optical Zoom.', seo_description: 'iPhone 15 Pro Max mit Titan-Design und A17 Pro Chip.', price: 1199.00, original_price: 1399.00, affiliate_url: 'https://www.amazon.de/dp/B0CMZFCQ6D', image_url: 'https://images.unsplash.com/photo-1695043133149-9cb9074a2d4a?w=800', category: 'smartphones', brand: 'Apple', rating: 4.8, review_count: 567, created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
  { id: '6', external_id: 'PHONE-003', name: 'Google Pixel 8 Pro', description: 'AI-Smartphone mit Tensor G3 Chip, 7 Jahre Updates.', seo_description: 'Google Pixel 8 Pro - AI-First Smartphone.', price: 899.00, original_price: 999.00, affiliate_url: 'https://www.amazon.de/dp/B0CMZFCQ6D', image_url: 'https://images.unsplash.com/photo-1598327105666-5b89351aff70?w=800', category: 'smartphones', brand: 'Google', rating: 4.7, review_count: 234, created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
  { id: '7', external_id: 'GAMING-001', name: 'Sony PlayStation 5 Slim', description: 'Die neue slim Version der PS5 mit 1TB SSD.', seo_description: 'Sony PlayStation 5 Slim - Next-Gen Gaming jetzt kompakter.', price: 449.00, original_price: 499.00, affiliate_url: 'https://www.amazon.de/dp/B0CMZFCQ6D', image_url: 'https://images.unsplash.com/photo-1606144042614-b2417e99c4e3?w=800', category: 'gaming', brand: 'Sony', rating: 4.9, review_count: 1023, created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
  { id: '8', external_id: 'GAMING-002', name: 'Xbox Series X', description: '1TB SSD, 4K/120fps Gaming.', seo_description: 'Xbox Series X - Next-Gen Gaming vom Feinsten.', price: 449.00, original_price: 499.00, affiliate_url: 'https://www.amazon.de/dp/B0CMZFCQ6D', image_url: 'https://images.unsplash.com/photo-1621259182978-fbf93132d53d?w=800', category: 'gaming', brand: 'Microsoft', rating: 4.8, review_count: 892, created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
  { id: '9', external_id: 'ACC-001', name: 'Logitech MX Master 3S', description: 'Premium kabellose Maus, 8K DPI, leise Klicks.', seo_description: 'Logitech MX Master 3S - Die perfekte Maus f\u00fcr Produktivit\u00e4t.', price: 89.99, original_price: 99.99, affiliate_url: 'https://www.amazon.de/dp/B0CMZFCQ6D', image_url: 'https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?w=800', category: 'zubehoer', brand: 'Logitech', rating: 4.8, review_count: 1245, created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
  { id: '10', external_id: 'ACC-002', name: 'Apple AirPods Pro (2. Gen)', description: 'Active Noise Cancelling, MagSafe Ladecase.', seo_description: 'Apple AirPods Pro - Sound der Spitzenklasse.', price: 229.00, original_price: 279.00, affiliate_url: 'https://www.amazon.de/dp/B0CMZFCQ6D', image_url: 'https://images.unsplash.com/photo-1600294037681-c80b4cb5b434?w=800', category: 'zubehoer', brand: 'Apple', rating: 4.7, review_count: 2134, created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
  { id: '11', external_id: 'LAPTOP-004', name: 'Dell XPS 15', description: '15.6" OLED, Intel Core i7-13700H, 32GB RAM.', seo_description: 'Dell XPS 15 - Eleganz trifft Leistung.', price: 1899.00, original_price: 2199.00, affiliate_url: 'https://www.amazon.de/dp/B0CMZFCQ6D', image_url: 'https://images.unsplash.com/photo-1593642632559-0c6d3fc62b89?w=800', category: 'laptops', brand: 'Dell', rating: 4.6, review_count: 178, created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
  { id: '12', external_id: 'GAMING-003', name: 'Nintendo Switch OLED', description: 'OLED Display, 64GB Speicher, Ethernet-Port.', seo_description: 'Nintendo Switch OLED - Das beste Hybrid-Gaming.', price: 349.00, original_price: 379.00, affiliate_url: 'https://www.amazon.de/dp/B0CMZFCQ6D', image_url: 'https://images.unsplash.com/photo-1578303512597-81e6cc155b3e?w=800', category: 'gaming', brand: 'Nintendo', rating: 4.8, review_count: 756, created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
]

const SCRAPER_DIR = join(PROJECT_ROOT, '..', 'backend', 'scraper')
const OUTPUT_PATH = join(PROJECT_ROOT, 'lib', 'mock-products.json')

function findLatestScraperOutput() {
  if (!existsSync(SCRAPER_DIR)) return null
  const latest = join(SCRAPER_DIR, 'latest-products.json')
  if (existsSync(latest)) return latest
  const files = readdirSync(SCRAPER_DIR)
    .filter(f => f.startsWith('products_') && f.endsWith('.json'))
    .sort()
    .reverse()
  return files.length > 0 ? join(SCRAPER_DIR, files[0]) : null
}

function normalizeRating(rating) {
  if (rating == null) return null
  const n = typeof rating === 'string' ? parseFloat(rating) : rating
  if (isNaN(n)) return null
  return n > 10 ? n / 10 : n
}

function transformScraperProduct(p, index) {
  const now = new Date().toISOString()
  return {
    id: p.external_id || String(index + 1),
    external_id: p.external_id || '',
    name: p.name || '',
    description: p.description || null,
    seo_description: p.seo_description || null,
    price: typeof p.price === 'number' ? p.price : parseFloat(p.price) || 0,
    original_price: p.original_price != null ? (typeof p.original_price === 'number' ? p.original_price : parseFloat(p.original_price) || 0) : null,
    affiliate_url: p.affiliate_url || '',
    image_url: p.image_url || null,
    category: p.category || null,
    brand: p.brand || null,
    rating: normalizeRating(p.rating),
    review_count: typeof p.review_count === 'number' ? p.review_count : parseInt(p.review_count, 10) || 0,
    created_at: now,
    updated_at: now,
  }
}

function main() {
  const scraperPath = findLatestScraperOutput()

  if (scraperPath) {
    console.log(`[generate-mock-products] Found scraper output: ${scraperPath}`)
    const raw = JSON.parse(readFileSync(scraperPath, 'utf-8'))
    const products = Array.isArray(raw) ? raw.map(transformScraperProduct) : []
    console.log(`[generate-mock-products] Transformed ${products.length} products`)
    writeFileSync(OUTPUT_PATH, JSON.stringify(products, null, 2), 'utf-8')
    console.log(`[generate-mock-products] Written to ${OUTPUT_PATH}`)
  } else {
    console.log('[generate-mock-products] No scraper output found, using hardcoded fallback')
    writeFileSync(OUTPUT_PATH, JSON.stringify(HARDCODED_FALLBACK, null, 2), 'utf-8')
    console.log(`[generate-mock-products] Written ${HARDCODED_FALLBACK.length} fallback products to ${OUTPUT_PATH}`)
  }
}

main()
