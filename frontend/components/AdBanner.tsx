import type { Product } from '@/lib/supabase'
import { formatPrice, calculateSavings } from '@/lib/utils'

interface AdBannerProps {
  product: Product
  variant?: 'skyscraper' | 'wide-skyscraper' | 'rectangle' | 'leaderboard' | 'square'
}

const variantStyles = {
  'skyscraper': { width: 'w-[160px]', height: 'min-h-[600px]', textSize: 'text-sm', priceSize: 'text-lg', badgeSize: 'text-xs' },
  'wide-skyscraper': { width: 'w-[300px]', height: 'min-h-[600px]', textSize: 'text-sm', priceSize: 'text-xl', badgeSize: 'text-xs' },
  'rectangle': { width: 'w-[300px]', height: 'min-h-[250px]', textSize: 'text-sm', priceSize: 'text-xl', badgeSize: 'text-xs' },
  'leaderboard': { width: 'w-full max-w-[728px]', height: 'min-h-[90px]', textSize: 'text-xs', priceSize: 'text-base', badgeSize: 'text-[10px]' },
  'square': { width: 'w-[300px]', height: 'min-h-[300px]', textSize: 'text-sm', priceSize: 'text-2xl', badgeSize: 'text-sm' },
}

export default function AdBanner({ product, variant = 'wide-skyscraper' }: AdBannerProps) {
  const style = variantStyles[variant]
  const savings = product.original_price
    ? calculateSavings(product.original_price, product.price)
    : 0
  const isHorizontal = variant === 'leaderboard'

  return (
    <a
      href={product.affiliate_url}
      target="_blank"
      rel="noopener noreferrer"
      className={`block ${style.width} ${style.height} bg-gradient-to-b from-[#0F172A] to-[#1E293B] rounded-xl overflow-hidden shadow-lg hover:shadow-xl hover:scale-[1.02] transition-all duration-300 group relative`}
    >
      {savings > 0 && (
        <span className={`absolute top-2 right-2 bg-accent text-white ${style.badgeSize} font-bold px-2 py-1 rounded-full z-10`}>
          -{savings}%
        </span>
      )}

      <div className={`flex ${isHorizontal ? 'flex-row items-center h-full' : 'flex-col'} p-3 h-full`}>
        {product.image_url && (
          <div className={`${isHorizontal ? 'w-16 h-16 shrink-0' : 'w-full aspect-square mb-2'} relative overflow-hidden rounded-lg bg-gray-800`}>
            <img
              src={product.image_url}
              alt=""
              className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
              loading="lazy"
            />
          </div>
        )}

        <div className={`flex flex-col ${isHorizontal ? 'ml-3 flex-1 min-w-0' : 'flex-1'}`}>
          {product.brand && (
            <span className="text-[10px] text-gray-500 uppercase tracking-wider mb-0.5">
              {product.brand}
            </span>
          )}
          <h3 className={`${style.textSize} font-semibold text-white leading-tight line-clamp-2 mb-1`}>
            {product.name}
          </h3>

          <div className={`flex items-baseline gap-1.5 ${isHorizontal ? 'mt-0' : 'mt-auto'}`}>
            <span className={`${style.priceSize} font-bold text-accent`}>
              {formatPrice(product.price)}
            </span>
            {product.original_price && (
              <span className="text-[10px] text-gray-500 line-through">
                {formatPrice(product.original_price)}
              </span>
            )}
          </div>

          <span className="mt-1 text-center bg-success text-white text-[10px] font-bold py-1 rounded-md group-hover:brightness-110 transition">
            Jetzt kaufen →
          </span>
        </div>
      </div>
    </a>
  )
}
