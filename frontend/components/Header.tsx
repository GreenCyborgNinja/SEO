import Link from 'next/link'
import SearchBar from './SearchBar'
import UserMenu from './UserMenu'
import type { CategoryWithCount } from '@/lib/db/products'

interface HeaderProps {
  /** Populated categories only — the nav must never link into an empty page. */
  categories: CategoryWithCount[]
}

export default function Header({ categories }: HeaderProps) {
  const navCategories = categories.slice(0, 4)

  return (
    <header className="bg-primary text-white sticky top-0 z-50 shadow-lg">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between gap-4">
          <Link href="/" className="flex items-center gap-2 shrink-0">
            <div className="w-10 h-10 bg-accent rounded-lg flex items-center justify-center font-bold text-xl">
              IT
            </div>
            <span className="text-xl font-bold hidden sm:block">Daily Trends</span>
          </Link>

          <nav className="hidden md:flex items-center gap-6">
            {navCategories.map((category) => (
              <Link
                key={category.slug}
                href={`/category/${category.slug}`}
                className="hover:text-accent transition-colors text-sm font-medium"
              >
                {category.name}
              </Link>
            ))}
            <Link
              href="/deals"
              className="bg-accent text-white px-3 py-1 rounded-full text-sm font-bold hover:brightness-110 transition"
            >
              Deals
            </Link>
          </nav>

          <div className="flex-1 max-w-md">
            <SearchBar />
          </div>

          <UserMenu />
        </div>
      </div>
    </header>
  )
}
