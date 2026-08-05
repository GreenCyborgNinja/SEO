import type { Metadata } from 'next'
import Link from 'next/link'
import { searchProducts } from '@/lib/db/products'
import SortableProductGrid from '@/components/SortableProductGrid'

interface PageProps {
  searchParams: Promise<{ q?: string }>
}

export const dynamic = 'force-dynamic'

export async function generateMetadata({ searchParams }: PageProps): Promise<Metadata> {
  const { q } = await searchParams
  return {
    title: q ? `Suche: ${q}` : 'Produktsuche',
    description: 'Durchsuche alle Produkte bei Daily Trends nach Name, Marke oder Kategorie.',
    // Search result pages carry no unique content worth indexing.
    robots: { index: false, follow: true },
  }
}

export default async function SearchPage({ searchParams }: PageProps) {
  const { q } = await searchParams
  const term = (q ?? '').trim()
  const products = term.length >= 2 ? await searchProducts(term, 60) : []

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-primary">
          {term ? <>Suchergebnisse für „{term}“</> : 'Produktsuche'}
        </h1>
        {term.length > 0 && term.length < 2 && (
          <p className="text-gray-600 mt-2">Bitte gib mindestens 2 Zeichen ein.</p>
        )}
      </div>

      {term.length >= 2 ? (
        <SortableProductGrid
          products={products}
          placement="search"
          emptyMessage={`Für „${term}“ haben wir nichts gefunden. Versuche einen anderen Suchbegriff.`}
        />
      ) : (
        <p className="text-gray-600">
          Nutze das Suchfeld oben oder stöbere in den{' '}
          <Link href="/deals" className="text-accent font-medium hover:underline">
            aktuellen Deals
          </Link>
          .
        </p>
      )}
    </div>
  )
}
