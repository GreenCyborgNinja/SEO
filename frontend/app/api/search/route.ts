import { NextResponse } from 'next/server'
import { supabase, isConfigured, isRapidAPIConfigured, searchProducts } from '@/lib/supabase'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const query = searchParams.get('q') || ''

  if (query.length < 2) {
    return NextResponse.json({ products: [] })
  }

  if (isConfigured) {
    const { data, error } = await supabase
      .from('products')
      .select('id, name, price, category')
      .or(`name.ilike.%${query}%,description.ilike.%${query}%`)
      .limit(10)

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ products: data })
  }

  if (isRapidAPIConfigured) {
    const result = await searchProducts({ query, country: 'DE', page: 1, sort_by: 'RELEVANCE' })
    return NextResponse.json({
      products: result.products.slice(0, 10).map((p) => ({
        id: p.id,
        name: p.name,
        price: p.price,
        category: p.category,
      })),
    })
  }

  return NextResponse.json({ products: [] })
}
