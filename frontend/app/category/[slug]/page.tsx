import { Metadata } from 'next'
import {
  supabase,
  isConfigured,
  isRapidAPIConfigured,
  CATEGORIES,
  searchProducts,
  type Product,
  type Category,
} from '@/lib/supabase'
import ProductCard from '@/components/ProductCard'
import CategoryFilter from '@/components/CategoryFilter'

interface PageProps {
  params: { slug: string }
}

const QUERY_MAP: Record<string, string> = {
  laptops: 'Laptop',
  smartphones: 'Smartphone',
  gaming: 'Gaming',
  zubehoer: 'Zubehör Elektronik',
  buecher: 'Bücher Bestseller',
  computer: 'Computer PC',
  elektronik: 'Elektronik',
  'kamera-foto': 'Kamera',
  'smart-home': 'Smart Home',
  'tv-heimkino': 'Fernseher',
  musik: 'Musik Lautsprecher',
  kueche: 'Küche',
  haushalt: 'Haushalt',
  garten: 'Garten',
  baumarkt: 'Baumarkt',
  sport: 'Sport',
  spielzeug: 'Spielzeug',
  beauty: 'Beauty',
  baby: 'Baby',
  haustier: 'Haustier',
  kleidung: 'Kleidung',
  schuhe: 'Schuhe',
  lebensmittel: 'Lebensmittel',
  auto: 'Auto',
}

function getCategory(slug: string): Category | null {
  return CATEGORIES.find(c => c.slug === slug) || null
}

async function getProductsByCategory(categorySlug: string): Promise<Product[]> {
  if (isConfigured) {
    const { data } = await supabase
      .from('products')
      .select('*')
      .eq('category', categorySlug)
      .order('price', { ascending: true })
    if (data && data.length > 0) return data as Product[]
  }
  if (isRapidAPIConfigured) {
    const query = QUERY_MAP[categorySlug] || categorySlug
    const result = await searchProducts({ query, country: 'DE', page: 1, sort_by: 'RELEVANCE' })
    if (result.products.length > 0) return result.products
  }
  return []
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params
  const category = getCategory(slug)
  return {
    title: category?.name || slug,
    description: `Entdecke die besten ${category?.name || slug} Deals bei Daily Trends.`,
  }
}

export const revalidate = 3600

export default async function CategoryPage({ params }: PageProps) {
  const { slug } = await params
  const category = getCategory(slug)
  const products = await getProductsByCategory(slug)

  const categoryNames: Record<string, string> = {
    laptops: 'Laptops',
    smartphones: 'Smartphones',
    gaming: 'Gaming',
    computer: 'Computer',
    elektronik: 'Elektronik',
    'kamera-foto': 'Kamera & Foto',
    'smart-home': 'Smart Home',
    'tv-heimkino': 'TV & Heimkino',
    musik: 'Musik',
    kueche: 'Küche',
    haushalt: 'Haushalt',
    garten: 'Garten',
    baumarkt: 'Baumarkt',
    sport: 'Sport',
    spielzeug: 'Spielzeug',
    beauty: 'Beauty',
    baby: 'Baby',
    haustier: 'Haustier',
    buecher: 'Bücher',
    kleidung: 'Kleidung',
    schuhe: 'Schuhe',
    lebensmittel: 'Lebensmittel',
    auto: 'Auto',
    zubehoer: 'Zubehör',
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <CategoryFilter activeCategory={slug} />
      </div>

      <div className="mb-8">
        <h1 className="text-3xl font-bold text-primary">
          {categoryNames[slug] || slug}
        </h1>
        {category?.description && (
          <p className="text-gray-600 mt-2">{category.description}</p>
        )}
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
            Keine Produkte in dieser Kategorie gefunden.
          </p>
        </div>
      )}
    </div>
  )
}
