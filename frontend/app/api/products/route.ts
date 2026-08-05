import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { z } from 'zod'
import { getAllProducts, getProductsByCategory } from '@/lib/db/products'

const querySchema = z.object({
  category: z.string().trim().max(64).optional(),
  limit: z.coerce.number().int().min(1).max(200).default(20),
})

export async function GET(request: NextRequest) {
  const parsed = querySchema.safeParse(Object.fromEntries(request.nextUrl.searchParams))
  if (!parsed.success) {
    return NextResponse.json(
      { error: 'Ungültige Parameter', issues: parsed.error.issues },
      { status: 400 }
    )
  }

  const { category, limit } = parsed.data
  const products = category
    ? (await getProductsByCategory(category)).slice(0, limit)
    : await getAllProducts({ limit })

  return NextResponse.json({ products, count: products.length })
}
