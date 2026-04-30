import Link from 'next/link'
import SearchBar from './SearchBar'

const categories = [
  { name: 'Laptops', slug: 'laptops' },
  { name: 'Smartphones', slug: 'smartphones' },
  { name: 'Gaming', slug: 'gaming' },
  { name: 'Zubehör', slug: 'zubehoer' },
]

export default function Header() {
  return (
    <header className="bg-primary text-white sticky top-0 z-50 shadow-lg">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between gap-4">
          <Link href="/" className="flex items-center gap-2 shrink-0">
            <div className="w-10 h-10 bg-accent rounded-lg flex items-center justify-center font-bold text-xl">
              IT
            </div>
            <span className="text-xl font-bold hidden sm:block">IT-Trends</span>
          </Link>

          <nav className="hidden md:flex items-center gap-6">
            {categories.map((cat) => (
              <Link
                key={cat.slug}
                href={`/category/${cat.slug}`}
                className="hover:text-accent transition-colors text-sm font-medium"
              >
                {cat.name}
              </Link>
            ))}
          </nav>

          <div className="flex-1 max-w-md">
            <SearchBar />
          </div>
        </div>
      </div>
    </header>
  )
}