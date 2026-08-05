'use client'

import { useEffect, useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { formatPrice } from '@/lib/utils'

interface RailProduct {
  id: string
  name: string
  price: number
  image_url: string | null
  category: string | null
}

/**
 * Personalised recommendations for logged-in users. Client-side on purpose: the
 * home page stays statically cached (ISR) and only this strip is per-user.
 */
export default function PersonalRail() {
  const [products, setProducts] = useState<RailProduct[]>([])

  useEffect(() => {
    let active = true
    fetch('/api/me/recommendations')
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (active && data?.products) setProducts(data.products)
      })
      .catch(() => {})
    return () => {
      active = false
    }
  }, [])

  if (products.length === 0) return null

  return (
    <section className="mb-12">
      <h2 className="text-2xl font-bold text-primary">Für dich empfohlen</h2>
      <p className="text-sm text-gray-500 mt-1">
        Basierend auf deiner Merkliste und den Produkten, die du angesehen hast.
      </p>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mt-6">
        {products.map((product) => (
          <Link
            key={product.id}
            href={`/product/${product.id}`}
            className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-lg transition group"
          >
            <div className="relative aspect-square bg-gray-100">
              {product.image_url && (
                <Image
                  src={product.image_url}
                  alt={product.name}
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-300"
                  sizes="(max-width: 1024px) 50vw, 25vw"
                />
              )}
            </div>
            <div className="p-3">
              <p className="text-sm font-medium text-gray-900 line-clamp-2">{product.name}</p>
              <p className="price-tag text-accent font-bold mt-1">{formatPrice(product.price)}</p>
            </div>
          </Link>
        ))}
      </div>
    </section>
  )
}
