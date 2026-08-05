import type { Metadata } from 'next'
import { getAllProducts, getCategoriesWithCounts } from '@/lib/db/products'
import CategoryFilter from '@/components/CategoryFilter'
import SortableProductGrid from '@/components/SortableProductGrid'
import PersonalRail from '@/components/PersonalRail'

// ISR instead of force-static: the catalogue now lives in SQLite and gets
// refreshed by the scraper, so the page must be able to pick up new data.
export const revalidate = 600

export const metadata: Metadata = {
  title: 'Daily Trends – Dein Tech-Shop für aktuelle Deals',
  description:
    'Täglich geprüfte Tech-Deals: Laptops, Smartphones, Gaming und Zubehör im Preisvergleich – mit Bewertungen, Ersparnis und direkter Kaufoption.',
  alternates: { canonical: '/' },
}

export default async function HomePage() {
  const [products, categories] = await Promise.all([getAllProducts(), getCategoriesWithCounts()])

  return (
    <div>
      <section className="mb-12 text-center max-w-4xl mx-auto">
        <h1 className="text-4xl md:text-5xl font-bold text-primary mb-6">Daily Trends</h1>
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

      <PersonalRail />

      <hr className="border-gray-200 mb-10" />

      <section>
        <h2 className="text-2xl font-bold text-primary mb-6">Alle Produkte</h2>
        <CategoryFilter categories={categories} />
      </section>

      <SortableProductGrid products={products} />
    </div>
  )
}
