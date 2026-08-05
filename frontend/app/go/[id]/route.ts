import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { getProductById } from '@/lib/db/products'
import { getSessionId, recordEvent } from '@/lib/db/events'
import { auth } from '@/lib/auth'
import { buildAffiliateUrl, type Placement } from '@/lib/affiliate'

export const dynamic = 'force-dynamic'

const VALID_PLACEMENTS: Placement[] = [
  'card', 'detail', 'rail', 'search',
  'ad-skyscraper', 'ad-wide-skyscraper', 'ad-leaderboard', 'ad-rectangle', 'ad-square',
]

/**
 * Affiliate click tracker: logs the click, then 302s to the tagged Amazon URL.
 * Every outbound link on the site points here, which is what feeds CTR and the
 * CAC dashboard. A logging failure must still result in a working redirect.
 */
export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const product = await getProductById(id)
  if (!product) return NextResponse.json({ error: 'Produkt nicht gefunden' }, { status: 404 })

  const rawSrc = request.nextUrl.searchParams.get('src')
  const placement = (VALID_PLACEMENTS as string[]).includes(rawSrc ?? '') ? (rawSrc as Placement) : 'card'

  try {
    const session = await auth()
    recordEvent({
      type: 'click',
      session_id: await getSessionId(),
      product_id: product.id,
      category: product.category,
      src: placement,
      user_id: session?.user?.id ?? null,
    })
  } catch (error) {
    console.error('[go] click not recorded', error)
  }

  return NextResponse.redirect(buildAffiliateUrl(product, { placement }), 302)
}
