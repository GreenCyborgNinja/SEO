import Image from 'next/image'
import Link from 'next/link'
import { formatPrice, calculateSavings, cn } from '@/lib/utils'
import type { Product } from '@/lib/supabase'

interface ProductCardProps {
  product: Product
  index?: number
}

function StarRating({ rating }: { rating: number }) {
  return (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map((star) => (
        <svg
          key={star}
          className={cn('w-4 h-4', star <= Math.round(rating) ? 'text-yellow-400' : 'text-gray-300')}
          fill="currentColor"
          viewBox="0 0 20 20"
        >
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
        </svg>
      ))}
    </div>
  )
}

export default function ProductCard({ product, index = 0 }: ProductCardProps) {
  const savings = product.original_price
    ? calculateSavings(product.original_price, product.price)
    : 0

  return (
    <article
      className={cn(
        'bg-white rounded-xl shadow-md overflow-hidden hover:shadow-xl hover:-translate-y-1 transition-all duration-300 opacity-0 animate-fade-in-up',
        `stagger-${Math.min(index + 1, 4)}`
      )}
    >
      <Link href={`/product/${product.id}`} className="block">
        <div className="relative aspect-square bg-gray-100">
          {product.image_url ? (
            <Image
              src={product.image_url}
              alt={product.name}
              fill
              className="object-cover"
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
            />
          ) : (
            <div className="flex items-center justify-center h-full text-gray-400">
              <svg className="w-16 h-16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
          )}
          {savings > 0 && (
            <span className="absolute top-3 right-3 bg-success text-white text-xs font-bold px-2 py-1 rounded-full">
              -{savings}%
            </span>
          )}
        </div>
      </Link>

      <div className="p-4">
        {product.category && (
          <span className="text-xs text-gray-500 uppercase tracking-wide">{product.category}</span>
        )}
        <Link href={`/product/${product.id}`}>
          <h3 className="font-semibold text-gray-900 mt-1 line-clamp-2 hover:text-accent transition-colors">
            {product.name}
          </h3>
        </Link>

        {product.rating && (
          <div className="flex items-center gap-2 mt-2">
            <StarRating rating={product.rating} />
            <span className="text-xs text-gray-500">({product.review_count})</span>
          </div>
        )}

        <div className="mt-3 flex items-baseline gap-2">
          <span className="price-tag text-xl font-bold text-accent">
            {formatPrice(product.price)}
          </span>
          {product.original_price && (
            <span className="price-tag text-sm text-gray-400 line-through">
              {formatPrice(product.original_price)}
            </span>
          )}
        </div>

        <a
          href={product.affiliate_url}
          target="_blank"
          rel="noopener noreferrer"
          className="block mt-3 w-full bg-accent text-white text-center py-2 rounded-lg font-medium hover:brightness-110 transition"
        >
          Zum Shop
        </a>
      </div>
    </article>
  )
}