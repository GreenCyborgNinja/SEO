import { NextResponse } from 'next/server'
import { supabase, isConfigured, MOCK_PRODUCTS } from '@/lib/supabase'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const query = searchParams.get('q') || ''

  if (query.length < 2) {
    return NextResponse.json({ products: [] })
  }

  if (!isConfigured) {
    const filtered = MOCK_PRODUCTS.filter(p =>
      p.name.toLowerCase().includes(query.toLowerCase()) ||
      p.description?.toLowerCase().includes(query.toLowerCase())
    ).slice(0, 10)
    return NextResponse.json({ products: filtered })
  }

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