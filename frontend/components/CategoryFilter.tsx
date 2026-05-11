'use client'

import Link from 'next/link'
import { cn } from '@/lib/utils'

const categories = [
  { name: 'Alle', slug: '', color: 'bg-gray-200' },
  { name: 'Laptops', slug: 'laptops', color: 'bg-blue-100' },
  { name: 'Smartphones', slug: 'smartphones', color: 'bg-green-100' },
  { name: 'Gaming', slug: 'gaming', color: 'bg-purple-100' },
  { name: 'Computer', slug: 'computer', color: 'bg-indigo-100' },
  { name: 'Elektronik', slug: 'elektronik', color: 'bg-cyan-100' },
  { name: 'Kamera & Foto', slug: 'kamera-foto', color: 'bg-teal-100' },
  { name: 'Smart Home', slug: 'smart-home', color: 'bg-emerald-100' },
  { name: 'TV & Heimkino', slug: 'tv-heimkino', color: 'bg-rose-100' },
  { name: 'Musik', slug: 'musik', color: 'bg-pink-100' },
  { name: 'Küche', slug: 'kueche', color: 'bg-amber-100' },
  { name: 'Haushalt', slug: 'haushalt', color: 'bg-lime-100' },
  { name: 'Garten', slug: 'garten', color: 'bg-green-200' },
  { name: 'Baumarkt', slug: 'baumarkt', color: 'bg-orange-200' },
  { name: 'Sport', slug: 'sport', color: 'bg-red-100' },
  { name: 'Spielzeug', slug: 'spielzeug', color: 'bg-yellow-100' },
  { name: 'Beauty', slug: 'beauty', color: 'bg-fuchsia-100' },
  { name: 'Baby', slug: 'baby', color: 'bg-sky-100' },
  { name: 'Haustier', slug: 'haustier', color: 'bg-amber-200' },
  { name: 'Bücher', slug: 'buecher', color: 'bg-stone-100' },
  { name: 'Kleidung', slug: 'kleidung', color: 'bg-violet-100' },
  { name: 'Schuhe', slug: 'schuhe', color: 'bg-purple-200' },
  { name: 'Lebensmittel', slug: 'lebensmittel', color: 'bg-lime-200' },
  { name: 'Auto', slug: 'auto', color: 'bg-gray-300' },
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