import Link from 'next/link'

export default function NotFound() {
  return (
    <div className="text-center py-24">
      <p className="text-6xl font-bold text-accent">404</p>
      <h1 className="mt-4 text-3xl font-bold text-primary">Seite nicht gefunden</h1>
      <p className="mt-3 text-gray-600 max-w-md mx-auto">
        Diese Seite existiert nicht (mehr). Möglicherweise ist das Produkt nicht mehr verfügbar
        oder die Adresse hat sich geändert.
      </p>
      <div className="mt-8 flex flex-wrap gap-3 justify-center">
        <Link
          href="/"
          className="bg-accent text-white px-6 py-3 rounded-xl font-semibold hover:brightness-110 transition"
        >
          Zur Startseite
        </Link>
        <Link
          href="/deals"
          className="bg-white border border-gray-300 text-gray-700 px-6 py-3 rounded-xl font-semibold hover:bg-gray-50 transition"
        >
          Aktuelle Deals ansehen
        </Link>
      </div>
    </div>
  )
}
