import Link from 'next/link'
import { cn } from '@/lib/utils'
import type { CategoryWithCount } from '@/lib/db/products'

interface CategoryFilterProps {
  categories: CategoryWithCount[]
  activeCategory?: string
}

/**
 * Category pills, driven by the database instead of a hardcoded list. The old
 * version shipped 25 slugs of which only four ever had products, so most pills
 * led to an empty page.
 */
export default function CategoryFilter({ categories, activeCategory = '' }: CategoryFilterProps) {
  const populated = categories.filter((category) => category.product_count > 0)

  return (
    <div className="flex flex-wrap gap-2 mb-8">
      <Link
        href="/"
        className={cn(
          'px-4 py-2 rounded-full text-sm font-medium transition-all',
          !activeCategory ? 'bg-accent text-white' : 'bg-white text-gray-600 hover:bg-gray-100'
        )}
      >
        Alle
      </Link>
      {populated.map((category) => (
        <Link
          key={category.slug}
          href={`/category/${category.slug}`}
          className={cn(
            'px-4 py-2 rounded-full text-sm font-medium transition-all',
            activeCategory === category.slug
              ? 'bg-accent text-white'
              : 'bg-white text-gray-600 hover:bg-gray-100'
          )}
        >
          {category.name}
          <span className="ml-1.5 text-xs opacity-60">{category.product_count}</span>
        </Link>
      ))}
    </div>
  )
}
