import type { Metadata } from 'next'
import './globals.css'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import Analytics from '@/components/Analytics'
import MemberBanner from '@/components/MemberBanner'
import { LeftSidebar, RightSidebar, BottomBanner } from '@/components/SidebarAds'
import { getCuratedAdProducts } from '@/lib/ads'
import { getCategoriesWithCounts } from '@/lib/db/products'
import { SITE_URL } from '@/lib/site'

export const metadata: Metadata = {
  // Without metadataBase, Open-Graph images and canonicals cannot resolve to
  // absolute URLs — Next silently drops them.
  metadataBase: new URL(SITE_URL),
  title: {
    default: 'Daily Trends – Dein Tech-Shop für aktuelle Deals',
    template: '%s | Daily Trends',
  },
  description:
    'Entdecke die besten IT-Deals und Tech-Produkte. Vergleiche Preise, finde günstige Angebote und kaufe über unsere Affiliate-Links.',
  keywords: ['IT Deals', 'Technik', 'Computer', 'Laptops', 'Gaming', 'Zubehör'],
  alternates: { canonical: '/' },
  openGraph: {
    type: 'website',
    locale: 'de_DE',
    siteName: 'Daily Trends',
    url: '/',
  },
}

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  // Loaded server-side and handed down as props: the sidebars are client
  // components and can no longer read the catalogue themselves.
  const [ads, categories] = await Promise.all([getCuratedAdProducts(), getCategoriesWithCounts()])
  const navCategories = categories.filter((category) => category.product_count > 0)

  return (
    <html lang="de">
      <body className="min-h-screen flex flex-col">
        <Header categories={navCategories} />
        <MemberBanner />
        <main className="flex-1">
          <div className="flex justify-center gap-0 lg:gap-4 px-4 lg:px-8 py-8 max-w-[1800px] mx-auto">
            <LeftSidebar ads={ads} />
            <div className="flex-1 min-w-0">{children}</div>
            <RightSidebar ads={ads} />
          </div>
        </main>
        <BottomBanner ads={ads} />
        <Footer categories={navCategories} />
        <Analytics />
      </body>
    </html>
  )
}
