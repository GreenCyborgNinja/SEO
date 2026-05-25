import type { Product } from '@/lib/supabase'
import { formatPrice, calculateSavings } from '@/lib/utils'

interface AdBannerProps {
  product: Product
  variant?: 'skyscraper' | 'wide-skyscraper' | 'rectangle' | 'leaderboard' | 'square'
}

const variantStyles = {
  'skyscraper': { width: 'w-[200px]', height: 'min-h-[700px]', textSize: 'text-sm', priceSize: 'text-xl', badgeSize: 'text-xs', imgSize: 'h-36', padding: 'p-4' },
  'wide-skyscraper': { width: 'w-[350px]', height: 'min-h-[700px]', textSize: 'text-base', priceSize: 'text-2xl', badgeSize: 'text-sm', imgSize: 'h-48', padding: 'p-5' },
  'rectangle': { width: 'w-[350px]', height: 'min-h-[280px]', textSize: 'text-sm', priceSize: 'text-xl', badgeSize: 'text-xs', imgSize: 'h-16', padding: 'p-4' },
  'leaderboard': { width: 'w-full max-w-[728px]', height: 'min-h-[100px]', textSize: 'text-sm', priceSize: 'text-lg', badgeSize: 'text-xs', imgSize: 'h-16', padding: 'p-3' },
  'square': { width: 'w-[400px]', height: 'min-h-[400px]', textSize: 'text-base', priceSize: 'text-3xl', badgeSize: 'text-base', imgSize: 'h-56', padding: 'p-6' },
}

export default function AdBanner({ product, variant = 'wide-skyscraper' }: AdBannerProps) {
  const style = variantStyles[variant]
  const savings = product.original_price
    ? calculateSavings(product.original_price, product.price)
    : 0
  const isHorizontal = variant === 'leaderboard' || variant === 'rectangle'

  return (
    <a
      href={product.affiliate_url}
      target="_blank"
      rel="noopener noreferrer"
      className={`block ${style.width} ${style.height} bg-gradient-to-b from-[#0F172A] to-[#1E293B] rounded-xl overflow-hidden shadow-lg hover:shadow-xl hover:scale-[1.02] transition-all duration-300 group relative`}
    >
      {savings > 0 && (
        <span className={`absolute top-3 right-3 bg-accent text-white ${style.badgeSize} font-bold px-3 py-1.5 rounded-full z-10 shadow-lg`}>
          -{savings}%
        </span>
      )}

      <div className={`flex ${isHorizontal ? 'flex-row items-center h-full' : 'flex-col'} ${style.padding} h-full gap-3`}>
        {product.image_url && (
          <div className={`${isHorizontal ? 'w-20 h-20 shrink-0' : `w-full ${style.imgSize} shrink-0`} relative overflow-hidden rounded-xl bg-gray-800 ring-1 ring-white/10`}>
            <img
              src={product.image_url}
              alt=""
              className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
              loading="lazy"
            />
          </div>
        )}

        <div className={`flex flex-col ${isHorizontal ? 'flex-1 min-w-0' : 'flex-1'} gap-1.5`}>
          {product.brand && (
            <span className="text-[11px] text-gray-400 uppercase tracking-widest font-medium">
              {product.brand}
            </span>
          )}
          <h3 className={`${style.textSize} font-semibold text-white leading-snug line-clamp-2`}>
            {product.name}
          </h3>

          <div className={`flex items-baseline gap-2 mt-auto pt-1`}>
            <span className={`${style.priceSize} font-bold text-accent`}>
              {formatPrice(product.price)}
            </span>
            {product.original_price && product.original_price > product.price && (
              <span className="text-xs text-gray-500 line-through">
                {formatPrice(product.original_price)}
              </span>
            )}
          </div>

          <span className="block mt-2 text-center bg-success text-white text-xs font-bold py-2.5 rounded-lg group-hover:brightness-110 transition shadow-md">
            Jetzt kaufen →
          </span>
        </div>
      </div>
    </a>
  )
}
