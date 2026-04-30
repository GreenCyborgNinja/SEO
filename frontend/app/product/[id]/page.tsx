import { Metadata } from 'next'
import Image from 'next/image'
import { notFound } from 'next/navigation'
import { supabase, isConfigured, MOCK_PRODUCTS, type Product } from '@/lib/supabase'
import { formatPrice, calculateSavings } from '@/lib/utils'

interface PageProps {
  params: { id: string }
}

async function getProduct(id: string): Promise<Product | null> {
  if (!isConfigured) {
    return MOCK_PRODUCTS.find(p => p.id === id) || null
  }
  const { data } = await supabase
    .from('products')
    .select('*')
    .eq('id', id)
    .single()

  return data
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const product = await getProduct(params.id)
  if (!product) return { title: 'Produkt nicht gefunden' }

  return {
    title: product.name,
    description: product.seo_description || product.description || `Kaufe ${product.name} zum besten Preis bei IT-Trends.`,
    openGraph: {
      title: product.name,
      description: product.seo_description || `Jetzt ${product.name} günstig kaufen`,
      images: product.image_url ? [product.image_url] : [],
    },
  }
}

function generateJsonLd(product: Product) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: product.name,
    description: product.description || product.seo_description,
    image: product.image_url,
    offers: {
      '@type': 'Offer',
      price: product.price,
      priceCurrency: 'EUR',
      availability: 'https://schema.org/InStock',
      url: product.affiliate_url,
    },
    aggregateRating: product.rating
      ? {
          '@type': 'AggregateRating',
          ratingValue: product.rating,
          reviewCount: product.review_count,
        }
      : undefined,
  }
}

export const revalidate = 3600

export default async function ProductPage({ params }: PageProps) {
  const product = await getProduct(params.id)
  if (!product) notFound()

  const savings = product.original_price
    ? calculateSavings(product.original_price, product.price)
    : 0

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(generateJsonLd(product)) }}
      />
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          <div className="relative aspect-square bg-white rounded-xl overflow-hidden shadow-lg">
            {product.image_url ? (
              <Image
                src={product.image_url}
                alt={product.name}
                fill
                className="object-cover"
                priority
                sizes="(max-width: 1024px) 100vw, 50vw"
              />
            ) : (
              <div className="flex items-center justify-center h-full text-gray-400">
                <svg className="w-32 h-32" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
            )}
            {savings > 0 && (
              <span className="absolute top-4 right-4 bg-success text-white text-lg font-bold px-4 py-2 rounded-full">
                -{savings}% sparen
              </span>
            )}
          </div>

          <div>
            {product.category && (
              <span className="text-sm text-gray-500 uppercase tracking-wide">
                {product.category}
              </span>
            )}
            {product.brand && (
              <span className="text-sm text-gray-400 ml-2">• {product.brand}</span>
            )}

            <h1 className="text-3xl font-bold text-primary mt-2">{product.name}</h1>

            {product.rating && (
              <div className="flex items-center gap-3 mt-4">
                <div className="flex gap-1">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <svg
                      key={star}
                      className={`w-5 h-5 ${star <= Math.round(product.rating!) ? 'text-yellow-400' : 'text-gray-300'}`}
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                  ))}
                </div>
                <span className="text-gray-600">{product.rating} ({product.review_count} Bewertungen)</span>
              </div>
            )}

            <div className="mt-6 flex items-baseline gap-4">
              <span className="price-tag text-4xl font-bold text-accent">
                {formatPrice(product.price)}
              </span>
              {product.original_price && (
                <>
                  <span className="price-tag text-xl text-gray-400 line-through">
                    {formatPrice(product.original_price)}
                  </span>
                  <span className="text-success font-medium">
                    Du sparst {formatPrice(product.original_price - product.price)}
                  </span>
                </>
              )}
            </div>

            <a
              href={product.affiliate_url}
              target="_blank"
              rel="noopener noreferrer"
              className="block mt-8 w-full bg-accent text-white text-center py-4 rounded-xl font-bold text-lg hover:brightness-110 transition shadow-lg"
            >
              Jetzt bei Amazon kaufen →
            </a>

            <p className="mt-4 text-sm text-gray-500 text-center">
              *Affiliate-Link – wir erhalten eine Provision ohne Zusatzkosten für dich.
            </p>

            {(product.description || product.seo_description) && (
              <div className="mt-8">
                <h2 className="text-xl font-semibold mb-3">Produktbeschreibung</h2>
                <p className="text-gray-600 leading-relaxed">
                  {product.seo_description || product.description}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  )
}