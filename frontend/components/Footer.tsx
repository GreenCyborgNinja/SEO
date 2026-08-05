import Link from 'next/link'
import NewsletterForm from './NewsletterForm'
import type { CategoryWithCount } from '@/lib/db/products'

interface FooterProps {
  categories: CategoryWithCount[]
}

export default function Footer({ categories }: FooterProps) {
  return (
    <footer className="bg-secondary text-white mt-16">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <h3 className="text-lg font-bold mb-4 text-accent">Daily Trends</h3>
            <p className="text-gray-400 text-sm">
              Dein Partner für aktuelle Tech-Deals und Produktvergleiche.
            </p>
          </div>

          <div>
            <h4 className="font-semibold mb-4">Kategorien</h4>
            <ul className="space-y-2 text-sm text-gray-400">
              {categories.slice(0, 5).map((category) => (
                <li key={category.slug}>
                  <Link href={`/category/${category.slug}`} className="hover:text-white">
                    {category.name}
                  </Link>
                </li>
              ))}
              <li>
                <Link href="/deals" className="hover:text-accent font-semibold">
                  Deals &amp; Angebote
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold mb-4">Informationen</h4>
            <ul className="space-y-2 text-sm text-gray-400">
              <li><Link href="/about" className="hover:text-white">Über uns</Link></li>
              <li><Link href="/contact" className="hover:text-white">Kontakt</Link></li>
              <li><Link href="/privacy" className="hover:text-white">Datenschutz</Link></li>
              <li><Link href="/impressum" className="hover:text-white">Impressum</Link></li>
              <li><Link href="/account" className="hover:text-white">Mein Konto</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold mb-4">Newsletter</h4>
            <p className="text-gray-400 text-sm mb-3">
              Deal-Alerts und Member-Rabatte per E-Mail. Jederzeit abbestellbar.
            </p>
            <NewsletterForm source="footer" />
          </div>
        </div>

        <div className="border-t border-gray-700 mt-8 pt-8 text-center text-sm text-gray-400">
          <p>© 2026 Daily Trends. Alle Rechte vorbehalten.</p>
          <p className="mt-2 text-xs">
            Als Amazon-Partner verdienen wir an qualifizierten Käufen. Alle Produktlinks sind
            Affiliate-Links – für dich entstehen dadurch keine Zusatzkosten.
          </p>
        </div>
      </div>
    </footer>
  )
}
