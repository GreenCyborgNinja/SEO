import 'server-only'

import { curatedAdsPath, readSharedJson } from './db/paths.mjs'
import { getDeals, getProductsByIds, type Product } from './db/products'

/**
 * Curated ad pool, shared with the Pillow creative generator through
 * shared/curated-ads.json. Read at runtime rather than imported, so the file can
 * live outside the Next project root without bundler gymnastics.
 */
export function getCuratedIds(): string[] {
  return readSharedJson(curatedAdsPath).asins as string[]
}

/**
 * The banner pool. Loaded on the server and passed into the sidebar components
 * as props — they used to import the product JSON directly from a client
 * component, which stopped working the moment the catalogue moved into SQLite.
 */
export async function getCuratedAdProducts(): Promise<Product[]> {
  const curated = await getProductsByIds(getCuratedIds())
  if (curated.length > 0) return shuffle(curated)
  // Curated ASINs can vanish from the catalogue after a re-scrape.
  return shuffle((await getDeals()).slice(0, 15))
}

/**
 * Shuffled server-side, once per (cached) layout render — that is what rotates
 * the creatives between ISR revalidations. Doing it here keeps the ad slots
 * themselves pure server components with no client JS.
 */
function shuffle<T>(items: T[]): T[] {
  const result = [...items]
  for (let i = result.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[result[i], result[j]] = [result[j], result[i]]
  }
  return result
}
