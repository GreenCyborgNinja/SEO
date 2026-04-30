import type { Metadata } from 'next'
import './globals.css'
import Header from '@/components/Header'
import Footer from '@/components/Footer'

export const metadata: Metadata = {
  title: {
    default: 'IT-Trends - Dein Tech-Shop für aktuelle Deals',
    template: '%s | IT-Trends',
  },
  description: 'Entdecke die besten IT-Deals und.tech-Produkte. Vergleiche Preise, finde günstige Angebote und kaufe über unsere Affiliate-Links.',
  keywords: ['IT Deals', 'Technik', 'Computer', 'Laptops', 'Gaming', 'Zubehör'],
  openGraph: {
    type: 'website',
    locale: 'de_DE',
    siteName: 'IT-Trends',
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
        <main className="flex-1">{children}</main>
        <Footer />
      </body>
    </html>
  )
}