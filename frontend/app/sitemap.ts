import { MetadataRoute } from 'next'
import { supabase, isConfigured, MOCK_PRODUCTS } from '@/lib/supabase'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://it-trends.de'

  let products = []
  if (isConfigured) {
    const { data } = await supabase.from('products').select('id, updated_at')
    products = data || []
  } else {
    products = MOCK_PRODUCTS.map(p => ({ id: p.id, updated_at: p.updated_at }))
  }

  const productUrls = products.map((product: { id: string; updated_at: string }) => ({
    url: `${baseUrl}/product/${product.id}`,
    lastModified: new Date(product.updated_at),
    changeFrequency: 'weekly' as const,
    priority: 0.8,
  }))

  const categories = [
    { slug: 'laptops', priority: 0.9 },
    { slug: 'smartphones', priority: 0.9 },
    { slug: 'gaming', priority: 0.9 },
    { slug: 'zubehoer', priority: 0.8 },
  ]

  const categoryUrls = categories.map((cat) => ({
    url: `${baseUrl}/category/${cat.slug}`,
    lastModified: new Date(),
    changeFrequency: 'daily' as const,
    priority: cat.priority,
  }))

  return [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 1,
    },
    ...categoryUrls,
    ...productUrls,
  ]
}