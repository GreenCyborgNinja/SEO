/**
 * Canonical site URL. Local by default — the shop is documented as a local
 * deployment; set NEXT_PUBLIC_SITE_URL when it ever gets a public domain.
 */
export const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000').replace(/\/$/, '')

export const SITE_NAME = 'Daily Trends'

export function absoluteUrl(path: string): string {
  return `${SITE_URL}${path.startsWith('/') ? path : `/${path}`}`
}
