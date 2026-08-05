import type { Product } from '@/lib/db/schema'
import AdBanner from './AdBanner'

/**
 * Ad slots. Server components on purpose.
 *
 * These used to be client components that picked a random creative in an effect
 * — needed back when the pool came from a bundled JSON import, but it shipped
 * JS, flashed empty until hydration, and (under React 19) either sets state in
 * an effect or calls Math.random() during render.
 *
 * Now the pool is shuffled once per render in the layout and each slot takes a
 * different offset, so the three placements always show different products and
 * the rotation moves with every ISR revalidation. Zero client JS.
 */
interface SidebarProps {
  ads: Product[]
  /** Which product of the pool this slot shows. */
  offset?: number
}

function pick(ads: Product[], offset: number): Product | null {
  if (ads.length === 0) return null
  return ads[offset % ads.length]
}

export function LeftSidebar({ ads, offset = 0 }: SidebarProps) {
  const ad = pick(ads, offset)
  if (!ad) return null

  return (
    <aside className="hidden xl:block w-[200px] shrink-0" aria-label="Werbung">
      <div className="sticky top-24">
        <AdBanner product={ad} variant="skyscraper" />
      </div>
    </aside>
  )
}

export function RightSidebar({ ads, offset = 1 }: SidebarProps) {
  const ad = pick(ads, offset)
  if (!ad) return null

  return (
    <aside className="hidden lg:block w-[350px] shrink-0" aria-label="Werbung">
      <div className="sticky top-24">
        <AdBanner product={ad} variant="wide-skyscraper" />
      </div>
    </aside>
  )
}

export function BottomBanner({ ads, offset = 2 }: SidebarProps) {
  const ad = pick(ads, offset)
  if (!ad) return null

  return (
    <div className="container mx-auto px-4 py-4" aria-label="Werbung">
      <AdBanner product={ad} variant="leaderboard" />
    </div>
  )
}
