import type { Metadata } from 'next'
import './globals.css'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import { LeftSidebar, RightSidebar, BottomBanner } from '@/components/SidebarAds'

export const metadata: Metadata = {
  title: {
    default: 'Daily Trends - Dein Tech-Shop für aktuelle Deals',
    template: '%s | Daily Trends',
  },
  description: 'Entdecke die besten IT-Deals und.tech-Produkte. Vergleiche Preise, finde günstige Angebote und kaufe über unsere Affiliate-Links.',
  keywords: ['IT Deals', 'Technik', 'Computer', 'Laptops', 'Gaming', 'Zubehör'],
  openGraph: {
    type: 'website',
    locale: 'de_DE',
    siteName: 'Daily Trends',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="de">
      <body className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1">
          <div className="flex justify-center gap-0 lg:gap-4 px-4 lg:px-8 py-8 max-w-[1600px] mx-auto">
            <LeftSidebar />
            <div className="flex-1 min-w-0">{children}</div>
            <RightSidebar />
          </div>
        </main>
        <BottomBanner />
        <Footer />
      </body>
    </html>
  )
}