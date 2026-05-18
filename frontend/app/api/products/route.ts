import { NextResponse } from 'next/server'
import { supabase, isConfigured, isRapidAPIConfigured, searchProducts } from '@/lib/supabase'

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

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ products: data })
  }

  if (isRapidAPIConfigured) {
    const query = category || 'tech'
    const result = await searchProducts({ query, country: 'DE', page: 1, sort_by: 'RELEVANCE' })
    return NextResponse.json({ products: result.products.slice(0, limit) })
  }

  return NextResponse.json({ products: [] })
}
