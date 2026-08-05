import type { MetadataRoute } from 'next'
import { SITE_URL } from '@/lib/site'

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        // /go/* are affiliate redirects, the rest is private or has no content value.
        disallow: ['/go/', '/api/', '/admin', '/account', '/login', '/register', '/newsletter/'],
      },
    ],
    sitemap: `${SITE_URL}/sitemap.xml`,
    host: SITE_URL,
  }
}
