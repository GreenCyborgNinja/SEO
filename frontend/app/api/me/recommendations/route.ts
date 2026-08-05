import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { getPersonalizedProducts } from '@/lib/db/recommendations'

export const dynamic = 'force-dynamic'

export async function GET() {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ products: [] })

  const products = await getPersonalizedProducts(session.user.id, 4)

  return NextResponse.json({
    products: products.map((product) => ({
      id: product.id,
      name: product.name,
      price: product.price,
      image_url: product.image_url,
      category: product.category,
    })),
  })
}
