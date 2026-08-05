'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

interface SearchResult {
  id: string
  name: string
  price: number
  category: string | null
}

export default function SearchBar() {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<SearchResult[]>([])
  const [isOpen, setIsOpen] = useState(false)
  const wrapperRef = useRef<HTMLDivElement>(null)
  const router = useRouter()

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  useEffect(() => {
    const controller = new AbortController()

    const run = async () => {
      if (query.length < 2) {
        setResults([])
        return
      }
      try {
        const res = await fetch(`/api/search?q=${encodeURIComponent(query)}`, {
          signal: controller.signal,
        })
        const data = await res.json()
        setResults(data.products || [])
        setIsOpen(true)
      } catch {
        // Aborted or offline — keep the previous list rather than flashing empty.
      }
    }

    const debounce = setTimeout(run, 300)
    return () => {
      clearTimeout(debounce)
      controller.abort()
    }
  }, [query])

  const submit = (event: React.FormEvent) => {
    event.preventDefault()
    if (query.trim().length < 2) return
    setIsOpen(false)
    router.push(`/search?q=${encodeURIComponent(query.trim())}`)
  }

  return (
    <div ref={wrapperRef} className="relative w-full">
      <form onSubmit={submit} role="search">
        <input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Produkte suchen..."
          aria-label="Produkte suchen"
          className="w-full px-4 py-2 rounded-lg bg-secondary border border-gray-600 text-white placeholder-gray-400 focus:outline-none focus:border-accent"
        />
      </form>
      {isOpen && results.length > 0 && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-lg shadow-xl overflow-hidden z-50">
          {results.map((product) => (
            <Link
              key={product.id}
              href={`/product/${product.id}`}
              className="block px-4 py-3 hover:bg-gray-50 border-b last:border-b-0"
              onClick={() => setIsOpen(false)}
            >
              <div className="font-medium text-gray-900 line-clamp-1">{product.name}</div>
              <div className="text-sm text-gray-500">
                {product.category} •{' '}
                <span className="price-tag font-medium">€{product.price.toFixed(2)}</span>
              </div>
            </Link>
          ))}
          <Link
            href={`/search?q=${encodeURIComponent(query.trim())}`}
            className="block px-4 py-3 text-sm font-medium text-accent hover:bg-gray-50"
            onClick={() => setIsOpen(false)}
          >
            Alle Ergebnisse für „{query.trim()}“ anzeigen →
          </Link>
        </div>
      )}
    </div>
  )
}
