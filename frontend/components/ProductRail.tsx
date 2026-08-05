import ProductCard from './ProductCard'
import type { Product } from '@/lib/db/schema'

interface ProductRailProps {
  title: string
  products: Product[]
  subtitle?: string
}

/** Horizontal recommendation row. Renders nothing when there is nothing to show. */
export default function ProductRail({ title, products, subtitle }: ProductRailProps) {
  if (products.length === 0) return null

  return (
    <section className="mt-16">
      <h2 className="text-2xl font-bold text-primary">{title}</h2>
      {subtitle && <p className="text-sm text-gray-500 mt-1">{subtitle}</p>}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mt-6">
        {products.map((product, index) => (
          <ProductCard key={product.id} product={product} index={index} placement="rail" />
        ))}
      </div>
    </section>
  )
}
