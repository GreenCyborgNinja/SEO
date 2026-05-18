import {
  supabase,
  isConfigured,
  isRapidAPIConfigured,
  searchProducts,
  fetchDeals,
  type Product,
} from '@/lib/supabase'
import ProductCard from '@/components/ProductCard'
import CategoryFilter from '@/components/CategoryFilter'

async function getProducts(): Promise<Product[]> {
  if (isConfigured) {
    const { data } = await supabase
      .from('products')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(20)
    if (data && data.length > 0) return data as Product[]
  }
  if (isRapidAPIConfigured) {
    const result = await searchProducts({ query: 'tech', country: 'DE', page: 1 })
    if (result.products.length > 0) return result.products.slice(0, 20)
    const deals = await fetchDeals()
    if (deals.length > 0) return deals
  }
  return []
}

export const revalidate = 3600

export default async function HomePage() {
  const products = await getProducts()

  return (
    <div className="container mx-auto px-4 py-8">
      <section className="mb-12 text-center">
        <h1 className="text-4xl md:text-5xl font-bold text-primary mb-4">
          Daily Trends
        </h1>
        <p className="text-lg text-gray-600 max-w-2xl mx-auto">
          Die aktuellsten Tech-Deals und Produkte von Amazon – in Echtzeit von der RapidAPI.
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
            Keine Produkte verfügbar. Bitte konfiguriere RAPIDAPI_KEY in den Umgebungsvariablen.
          </p>
        </div>
      )}
    </div>
  )
}
