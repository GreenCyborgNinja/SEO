import { NextResponse } from 'next/server'
import { supabase, isConfigured, MOCK_PRODUCTS } from '@/lib/supabase'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const category = searchParams.get('category')
  const limit = parseInt(searchParams.get('limit') || '20')

  if (!isConfigured) {
    let products = MOCK_PRODUCTS
    if (category) {
      products = products.filter(p => p.category === category)
    }
    return NextResponse.json({ products: products.slice(0, limit) })
  }

  let query = supabase
    .from('products')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(limit)

  if (category) {
    query = query.eq('category', category)
  }

  const { data, error } = await query

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ products: data })
}