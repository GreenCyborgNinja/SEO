import { NextResponse } from 'next/server'
import { supabase, isConfigured, MOCK_PRODUCTS, searchProducts } from '@/lib/supabase'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const category = searchParams.get('category')
  const limit = parseInt(searchParams.get('limit') || '20')

  if (isConfigured) {
    let query = supabase
      .from('products')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(limit)

    if (category) {
      query = query.eq('category', category)
    }

    const { data, error } = await query
    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    if (data && data.length > 0) return NextResponse.json({ products: data })
  }

  if (category) {
    const filtered = MOCK_PRODUCTS.filter(p => p.category === category).slice(0, limit)
    if (filtered.length > 0) return NextResponse.json({ products: filtered })
  }

  const result = await searchProducts({ query: category || 'tech', country: 'DE', page: 1 })
  if (result.products.length > 0) return NextResponse.json({ products: result.products.slice(0, limit) })

  return NextResponse.json({ products: MOCK_PRODUCTS.slice(0, limit) })
}
