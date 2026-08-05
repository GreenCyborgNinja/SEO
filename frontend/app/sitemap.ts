import type { MetadataRoute } from 'next'
import { getAllProductIds, getCategoriesWithCounts } from '@/lib/db/products'
import { SITE_URL } from '@/lib/site'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [productIds, categories] = await Promise.all([getAllProductIds(), getCategoriesWithCounts()])

  const productUrls = productIds.map((product) => ({
    url: `${SITE_URL}/product/${product.id}`,
    lastModified: new Date(product.updated_at),
    changeFrequency: 'weekly' as const,
    priority: 0.8,
  }))

  // Only categories that actually have products — empty pages must not be indexed.
  const categoryUrls = categories
    .filter((category) => category.product_count > 0)
    .map((category) => ({
      url: `${SITE_URL}/category/${category.slug}`,
      lastModified: new Date(),
      changeFrequency: 'daily' as const,
      priority: 0.9,
    }))

  const staticUrls = [
    { path: '', priority: 1, changeFrequency: 'daily' as const },
    { path: '/deals', priority: 0.9, changeFrequency: 'daily' as const },
    { path: '/about', priority: 0.4, changeFrequency: 'monthly' as const },
    { path: '/contact', priority: 0.4, changeFrequency: 'monthly' as const },
    { path: '/privacy', priority: 0.3, changeFrequency: 'yearly' as const },
    { path: '/impressum', priority: 0.3, changeFrequency: 'yearly' as const },
  ].map((entry) => ({
    url: `${SITE_URL}${entry.path}`,
    lastModified: new Date(),
    changeFrequency: entry.changeFrequency,
    priority: entry.priority,
  }))

  return [...staticUrls, ...categoryUrls, ...productUrls]
}
