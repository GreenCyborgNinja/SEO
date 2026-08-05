'use client'

import { useState, useMemo } from 'react'
import ProductCard from './ProductCard'
import { calculateSavings } from '@/lib/utils'
import type { Placement } from '@/lib/affiliate'
import type { Product } from '@/lib/db/schema'

type SortOption = 'default' | 'price-asc' | 'price-desc' | 'savings' | 'rating'

const SORT_OPTIONS: { value: SortOption; label: string }[] = [
  { value: 'default', label: 'Sortierung' },
  { value: 'price-asc', label: 'Niedrigster Preis' },
  { value: 'price-desc', label: 'Höchster Preis' },
  { value: 'savings', label: 'Beste Ersparnis' },
  { value: 'rating', label: 'Beste Bewertung' },
]

function savingsPercent(product: Product): number {
  if (!product.original_price || product.original_price <= product.price) return 0
  return calculateSavings(product.original_price, product.price)
}

function sortProducts(products: Product[], sort: SortOption): Product[] {
  const sorted = [...products]
  switch (sort) {
    case 'price-asc':
      sorted.sort((a, b) => a.price - b.price)
      break
    case 'price-desc':
      sorted.sort((a, b) => b.price - a.price)
      break
    case 'savings':
      sorted.sort((a, b) => savingsPercent(b) - savingsPercent(a))
      break
    case 'rating':
      sorted.sort((a, b) => (b.rating ?? 0) - (a.rating ?? 0))
      break
  }
  return sorted
}

interface SortableProductGridProps {
  products: Product[]
  placement?: Placement
  emptyMessage?: string
}

export default function SortableProductGrid({
  products,
  placement = 'card',
  emptyMessage = 'Keine Produkte verfügbar.',
}: SortableProductGridProps) {
  const [sort, setSort] = useState<SortOption>('default')

  const sorted = useMemo(() => sortProducts(products, sort), [products, sort])

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <span className="text-sm text-gray-500">
          {products.length} {products.length === 1 ? 'Produkt' : 'Produkte'}
        </span>
        <select
          value={sort}
          onChange={(e) => setSort(e.target.value as SortOption)}
          aria-label="Produkte sortieren"
          className="text-sm bg-white border border-gray-300 rounded-lg px-3 py-2 text-gray-700 focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent cursor-pointer"
        >
          {SORT_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>{opt.label}</option>
          ))}
        </select>
      </div>

      {sorted.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {sorted.map((product, index) => (
            <ProductCard key={product.id} product={product} index={index} placement={placement} />
          ))}
        </div>
      ) : (
        <div className="text-center py-16">
          <p className="text-gray-500 text-lg">{emptyMessage}</p>
        </div>
      )}
    </div>
  )
}
