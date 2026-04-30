'use client'

import Link from 'next/link'
import { cn } from '@/lib/utils'

const categories = [
  { name: 'Alle', slug: '', color: 'bg-gray-200' },
  { name: 'Laptops', slug: 'laptops', color: 'bg-blue-100' },
  { name: 'Smartphones', slug: 'smartphones', color: 'bg-green-100' },
  { name: 'Gaming', slug: 'gaming', color: 'bg-purple-100' },
  { name: 'Zubehör', slug: 'zubehoer', color: 'bg-orange-100' },
]

interface CategoryFilterProps {
  activeCategory?: string
}

export default function CategoryFilter({ activeCategory = '' }: CategoryFilterProps) {
  return (
    <div className="flex flex-wrap gap-2 mb-8">
      {categories.map((cat) => {
        const isActive = activeCategory === cat.slug || (!activeCategory && !cat.slug)
        return (
          <Link
            key={cat.slug || 'all'}
            href={cat.slug ? `/category/${cat.slug}` : '/'}
            className={cn(
              'px-4 py-2 rounded-full text-sm font-medium transition-all',
              isActive
                ? 'bg-accent text-white'
                : 'bg-white text-gray-600 hover:bg-gray-100'
            )}
          >
            {cat.name}
          </Link>
        )
      })}
    </div>
  )
}