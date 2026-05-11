import Link from 'next/link'

export default function Footer() {
  return (
    <footer className="bg-secondary text-white mt-16">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <h3 className="text-lg font-bold mb-4 text-accent">IT-Trends</h3>
            <p className="text-gray-400 text-sm">
              Dein Partner für aktuelle Tech-Deals und Produktvergleiche.
            </p>
          </div>

          <div>
            <h4 className="font-semibold mb-4">Kategorien</h4>
            <ul className="space-y-2 text-sm text-gray-400">
              <li><Link href="/category/laptops" className="hover:text-white">Laptops</Link></li>
              <li><Link href="/category/smartphones" className="hover:text-white">Smartphones</Link></li>
              <li><Link href="/category/gaming" className="hover:text-white">Gaming</Link></li>
              <li><Link href="/category/zubehoer" className="hover:text-white">Zubehör</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold mb-4">Informationen</h4>
            <ul className="space-y-2 text-sm text-gray-400">
              <li><Link href="/about" className="hover:text-white">Über uns</Link></li>
              <li><Link href="/privacy" className="hover:text-white">Datenschutz</Link></li>
              <li><Link href="/impressum" className="hover:text-white">Impressum</Link></li>
            </ul>
          </div>

          
        </div>

        <div className="border-t border-gray-700 mt-8 pt-8 text-center text-sm text-gray-400">
          <p>© 2026 IT-Trends. Alle Rechte vorbehalten.</p>
          <p className="mt-2 text-xs">
           Als Amazon Associate verdiene ich an qualifizierten Käufen.
          </p>
        </div>
      </div>
    </footer>
  )
}