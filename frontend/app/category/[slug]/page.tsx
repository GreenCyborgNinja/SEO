import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import {
  getAllCategories,
  getCategoriesWithCounts,
  getCategory,
  getProductsByCategory,
} from '@/lib/db/products'
import CategoryFilter from '@/components/CategoryFilter'
import SortableProductGrid from '@/components/SortableProductGrid'

interface PageProps {
  // Next 16 hands params in as a Promise — the previous non-Promise type was a lie
  // that only happened to work because the value was awaited anyway.
  params: Promise<{ slug: string }>
}

export const revalidate = 600

/**
 * Categories are a closed set (shared/taxonomy.json), so anything outside
 * generateStaticParams is rejected by the router with a real 404.
 *
 * This has to be false: with dynamicParams on, Next renders the unknown slug,
 * `notFound()` produces the not-found UI, but the response is a prerender and
 * comes back as HTTP 200 — a soft 404 that Google would happily index.
 */
export const dynamicParams = false

export async function generateStaticParams() {
  const categories = await getAllCategories()
  return categories.map((category) => ({ slug: category.slug }))
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params
  const category = await getCategory(slug)
  if (!category) return { title: 'Kategorie nicht gefunden' }

  return {
    title: category.name,
    description:
      category.description ?? `Entdecke die besten ${category.name}-Deals bei Daily Trends.`,
    alternates: { canonical: `/category/${category.slug}` },
  }
}

export default async function CategoryPage({ params }: PageProps) {
  const { slug } = await params
  const category = await getCategory(slug)
  // Unknown slugs used to render an empty page (soft 404) — now they 404 properly.
  if (!category) notFound()

  const [products, categories] = await Promise.all([
    getProductsByCategory(slug),
    getCategoriesWithCounts(),
  ])

  return (
    <div>
      <div className="mb-8">
        <CategoryFilter categories={categories} activeCategory={slug} />
      </div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-primary">{category.name}</h1>
        {category.description && <p className="text-gray-600 mt-2">{category.description}</p>}
      </div>
      <SortableProductGrid
        products={products}
        emptyMessage={`In der Kategorie ${category.name} sind aktuell keine Produkte verfügbar.`}
      />
    </div>
  )
}
