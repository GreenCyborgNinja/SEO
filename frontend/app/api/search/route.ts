import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { z } from 'zod'
import { searchProducts } from '@/lib/db/products'

const querySchema = z.object({
  q: z.string().trim().min(2).max(120),
})

/** Feeds the header search dropdown. */
export async function GET(request: NextRequest) {
  const parsed = querySchema.safeParse({ q: request.nextUrl.searchParams.get('q') ?? '' })
  if (!parsed.success) return NextResponse.json({ products: [] })

  const products = await searchProducts(parsed.data.q, 10)

  return NextResponse.json({
    products: products.map((product) => ({
      id: product.id,
      name: product.name,
      price: product.price,
      category: product.category,
    })),
  })
}
