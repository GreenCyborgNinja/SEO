import { fetchAllAvailableProducts, type Product } from '@/lib/supabase'
import CategoryFilter from '@/components/CategoryFilter'
import SortableProductGrid from '@/components/SortableProductGrid'

export const dynamic = 'force-static'

async function getProducts(): Promise<Product[]> {
  return fetchAllAvailableProducts()
}

export default async function HomePage() {
  const products = await getProducts()

  return (
    <div>
      <section className="mb-12 text-center max-w-4xl mx-auto">
        <h1 className="text-4xl md:text-5xl font-bold text-primary mb-6">
          Daily Trends
        </h1>
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

      <hr className="border-gray-200 mb-10" />

      <section>
        <h2 className="text-2xl font-bold text-primary mb-6">Alle Produkte</h2>
        <CategoryFilter />
      </section>

      <SortableProductGrid products={products} />
    </div>
  )
}
