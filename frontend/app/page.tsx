import { Suspense } from 'react'
import { supabase, isConfigured, MOCK_PRODUCTS, MOCK_CATEGORIES, type Product } from '@/lib/supabase'
import ProductCard from '@/components/ProductCard'
import CategoryFilter from '@/components/CategoryFilter'

async function getProducts(): Promise<Product[]> {
  if (!isConfigured) {
    return MOCK_PRODUCTS
  }
  const { data } = await supabase
    .from('products')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(20)

  return data || []
}

async function getCategories() {
  if (!isConfigured) {
    return MOCK_CATEGORIES
  }
  const { data } = await supabase
    .from('categories')
    .select('*')
    .order('name')

  return data || []
}

export const revalidate = 3600

export default async function HomePage() {
  const [products, categories] = await Promise.all([getProducts(), getCategories()])

  return (
    <div className="container mx-auto px-4 py-8">
      <section className="mb-12 text-center">
        <h1 className="text-4xl md:text-5xl font-bold text-primary mb-4">
          Daily Trends
        </h1>
        <p className="text-lg text-gray-600 max-w-2xl mx-auto">
          Die aktuellsten Tech-Deals und Produkte – vergleiche Preise und kaufe günstig über unsere Affiliate-Links.
        </p>
      </section>

      <section className="mb-12 max-w-4xl mx-auto text-center">
        <h2 className="text-2xl font-semibold text-primary mb-4">So findest du die besten Deals bei Daily Trends</h2>
        <div className="text-gray-600 space-y-4 text-left">
          <p>
            Unser Team aus erfahrenen Tech-Experten durchkämmt täglich die Angebote von Amazon und anderen namhaften Händlern, um dir die attraktivsten Deals zu präsentieren. Dabei achten wir nicht nur auf den Preis, sondern bewerten auch Produktbewertungen, technische Spezifikationen und das Preis-Leistungs-Verhältnis, um sicherzustellen, dass du nur die wirklich lohnenswerten Angebote findest.
          </p>
          <p>
            Unsere intelligenten Algorithmen analysieren kontinuierlich Preistrends und Marktveränderungen, um Preisstürze und temporäre Angebote in Echtzeit zu erkennen. So verpasst du keine Gelegenheit mehr, wenn ein Produkt seinen Tiefstpreis erreicht. Jedes Produkt in unserem Sortiment wird sorgfältig geprüft, bevor es aufgenommen wird – wir wollen nur Qualität empfehlen.
          </p>
          <p>
            Ob Laptops, Smartphones, Gaming-Hardware oder Zubehör: Wir vergleichen die wichtigsten Modelle miteinander und liefern dir eine fundierte Kaufberatung, die dir hilft, die richtige Entscheidung zu treffen. Unser Ziel ist es, dir Zeit zu sparen und das bestmögliche Einkaufserlebnis zu bieten.
          </p>
        </div>
      </section>

      <CategoryFilter />

      {products.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {products.map((product, index) => (
            <ProductCard key={product.id} product={product} index={index} />
          ))}
        </div>
      ) : (
        <div className="text-center py-16">
          <p className="text-gray-500 text-lg">
            Noch keine Produkte verfügbar. Die Daten werden bald synchronisiert.
          </p>
        </div>
      )}
    </div>
  )
}