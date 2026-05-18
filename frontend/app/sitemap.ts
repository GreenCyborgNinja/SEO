import { MetadataRoute } from 'next'
import { supabase, isConfigured, isRapidAPIConfigured, searchProducts } from '@/lib/supabase'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://daily-trends.de'

  let productIds: { id: string; updated_at: string }[] = []

  if (isConfigured) {
    const { data } = await supabase.from('products').select('id, updated_at')
    productIds = (data || []).map((p: any) => ({ id: p.id, updated_at: p.updated_at }))
  } else if (isRapidAPIConfigured) {
    const queries = ['Laptop', 'Smartphone', 'Gaming', 'Kopfhörer', 'Tablet']
    for (const q of queries) {
      try {
        const result = await searchProducts({ query: q, country: 'DE', page: 1 })
        for (const p of result.products) {
          if (!productIds.find((x) => x.id === p.id)) {
            productIds.push({ id: p.id, updated_at: new Date().toISOString() })
          }
        }
      } catch {
        // continue with what we have
      }
    }
  }

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
