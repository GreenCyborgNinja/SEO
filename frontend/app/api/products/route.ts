import { NextResponse } from 'next/server'
import { MOCK_PRODUCTS } from '@/lib/supabase'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const category = searchParams.get('category')
  const limit = parseInt(searchParams.get('limit') || '20')

  let products = MOCK_PRODUCTS
  if (category) {
    products = products.filter(p => p.category === category)
  }

  return NextResponse.json({ products: products.slice(0, limit) })
}
