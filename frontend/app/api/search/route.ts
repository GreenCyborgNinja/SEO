import { NextResponse } from 'next/server'
import { MOCK_PRODUCTS } from '@/lib/supabase'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const query = searchParams.get('q') || ''

  if (query.length < 2) {
    return NextResponse.json({ products: [] })
  }

  const results = MOCK_PRODUCTS.filter(p =>
    p.name.toLowerCase().includes(query.toLowerCase()) ||
    (p.description && p.description.toLowerCase().includes(query.toLowerCase()))
  ).slice(0, 10)

  return NextResponse.json({
    products: results.map(p => ({ id: p.id, name: p.name, price: p.price, category: p.category })),
  })
}
