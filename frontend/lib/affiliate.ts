/**
 * Affiliate link handling.
 *
 * Two things were missing before: the partner tag (without it Amazon pays no
 * commission at all) and any way to tell which placement produced a click. Both
 * are added here:
 *
 *   buildAffiliateUrl() → the real outbound URL, tagged + attributed
 *   buildGoUrl()        → internal /go/<asin> redirect that logs the click first
 *
 * Crawlers get the tagged Amazon URL (JSON-LD, canonical data), humans get /go.
 */

/** Where a click came from. Ends up in events.src and in Amazon's ascsubtag. */
export type Placement =
  | 'card'
  | 'detail'
  | 'rail'
  | 'search'
  | 'ad-skyscraper'
  | 'ad-wide-skyscraper'
  | 'ad-leaderboard'
  | 'ad-rectangle'
  | 'ad-square'

export const PARTNER_TAG = process.env.AMAZON_PARTNER_TAG?.trim() || ''

let warnedAboutMissingTag = false

function warnOnce() {
  if (warnedAboutMissingTag || process.env.NODE_ENV === 'production') return
  warnedAboutMissingTag = true
  console.warn(
    '[affiliate] AMAZON_PARTNER_TAG is not set — outbound links carry no partner tag, ' +
      'so no commission is tracked. Set it in .env.local (e.g. AMAZON_PARTNER_TAG=dailytrends-21).'
  )
}

function today() {
  return new Date().toISOString().slice(0, 10).replace(/-/g, '')
}

/**
 * Adds the partner tag and a placement subtag to an Amazon product URL.
 * `ascsubtag` is Amazon's free-form attribution field: it shows up in the
 * PartnerNet reports, so we can see which placement actually converts.
 */
export function buildAffiliateUrl(
  product: { external_id: string; affiliate_url: string },
  options: { placement?: Placement } = {}
): string {
  const base = product.affiliate_url || `https://www.amazon.de/dp/${product.external_id}`
  if (!PARTNER_TAG) {
    warnOnce()
    return base
  }

  try {
    const url = new URL(base)
    url.searchParams.set('tag', PARTNER_TAG)
    url.searchParams.set('linkCode', 'ogi')
    if (options.placement) {
      url.searchParams.set('ascsubtag', `dt-${options.placement}-${today()}`)
    }
    return url.toString()
  } catch {
    return base
  }
}

/**
 * Internal click-tracking redirect. Kept relative so it works on localhost and
 * any future domain without configuration.
 */
export function buildGoUrl(product: { id: string }, placement: Placement): string {
  return `/go/${encodeURIComponent(product.id)}?src=${encodeURIComponent(placement)}`
}

/** Outbound links must be nofollow + sponsored (Google requirement for affiliate links). */
export const AFFILIATE_REL = 'nofollow sponsored noopener'
