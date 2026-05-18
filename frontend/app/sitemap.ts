import { MetadataRoute } from 'next'
import { MOCK_PRODUCTS } from '@/lib/supabase'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://daily-trends.de'

  const productIds = MOCK_PRODUCTS.map((p) => ({ id: p.id, updated_at: p.updated_at }))

  const productUrls = productIds.map((product) => ({
    url: `${baseUrl}/product/${product.id}`,
    lastModified: new Date(product.updated_at),
    changeFrequency: 'weekly' as const,
    priority: 0.8,
  }))

  const categoryUrls = [
    { slug: 'laptops', priority: 0.9 },
    { slug: 'smartphones', priority: 0.9 },
    { slug: 'gaming', priority: 0.9 },
    { slug: 'zubehoer', priority: 0.8 },
    { slug: 'buecher', priority: 0.8 },
  ].map((cat) => ({
    url: `${baseUrl}/category/${cat.slug}`,
    lastModified: new Date(),
    changeFrequency: 'daily' as const,
    priority: cat.priority,
  }))

  return [
    { url: baseUrl, lastModified: new Date(), changeFrequency: 'daily', priority: 1 },
    { url: `${baseUrl}/deals`, lastModified: new Date(), changeFrequency: 'daily', priority: 0.9 },
    ...categoryUrls,
    ...productUrls,
  ]
}
